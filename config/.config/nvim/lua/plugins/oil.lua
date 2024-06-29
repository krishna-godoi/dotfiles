return {
  "stevearc/oil.nvim",
  opts = {
    default_file_explorer = true,
    delete_to_trash = true,
    skip_confirm_for_simple_edits = true,
    view_options = {
      show_hidden = true,
      is_always_hidden = function(name, _)
        return name == ".." or name == ".git"
      end,
    },
    keymaps = {
      ["<C-l>"] = false,
      ["<C-h>"] = false,
      ["<C-c>"] = false,
      ["<C-p>"] = false,
      ["<C-t>"] = false,
      ["<leader>p"] = "actions.preview",
      ["_"] = false,
    },
  },
}
