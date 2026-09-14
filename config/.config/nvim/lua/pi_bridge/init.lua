local M = {}

M.config = {
  socket = vim.fn.expand("~/.pi/agent/nvim-bridge.sock"),
  max_selection_chars = 24000,
}

function M.setup(opts)
  M.config = vim.tbl_deep_extend("force", M.config, opts or {})
end

local function visual_range()
  local start_pos = vim.fn.getpos("'<")
  local end_pos = vim.fn.getpos("'>")
  local start_line, start_col = start_pos[2], start_pos[3]
  local end_line, end_col = end_pos[2], end_pos[3]

  if start_line == 0 or end_line == 0 then
    return nil
  end

  if start_line > end_line or (start_line == end_line and start_col > end_col) then
    start_line, end_line = end_line, start_line
    start_col, end_col = end_col, start_col
  end

  return start_line, start_col, end_line, end_col
end

local function selected_text()
  local start_line, start_col, end_line, end_col = visual_range()
  if not start_line then
    return nil
  end

  local lines = vim.api.nvim_buf_get_lines(0, start_line - 1, end_line, false)
  if #lines == 0 then
    return nil
  end

  -- Trim characterwise selections. For linewise/blockwise this is still acceptable context.
  if #lines == 1 then
    lines[1] = string.sub(lines[1], start_col, end_col)
  else
    lines[1] = string.sub(lines[1], start_col)
    lines[#lines] = string.sub(lines[#lines], 1, end_col)
  end

  local text = table.concat(lines, "\n")
  if #text > M.config.max_selection_chars then
    text = string.sub(text, 1, M.config.max_selection_chars)
      .. "\n\n... [truncated "
      .. tostring(#text - M.config.max_selection_chars)
      .. " chars]"
  end

  return text, start_line, start_col, end_line, end_col
end

function M.context(question, include_selection)
  local cursor = vim.api.nvim_win_get_cursor(0)
  local text, start_line, start_col, end_line, end_col

  if include_selection ~= false then
    text, start_line, start_col, end_line, end_col = selected_text()
  end

  return {
    type = "ask",
    question = question or "",
    file = vim.api.nvim_buf_get_name(0),
    cwd = vim.fn.getcwd(),
    mode = vim.fn.mode(),
    line = cursor[1],
    column = cursor[2] + 1,
    startLine = start_line,
    startColumn = start_col,
    endLine = end_line,
    endColumn = end_col,
    selection = text,
  }
end

local function send_json(payload)
  local encoded = vim.json.encode(payload)
  local result = vim.system({ "nc", "-U", M.config.socket }, { text = true, stdin = encoded }):wait()
  if result.code ~= 0 then
    local msg = result.stderr ~= "" and result.stderr or result.stdout
    error("Failed to send to pi Neovim bridge at " .. M.config.socket .. ": " .. msg)
  end
  return result.stdout
end

function M.ask(question, opts)
  opts = opts or {}
  local payload = M.context(question, opts.selection ~= false)
  send_json(payload)
  vim.notify("Sent Neovim context to pi", vim.log.levels.INFO)
end

function M.ask_with_prompt(opts)
  opts = opts or {}
  vim.ui.input({ prompt = "Ask pi: " }, function(input)
    if input == nil then
      return
    end
    M.ask(input, opts)
  end)
end

vim.api.nvim_create_user_command("PiAsk", function(command)
  local question = command.args
  if question == "" then
    M.ask_with_prompt({ selection = true })
  else
    M.ask(question, { selection = true })
  end
end, {
  nargs = "*",
  range = true,
  desc = "Send current Neovim selection/cursor context to pi",
})

vim.api.nvim_create_user_command("PiAskCursor", function(command)
  local question = command.args ~= "" and command.args or "Please explain the code at my cursor."
  M.ask(question, { selection = false })
end, {
  nargs = "*",
  desc = "Send current Neovim cursor context to pi",
})

vim.api.nvim_create_user_command("PiExplain", function()
  M.ask("Explain this code.", { selection = true })
end, {
  range = true,
  desc = "Ask pi to explain the current selection",
})

vim.keymap.set("v", "<leader>pa", function()
  M.ask_with_prompt({ selection = true })
end, { desc = "Ask pi about selection" })

vim.keymap.set("n", "<leader>pa", function()
  M.ask_with_prompt({ selection = false })
end, { desc = "Ask pi about cursor" })

vim.keymap.set("v", "<leader>pe", function()
  M.ask("Explain this code.", { selection = true })
end, { desc = "Pi explain selection" })

return M
