-- NOTE: Diagnostic keymaps
vim.keymap.set("n", "[d", vim.diagnostic.goto_prev, { desc = "Go to previous [D]iagnostic message" })
vim.keymap.set("n", "]d", vim.diagnostic.goto_next, { desc = "Go to next [D]iagnostic message" })
vim.keymap.set("n", "<leader>e", vim.diagnostic.open_float, { desc = "Show diagnostic [E]rror messages" })
vim.keymap.set("n", "<leader>q", vim.diagnostic.setloclist, { desc = "Open diagnostic [Q]uickfix list" })

-- NOTE: Remove some annoying default mappings
vim.keymap.set("v", "<BS>", "<Nop>")
vim.keymap.set("n", "<BS>", "<Nop>")
vim.keymap.set("t", "<C-w>", "<C-\\><C-n>", { desc = "Exit terminal mode" })

-- NOTE: Useful keybinds for frequent actions
vim.keymap.set("n", "-", ":Oil<cr>", { desc = "Explore files" })
vim.keymap.set({ "n", "v" }, "<leader>y", [["+y]], { desc = "Yank into + register" })
vim.keymap.set({ "n", "v" }, "<leader>Y", [["+Y]], { desc = "Yank current line into + register" })
vim.keymap.set("x", "<leader>p", [["_dP]], { desc = "Paste over selection without overriding register" })
vim.keymap.set({ "n", "v" }, "<leader>d", [["_d]], { desc = "" })
vim.keymap.set("n", "<leader>x", "<cmd>!chmod +x %<CR>", { silent = true, desc = "Make current file executable" })

-- NOTE: ZZ keymaps for centering the current line after certain actions
vim.keymap.set("n", "<C-u>", "<C-u>zz", { desc = "" })
vim.keymap.set("n", "<C-d>", "<C-d>zz", { desc = "" })
vim.keymap.set("n", "n", "nzzzv")
vim.keymap.set("n", "N", "Nzzzv")

-- NOTE: Improve default behavior
vim.keymap.set("i", "<C-c>", "<Esc>")
vim.keymap.set("n", "J", "mzJ`z")
