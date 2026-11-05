import { Type } from "typebox";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readlinkSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { createServer, type Server, type Socket } from "node:net";
import { tmpdir } from "node:os";
import { basename, join, relative, resolve } from "node:path";

type NvimBridgePayload = {
	type?: "prompt" | "ping" | "ask" | "context";
	message?: string;
	images?: unknown[];
	question?: string;
	file?: string;
	cwd?: string;
	mode?: string;
	line?: number;
	column?: number;
	startLine?: number;
	startColumn?: number;
	endLine?: number;
	endColumn?: number;
	selection?: string;
};

type NvimContext = {
	file?: string;
	cwd?: string;
	mode?: string;
	cursor?: { line: number; column: number };
	visualStart?: { line: number; column: number };
	visualEnd?: { line: number; column: number };
	selection?: string;
};

const SOCKETS_DIR = "/tmp/pi-nvim-sockets";
const LATEST_LINK = "/tmp/pi-nvim-latest.sock";
const MAX_SELECTION_CHARS = 24_000;

function run(command: string, args: string[], options: { cwd?: string; input?: string; signal?: AbortSignal; timeout?: number } = {}): Promise<{ stdout: string; stderr: string }> {
	return new Promise((resolvePromise, reject) => {
		const child = execFile(
			command,
			args,
			{
				cwd: options.cwd,
				encoding: "utf8",
				signal: options.signal,
				timeout: options.timeout ?? 10_000,
			},
			(error, stdout, stderr) => {
				if (error) {
					const message = stderr?.trim() || error.message;
					reject(new Error(`${command} ${args.join(" ")} failed: ${message}`));
					return;
				}
				resolvePromise({ stdout: stdout ?? "", stderr: stderr ?? "" });
			},
		);

		if (options.input !== undefined) child.stdin?.end(options.input);
	});
}

function textResult(text: string, details: Record<string, unknown> = {}) {
	return { content: [{ type: "text" as const, text }], details };
}

function socketForCwd(cwd: string): string {
	const hash = createHash("sha1").update(cwd).digest("hex").slice(0, 12);
	return `${tmpdir()}/pi-nvim-${hash}.sock`;
}

function cwdHash(cwd: string): string {
	return createHash("md5").update(cwd).digest("hex").slice(0, 12);
}

function bridgeSocketForCwd(cwd: string): string {
	return join(SOCKETS_DIR, `${cwdHash(cwd)}-${process.pid}.sock`);
}

function cursorArg(line?: number, column?: number): string | undefined {
	if (!line || line < 1) return undefined;
	if (column && column > 0) return `+call cursor(${Math.floor(line)},${Math.floor(column)})`;
	return `+${Math.floor(line)}`;
}

function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripRelativePrefix(path: string): string {
	return path.replace(/^\.\//, "");
}

function truncateSelection(text: string | undefined): string | undefined {
	if (!text) return text;
	if (text.length <= MAX_SELECTION_CHARS) return text;
	return `${text.slice(0, MAX_SELECTION_CHARS)}\n\n... [truncated ${text.length - MAX_SELECTION_CHARS} chars]`;
}

function formatLocation(payload: NvimBridgePayload): string {
	const file = payload.file || "unknown file";
	if (payload.startLine && payload.endLine) return `${file}:${payload.startLine}-${payload.endLine}`;
	if (payload.line) return `${file}:${payload.line}${payload.column ? `:${payload.column}` : ""}`;
	return file;
}

function composePromptFromBridge(payload: NvimBridgePayload): string {
	const question = payload.question?.trim() || "Please explain this code.";
	const selection = truncateSelection(payload.selection);
	const location = formatLocation(payload);
	const header = [`Neovim context: ${location}`];
	if (payload.cwd) header.push(`Project cwd: ${payload.cwd}`);
	if (payload.mode) header.push(`Mode: ${payload.mode}`);

	if (selection?.trim()) {
		return `${header.join("\n")}\n\nSelected code:\n\`\`\`\n${selection}\n\`\`\`\n\nUser question: ${question}`;
	}

	return `${header.join("\n")}\n\nCursor position only; inspect the file if needed.\n\nUser question: ${question}`;
}

function sendPrompt(pi: ExtensionAPI, ctx: ExtensionContext | undefined, prompt: string, images?: unknown[]) {
	const options = ctx && !ctx.isIdle() ? { deliverAs: "followUp" as const } : undefined;
	if (images && images.length > 0) {
		pi.sendUserMessage([{ type: "text", text: prompt }, ...(images as any[])], options);
		return;
	}
	pi.sendUserMessage(prompt, options);
}

function respond(conn: Socket, obj: unknown) {
	try { conn.write(JSON.stringify(obj) + "\n"); } catch {}
}

async function remoteExpr(cwd: string, expr: string, signal?: AbortSignal): Promise<string> {
	const socket = socketForCwd(cwd);
	if (!existsSync(socket)) throw new Error(`No Neovim server socket found for this project. Open a file with nvim_open_file first. Expected: ${socket}`);
	try {
		const { stdout } = await run("nvim", ["--server", socket, "--remote-expr", expr], { cwd, signal, timeout: 5_000 });
		return stdout.trim();
	} catch (error) {
		try { unlinkSync(socket); } catch {}
		throw error;
	}
}

async function getNvimContext(cwd: string, signal?: AbortSignal): Promise<NvimContext> {
	const expr = `json_encode({"file":expand('%:p'),"cwd":getcwd(),"mode":mode(),"cursor":{"line":line('.'),"column":col('.')},"visualStart":{"line":getpos("'<")[1],"column":getpos("'<")[2]},"visualEnd":{"line":getpos("'>")[1],"column":getpos("'>")[2]},"selection":join(getline(getpos("'<")[1],getpos("'>")[1]),"\\n")})`;
	const raw = await remoteExpr(cwd, expr, signal);
	const parsed = JSON.parse(raw) as NvimContext;
	if (parsed.selection) parsed.selection = truncateSelection(parsed.selection);
	return parsed;
}

async function findSymbol(cwd: string, symbol: string, pathHint: string | undefined, signal?: AbortSignal): Promise<Array<{ path: string; line: number; preview: string }>> {
	const sym = escapeRegExp(symbol);
	const pattern = [
		`(^|[[:space:]])export[[:space:]]+(async[[:space:]]+)?function[[:space:]]+${sym}\\b`,
		`(^|[[:space:]])(async[[:space:]]+)?function[[:space:]]+${sym}\\b`,
		`(^|[[:space:]])const[[:space:]]+${sym}[[:space:]]*=`,
		`(^|[[:space:]])let[[:space:]]+${sym}[[:space:]]*=`,
		`(^|[[:space:]])var[[:space:]]+${sym}[[:space:]]*=`,
		`(^|[[:space:]])class[[:space:]]+${sym}\\b`,
		`(^|[[:space:]])def[[:space:]]+${sym}\\b`,
		`(^|[[:space:]])func[[:space:]]+${sym}\\b`,
		`(^|[[:space:]])fn[[:space:]]+${sym}\\b`,
		`(^|[[:space:]])${sym}[[:space:]]*[:=][[:space:]]*(async[[:space:]]*)?(function|\\(|[A-Za-z_])`,
	].join("|");

	const args = ["--line-number", "--column", "--no-heading", "--color", "never", "--glob", "!node_modules/**", "--glob", "!.git/**", "--glob", "!dist/**", "--glob", "!build/**", "--glob", "!.next/**", pattern];
	if (pathHint) args.push(pathHint);

	try {
		const { stdout } = await run("rg", args, { cwd, signal, timeout: 10_000 });
		return stdout.split("\n").filter(Boolean).map((line) => {
			const match = line.match(/^(.*?):(\d+):(\d+):(.*)$/);
			if (!match) return undefined;
			return { path: stripRelativePrefix(match[1]), line: Number(match[2]), preview: match[4].trim() };
		}).filter(Boolean) as Array<{ path: string; line: number; preview: string }>;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		if (message.includes("failed:")) return [];
		throw error;
	}
}

async function openInNeovim(cwd: string, path: string, signal?: AbortSignal, line?: number, column?: number): Promise<{ message: string; socket: string; file: string; line?: number; paneId?: string; reused: boolean }> {
	const absPath = resolve(cwd, path);
	const socket = socketForCwd(cwd);
	const pos = cursorArg(line, column);

	if (!existsSync(absPath)) throw new Error(`File does not exist: ${path}`);

	if (existsSync(socket)) {
		const args = ["--server", socket, "--remote-tab-silent"];
		if (pos) args.push(pos);
		args.push(absPath);
		try {
			await run("nvim", args, { cwd, signal, timeout: 5_000 });
			return { message: `Opened ${relative(cwd, absPath)}${line ? `:${line}` : ""} in existing Neovim.`, socket, file: absPath, line, reused: true };
		} catch {
			try { unlinkSync(socket); } catch {}
		}
	}

	const nvimArgs = ["--listen", socket];
	if (pos) nvimArgs.push(pos);
	nvimArgs.push(absPath);
	const weztermArgs = ["cli", "split-pane", "--right", "--percent", "45", "--cwd", cwd, "--", "nvim", ...nvimArgs];
	const { stdout } = await run("wezterm", weztermArgs, { cwd, signal, timeout: 5_000 });
	const paneId = stdout.trim() || undefined;
	return { message: `Opened ${relative(cwd, absPath)}${line ? `:${line}` : ""} in a new Neovim WezTerm pane.`, socket, file: absPath, line, paneId, reused: false };
}

function handleBridgeMessage(pi: ExtensionAPI, getCtx: () => ExtensionContext | undefined, raw: string, conn: Socket) {
	try {
		const msg = JSON.parse(raw) as NvimBridgePayload;

		if (msg.type === "ping") {
			respond(conn, { ok: true, type: "pong" });
			return;
		}

		if (msg.type === "prompt" && typeof msg.message === "string") {
			process.stdout.write("\x1b[?1049h\x1b[?1049l");
			sendPrompt(pi, getCtx(), msg.message, msg.images);
			respond(conn, { ok: true });
			return;
		}

		// Backward-compatible support for the first custom bridge payload shape.
		if (msg.type === "ask" || msg.selection || msg.question) {
			const prompt = composePromptFromBridge(msg);
			sendPrompt(pi, getCtx(), prompt);
			respond(conn, { ok: true });
			return;
		}

		respond(conn, { ok: false, error: `Unknown command type: ${msg.type}` });
	} catch (error) {
		respond(conn, { ok: false, error: `Parse error: ${error instanceof Error ? error.message : String(error)}` });
	}
}

function startBridgeServer(pi: ExtensionAPI, cwd: string, getCtx: () => ExtensionContext | undefined, onError: (message: string) => void): { server: Server; socketPath: string } {
	mkdirSync(SOCKETS_DIR, { recursive: true });
	const socketPath = bridgeSocketForCwd(cwd);
	try { if (existsSync(socketPath)) unlinkSync(socketPath); } catch {}

	const server = createServer((conn) => {
		let buffer = "";
		conn.on("data", (data) => {
			buffer += data.toString();
			let newlineIndex: number;
			while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
				const line = buffer.slice(0, newlineIndex).trim();
				buffer = buffer.slice(newlineIndex + 1);
				if (line) handleBridgeMessage(pi, getCtx, line, conn);
			}
		});
		conn.on("end", () => {
			const line = buffer.trim();
			if (line) handleBridgeMessage(pi, getCtx, line, conn);
		});
		conn.on("error", () => {});
	});

	server.on("error", (error) => onError(error.message));
	server.listen(socketPath, () => {
		try { unlinkSync(LATEST_LINK); } catch {}
		try { symlinkSync(socketPath, LATEST_LINK); } catch {}
		try {
			writeFileSync(socketPath + ".info", JSON.stringify({ cwd, pid: process.pid, startedAt: new Date().toISOString() }));
		} catch {}
	});

	return { server, socketPath };
}

function cleanupBridge(server: Server | undefined, socketPath: string | undefined) {
	server?.close();
	if (!socketPath) return;
	try { unlinkSync(socketPath); } catch {}
	try {
		const target = readlinkSync(LATEST_LINK);
		if (target === socketPath) unlinkSync(LATEST_LINK);
	} catch {}
	try { unlinkSync(socketPath + ".info"); } catch {}
}

export default function neovimExtension(pi: ExtensionAPI) {
	let currentCtx: ExtensionContext | undefined;
	let bridgeServer: Server | undefined;
	let bridgeSocketPath: string | undefined;

	pi.on("session_start", (_event, ctx) => {
		currentCtx = ctx;
		if (!bridgeServer) {
			const bridge = startBridgeServer(pi, ctx.cwd, () => currentCtx, (message) => ctx.ui.notify(`pi-nvim error: ${message}`, "error"));
			bridgeServer = bridge.server;
			bridgeSocketPath = bridge.socketPath;
		}
		ctx.ui.notify(`pi-nvim bridge listening: ${bridgeSocketPath}`, "info");
	});

	pi.on("session_shutdown", () => {
		cleanupBridge(bridgeServer, bridgeSocketPath);
		bridgeServer = undefined;
		bridgeSocketPath = undefined;
	});

	process.once("exit", () => cleanupBridge(bridgeServer, bridgeSocketPath));

	pi.registerTool({
		name: "nvim_open_file",
		label: "Open File in Neovim",
		description: "Open a project file in Neovim inside a WezTerm pane, optionally at a line and column. Does not print file contents to chat.",
		promptSnippet: "Open files in Neovim in the current WezTerm tab instead of printing their contents",
		promptGuidelines: [
			"Use nvim_open_file when the user asks to see, view, inspect, or open a specific file in the editor.",
			"Use nvim_open_file instead of read when the user wants to look at a file but did not explicitly ask to print its contents in chat.",
		],
		parameters: Type.Object({ path: Type.String(), line: Type.Optional(Type.Number()), column: Type.Optional(Type.Number()) }),
		async execute(_toolCallId, params, signal, _onUpdate, ctx) {
			const result = await openInNeovim(ctx.cwd, params.path, signal, params.line, params.column);
			return textResult(result.message, result as unknown as Record<string, unknown>);
		},
	});

	pi.registerTool({
		name: "nvim_open_symbol",
		label: "Open Symbol in Neovim",
		description: "Find a function, class, method, or symbol in the project and open it in Neovim at its definition line. Does not print the symbol body to chat.",
		promptSnippet: "Open functions, classes, methods, and symbols in Neovim at their definition line",
		promptGuidelines: [
			"Use nvim_open_symbol when the user asks to see, view, inspect, or open a specific function, class, method, or symbol.",
			"Use nvim_open_symbol instead of read or grep when the user wants to look at a function but did not explicitly ask to print code in chat.",
		],
		parameters: Type.Object({ symbol: Type.String(), pathHint: Type.Optional(Type.String()) }),
		async execute(_toolCallId, params, signal, _onUpdate, ctx) {
			const matches = await findSymbol(ctx.cwd, params.symbol, params.pathHint, signal);
			if (matches.length === 0) throw new Error(`Could not find symbol: ${params.symbol}`);
			if (matches.length > 1) {
				const exactFileName = matches.filter((match) => basename(match.path).toLowerCase().includes(params.symbol.toLowerCase()));
				if (exactFileName.length === 1) {
					const result = await openInNeovim(ctx.cwd, exactFileName[0].path, signal, exactFileName[0].line);
					return textResult(result.message, { ...result, selectedFromMatches: matches.length });
				}
				const list = matches.slice(0, 12).map((match, index) => `${index + 1}. ${match.path}:${match.line} — ${match.preview}`).join("\n");
				return textResult(`Found multiple matches for ${params.symbol}. Please specify a file or directory hint.\n${list}`, { matches: matches.slice(0, 12), totalMatches: matches.length });
			}
			const match = matches[0];
			const result = await openInNeovim(ctx.cwd, match.path, signal, match.line);
			return textResult(result.message, { ...result, preview: match.preview });
		},
	});

	pi.registerTool({
		name: "nvim_get_context",
		label: "Get Neovim Context",
		description: "Read the current Neovim buffer path, cursor position, mode, and last visual selection from the project Neovim server.",
		promptSnippet: "Inspect the current Neovim cursor and visual selection context",
		promptGuidelines: [
			"Use nvim_get_context when the user asks about the current cursor, selected code, this code, or what they are looking at in Neovim.",
			"Use nvim_get_context before answering questions about selected Neovim code unless the selected code was already sent in the prompt.",
		],
		parameters: Type.Object({}),
		async execute(_toolCallId, _params, signal, _onUpdate, ctx) {
			const context = await getNvimContext(ctx.cwd, signal);
			const file = context.file ? relative(ctx.cwd, context.file) : "unknown";
			const cursor = context.cursor ? `${context.cursor.line}:${context.cursor.column}` : "unknown";
			const visual = context.visualStart && context.visualEnd ? `${context.visualStart.line}:${context.visualStart.column}-${context.visualEnd.line}:${context.visualEnd.column}` : "none";
			return textResult(`Neovim context: ${file} cursor=${cursor} visual=${visual}`, context as unknown as Record<string, unknown>);
		},
	});

	pi.registerTool({
		name: "nvim_get_selection",
		label: "Get Neovim Selection",
		description: "Read the last visual selection text and range from Neovim.",
		promptSnippet: "Read selected text from Neovim when the user asks about the selected code",
		promptGuidelines: ["Use nvim_get_selection when the user asks about selected code in Neovim."],
		parameters: Type.Object({}),
		async execute(_toolCallId, _params, signal, _onUpdate, ctx) {
			const context = await getNvimContext(ctx.cwd, signal);
			if (!context.selection?.trim()) return textResult("No visual selection available from Neovim.", context as unknown as Record<string, unknown>);
			return textResult(`Selected ${context.selection.split("\n").length} line(s) from ${context.file ? relative(ctx.cwd, context.file) : "Neovim"}.`, context as unknown as Record<string, unknown>);
		},
	});

	pi.registerCommand("pi-nvim-info", {
		description: "Show pi-nvim socket path",
		handler: async (_args, ctx) => {
			if (bridgeSocketPath) ctx.ui.notify(`Socket: ${bridgeSocketPath}`, "info");
			else ctx.ui.notify("pi-nvim not active", "warning");
		},
	});

	pi.registerCommand("nvim", {
		description: "Open a file in Neovim: /nvim path [line]",
		handler: async (args, ctx) => {
			const [path, lineText] = args.trim().split(/\s+/, 2);
			if (!path) return ctx.ui.notify("Usage: /nvim path [line]", "error");
			try {
				const line = lineText ? Number(lineText) : undefined;
				const result = await openInNeovim(ctx.cwd, path, undefined, Number.isFinite(line) ? line : undefined);
				ctx.ui.notify(result.message, "info");
			} catch (error) {
				ctx.ui.notify(error instanceof Error ? error.message : String(error), "error");
			}
		},
	});
}
