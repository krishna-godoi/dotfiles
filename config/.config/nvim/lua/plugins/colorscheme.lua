return {
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
        green = "#5fd988",
        cyan = "#c88ee8",
        blue = "#18c2ed",
        purple = "#ed72b9",
        orange = "#f2a76b",
      },
      code_style = {
        comments = "italic",
        keywords = "none",
        functions = "none",
        strings = "none",
        variables = "none",
      },
      highlights = {
        LineNr = { fg = "$bg2" },
      },
    }
    vim.cmd.colorscheme("onedark")
  end,
}

-- NOTE: Default colors:
--
-- cool = {
--   black = "#151820",
--   bg0 = "#242b38",
--   bg1 = "#2d3343",
--   bg2 = "#343e4f",
--   bg3 = "#363c51",
--   bg_d = "#1e242e",
--   bg_blue = "#6db9f7",
--   bg_yellow = "#f0d197",
--   fg = "#a5b0c5",
--   purple = "#ca72e4",
--   green = "#97ca72",
--   orange = "#d99a5e",
--   blue = "#5ab0f6",
--   yellow = "#ebc275",
--   cyan = "#4dbdcb",
--   red = "#ef5f6b",
--   grey = "#546178",
--   light_grey = "#7d899f",
--   dark_cyan = "#25747d",
--   dark_red = "#a13131",
--   dark_yellow = "#9a6b16",
--   dark_purple = "#8f36a9",
--   diff_add = "#303d27",
--   diff_delete = "#3c2729",
--   diff_change = "#18344c",
--   diff_text = "#265478",
-- }
