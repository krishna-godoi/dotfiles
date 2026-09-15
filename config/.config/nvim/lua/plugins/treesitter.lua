return {
  "nvim-treesitter/nvim-treesitter",
  -- upstream made `main` (the rewrite) the default branch; this config uses the
  -- classic `nvim-treesitter.configs` API, which only exists on `master`.
  -- without this pin a fresh clone lands on `main` and fails to load.
  branch = "master",
  build = ":TSUpdate",
  opts = {
    ensure_installed = {
      "bash",
      "go",
      "c",
      "diff",
      "html",
      "lua",
      "luadoc",
      "markdown",
      "vim",
      "vimdoc",
    },
    auto_install = true,
    highlight = {
      enable = true,
    },
    indent = {
      enable = true,
    },
  },
  config = function(_, opts)
    require("nvim-treesitter.install").prefer_git = true
    require("nvim-treesitter.configs").setup(opts)
  end,
}
