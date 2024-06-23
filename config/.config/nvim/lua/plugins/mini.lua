return { -- Collection of various small independent plugins/modules
  "echasnovski/mini.nvim",
  config = function()
    -- Better Around/Inside textobjects
    --
    -- Examples:
    --  - va)  - [V]isually select [A]round [)]paren
    --  - yinq - [Y]ank [I]nside [N]ext [']quote
    --  - ci'  - [C]hange [I]nside [']quote
    require("mini.ai").setup({ n_lines = 500 })

    require("mini.bracketed").setup({
      comment = { suffix = "", options = {} },
    })

    -- gS to toggle split arguments into multiple lines
    require("mini.splitjoin").setup()

    require("mini.move").setup({
      mappings = {
        left = "<C-H>",
        down = "<C-J>",
        up = "<C-K>",
        right = "<C-L>",
      },
    })

    -- Add/delete/replace surroundings (brackets, quotes, etc.)
    --
    -- - saiw) - [S]urround [A]dd [I]nner [W]ord [)]Paren
    -- - sd'   - [S]urround [D]elete [']quotes
    -- - sr)'  - [S]urround [R]eplace [)] [']
    require("mini.surround").setup()
  end,
}
