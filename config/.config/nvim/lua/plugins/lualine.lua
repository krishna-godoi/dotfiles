return {
  "nvim-lualine/lualine.nvim",
  dependencies = { "nvim-tree/nvim-web-devicons" },
  config = function()
    local custom_onedark = require("lualine.themes.onedark")

    custom_onedark.normal.c.bg = "#1e1e21"

    require("lualine").setup({
      sections = {
        lualine_c = { { "filename", path = 1 } },
        lualine_x = { "filetype" },
      },
      options = {
        theme = custom_onedark,
        section_separators = { left = "", right = "" },
        component_separators = { left = "|", right = "|" },
      },
    })
  end,
}
