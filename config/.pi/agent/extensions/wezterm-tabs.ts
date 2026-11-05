import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

type RegistryEntry = {
	alias?: string;
	paneId: string;
	tabId?: string;
	windowId?: string;
	title?: string;
	cwd?: string;
	createdAt: string;
	lastCommand?: string;
};

type Registry = {
	panes: RegistryEntry[];
};

const STATE_FILE = join(homedir(), ".pi", "agent", "wezterm-tabs.json");

function runWezterm(args: string[], input?: string, signal?: AbortSignal): Promise<{ stdout: string; stderr: string }> {
	return new Promise((resolve, reject) => {
		const child = execFile("wezterm", ["cli", ...args], { encoding: "utf8", signal }, (error, stdout, stderr) => {
			if (error) {
				const message = stderr?.trim() || error.message;
				reject(new Error(`wezterm cli ${args.join(" ")} failed: ${message}`));
				return;
			}
			resolve({ stdout: stdout ?? "", stderr: stderr ?? "" });
		});
		if (input !== undefined) {
			child.stdin?.end(input);
		}
	});
}

async function loadRegistry(): Promise<Registry> {
	try {
		const text = await readFile(STATE_FILE, "utf8");
		const parsed = JSON.parse(text) as Registry;
		return { panes: Array.isArray(parsed.panes) ? parsed.panes : [] };
	} catch {
		return { panes: [] };
	}
}

async function saveRegistry(registry: Registry): Promise<void> {
	await mkdir(dirname(STATE_FILE), { recursive: true });
	await writeFile(STATE_FILE, JSON.stringify(registry, null, "\t") + "\n", "utf8");
}

async function upsertRegistry(entry: RegistryEntry): Promise<void> {
	const registry = await loadRegistry();
	const withoutExisting = registry.panes.filter((pane) => pane.paneId !== entry.paneId && (!entry.alias || pane.alias !== entry.alias));
	withoutExisting.push(entry);
	await saveRegistry({ panes: withoutExisting });
}

async function resolvePaneId(params: { pane_id?: string; alias?: string }): Promise<string> {
	if (params.pane_id) return params.pane_id;
	if (!params.alias) throw new Error("Provide either pane_id or alias.");
	const registry = await loadRegistry();
	const entry = registry.panes.find((pane) => pane.alias === params.alias);
	if (!entry) throw new Error(`Unknown wezterm tab alias: ${params.alias}`);
	return entry.paneId;
}

async function getActivePaneId(signal?: AbortSignal): Promise<string | undefined> {
	if (process.env.WEZTERM_PANE) return process.env.WEZTERM_PANE;

	try {
		const { stdout } = await runWezterm(["list", "--format", "json"], undefined, signal);
		const panes = JSON.parse(stdout) as Array<Record<string, unknown>>;
		const activePane = panes.find((pane) => pane.is_active === true || pane.isActive === true);
		if (activePane?.pane_id !== undefined) return String(activePane.pane_id);
		if (activePane?.paneId !== undefined) return String(activePane.paneId);
	} catch {
		// Best effort only; background spawning can still proceed without restoring focus.
	}

	return undefined;
}

function shellCommand(command: string): string[] {
	const shell = process.env.SHELL || "/bin/bash";
	return [shell, "-lc", `${command}; exec ${JSON.stringify(shell)} -l`];
}

function textResult(text: string, details: Record<string, unknown> = {}) {
	return { content: [{ type: "text" as const, text }], details };
}

const paneTargetParams = {
	pane_id: Type.Optional(Type.String({ description: "WezTerm pane id. Either pane_id or alias is required." })),
	alias: Type.Optional(Type.String({ description: "Alias previously assigned by wezterm_open_tab." })),
};

export default function weztermTabsExtension(pi: ExtensionAPI) {
	pi.registerTool({
		name: "wezterm_open_tab",
		label: "Open WezTerm Tab",
		description: "Open a new WezTerm tab, optionally start a command there, and remember its pane id/alias.",
		promptSnippet: "Open a new WezTerm tab and optionally launch a long-running or interactive command in it",
		promptGuidelines: [
			"Use wezterm_open_tab when the user wants an agent-managed terminal tab that they can inspect or interact with manually.",
			"Use wezterm_read_tab to inspect output from a WezTerm tab instead of assuming a command has finished.",
		],
		parameters: Type.Object({
			command: Type.Optional(Type.String({ description: "Command to run in the new tab. If omitted, opens the user's shell." })),
			cwd: Type.Optional(Type.String({ description: "Initial working directory. Defaults to pi's current working directory." })),
			title: Type.Optional(Type.String({ description: "Optional WezTerm tab title." })),
			alias: Type.Optional(Type.String({ description: "Optional memorable alias for later tools, e.g. 'server' or 'ssh-prod'." })),
			new_window: Type.Optional(Type.Boolean({ description: "Open a new window instead of a tab. Defaults to false." })),
			background: Type.Optional(Type.Boolean({ description: "Re-activate the original pane after spawning so the new tab/window opens in the background. Defaults to true." })),
		}),
		async execute(_toolCallId, params, signal, _onUpdate, ctx) {
			const cwd = params.cwd || ctx.cwd;
			const openInBackground = params.background !== false;
			const previousPaneId = openInBackground ? await getActivePaneId(signal) : undefined;
			const spawnArgs = ["spawn"];
			if (params.new_window) spawnArgs.push("--new-window");
			spawnArgs.push("--cwd", cwd);
			if (params.command) spawnArgs.push("--", ...shellCommand(params.command));

			const { stdout } = await runWezterm(spawnArgs, undefined, signal);
			const paneId = stdout.trim();
			if (!paneId) throw new Error("WezTerm did not return a pane id.");

			if (openInBackground && previousPaneId && previousPaneId !== paneId) {
				await runWezterm(["activate-pane", "--pane-id", previousPaneId], undefined, signal);
			}

			let tabId: string | undefined;
			let windowId: string | undefined;
			try {
				const list = await runWezterm(["list", "--format", "json"], undefined, signal);
				const panes = JSON.parse(list.stdout) as Array<Record<string, unknown>>;
				const pane = panes.find((item) => String(item.pane_id) === paneId || String(item.paneId) === paneId);
				tabId = pane?.tab_id !== undefined ? String(pane.tab_id) : pane?.tabId !== undefined ? String(pane.tabId) : undefined;
				windowId = pane?.window_id !== undefined ? String(pane.window_id) : pane?.windowId !== undefined ? String(pane.windowId) : undefined;
			} catch {
				// Listing is best-effort; pane id is enough for follow-up operations.
			}

			if (params.title) {
				await runWezterm(["set-tab-title", "--pane-id", paneId, params.title], undefined, signal);
			}

			const entry: RegistryEntry = {
				alias: params.alias,
				paneId,
				tabId,
				windowId,
				title: params.title,
				cwd,
				createdAt: new Date().toISOString(),
				lastCommand: params.command,
			};
			await upsertRegistry(entry);

			return textResult(
				`Opened WezTerm ${params.new_window ? "window" : "tab"}: pane_id=${paneId}${params.alias ? ` alias=${params.alias}` : ""}${openInBackground && previousPaneId ? ` (background; restored pane ${previousPaneId})` : ""}`,
				{ ...entry, background: openInBackground, restoredPaneId: previousPaneId } as unknown as Record<string, unknown>,
			);
		},
	});

	pi.registerTool({
		name: "wezterm_send_text",
		label: "Send Text to WezTerm Tab",
		description: "Send text or a command to an existing WezTerm pane/tab.",
		promptSnippet: "Send commands or keystrokes to a WezTerm tab by pane id or alias",
		parameters: Type.Object({
			...paneTargetParams,
			text: Type.String({ description: "Text to send." }),
			enter: Type.Optional(Type.Boolean({ description: "Append a newline/Enter. Defaults to true." })),
			paste: Type.Optional(Type.Boolean({ description: "Use bracketed paste mode when available. Defaults to false." })),
		}),
		async execute(_toolCallId, params, signal) {
			const paneId = await resolvePaneId(params);
			const text = params.enter === false ? params.text : `${params.text}\n`;
			const args = ["send-text", "--pane-id", paneId];
			if (!params.paste) args.push("--no-paste");
			await runWezterm(args, text, signal);
			return textResult(`Sent text to WezTerm pane ${paneId}.`, { paneId, bytes: Buffer.byteLength(text) });
		},
	});

	pi.registerTool({
		name: "wezterm_read_tab",
		label: "Read WezTerm Tab",
		description: "Read scrollback/current screen text from a WezTerm pane/tab.",
		promptSnippet: "Read output from a WezTerm tab by pane id or alias",
		parameters: Type.Object({
			...paneTargetParams,
			start_line: Type.Optional(Type.Number({ description: "Start line for wezterm get-text. Negative values read scrollback. Defaults to -100000." })),
			end_line: Type.Optional(Type.Number({ description: "End line for wezterm get-text. Omit for bottom of screen." })),
			escapes: Type.Optional(Type.Boolean({ description: "Include ANSI escape/style sequences. Defaults to false." })),
		}),
		async execute(_toolCallId, params, signal) {
			const paneId = await resolvePaneId(params);
			const args = ["get-text", "--pane-id", paneId, "--start-line", String(params.start_line ?? -100000)];
			if (params.end_line !== undefined) args.push("--end-line", String(params.end_line));
			if (params.escapes) args.push("--escapes");
			const { stdout } = await runWezterm(args, undefined, signal);
			return textResult(stdout || "(no text returned)", { paneId, chars: stdout.length });
		},
	});

	pi.registerTool({
		name: "wezterm_list_tabs",
		label: "List WezTerm Tabs",
		description: "List WezTerm panes/tabs and aliases known to pi.",
		promptSnippet: "List WezTerm panes/tabs and pi's remembered aliases",
		parameters: Type.Object({}),
		async execute(_toolCallId, _params, signal) {
			const registry = await loadRegistry();
			const { stdout } = await runWezterm(["list", "--format", "json"], undefined, signal);
			return textResult(stdout, { registry });
		},
	});

	pi.registerTool({
		name: "wezterm_activate_tab",
		label: "Activate WezTerm Tab",
		description: "Focus/activate a WezTerm pane/tab so the user can view or interact with it.",
		promptSnippet: "Focus a WezTerm tab by pane id or alias",
		parameters: Type.Object(paneTargetParams),
		async execute(_toolCallId, params, signal) {
			const paneId = await resolvePaneId(params);
			await runWezterm(["activate-pane", "--pane-id", paneId], undefined, signal);
			return textResult(`Activated WezTerm pane ${paneId}.`, { paneId });
		},
	});

	pi.registerCommand("wezterm-tabs", {
		description: "List WezTerm tabs remembered by the wezterm-tabs extension",
		handler: async (_args, ctx) => {
			const registry = await loadRegistry();
			if (registry.panes.length === 0) {
				ctx.ui.notify("No remembered WezTerm tabs yet.", "info");
				return;
			}
			ctx.ui.notify(registry.panes.map((pane) => `${pane.alias ? pane.alias + ": " : ""}${pane.paneId}${pane.title ? ` (${pane.title})` : ""}`).join("\n"), "info");
		},
	});

	pi.on("session_start", (_event, ctx) => {
		ctx.ui.notify("WezTerm tabs extension loaded. Tools: wezterm_open_tab, wezterm_send_text, wezterm_read_tab.", "info");
	});
}
