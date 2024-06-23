return {
  -- If you want to see what colorschemes are already installed, you can use `:Telescope colorscheme`
  "navarasu/onedark.nvim",
  lazy = false,
  priority = 1000,
  config = function()
    vim.g.onedark_config = {
      style = "cool", -- dark, darker, cool, deep, warm, warmer, light
      colors = {
        bg0 = "#121214",
        bg1 = "#202020",
        bg3 = "#303030",
        green = "#49e67e",
        cyan = "#c480e8",
        blue = "#44d5fc",
        purple = "#ff70c3",
      },
      --       cool = {
      -- 	black = "#151820",
      -- 	bg0 = "#242b38",
      -- 	bg1 = "#2d3343",
      -- 	bg2 = "#343e4f",
      -- 	bg3 = "#363c51",
      -- 	bg_d = "#1e242e",
      -- 	bg_blue = "#6db9f7",
      -- 	bg_yellow = "#f0d197",
      -- 	fg = "#a5b0c5",
      -- 	purple = "#ca72e4",
      -- 	orange = "#d99a5e",
      -- 	yellow = "#ebc275",
      -- 	grey = "#546178",
      -- 	light_grey = "#7d899f",
      -- 	dark_cyan = "#25747d",
      -- 	dark_red = "#a13131",
      -- 	dark_yellow = "#9a6b16",
      -- 	dark_purple = "#8f36a9",
      -- 	diff_add = "#303d27",
      -- 	diff_delete = "#3c2729",
      -- 	diff_change = "#18344c",
      -- 	diff_text = "#265478",
      -- },
      code_style = {
        comments = "italic",
        keywords = "none",
        functions = "none",
        strings = "none",
        variables = "none",
      },
      highlights = {
        LineNr = { fg = "$bg2" },
        CursorLineNr = { fg = "$light_grey" },
      },
    }
    vim.cmd.colorscheme("onedark")
  end,
}
