return {
  "norcalli/nvim-colorizer.lua",
  config = function()
    local colorizer = require("colorizer")
    colorizer.setup({}, { mode = "foreground", css = true })
  end,
}
