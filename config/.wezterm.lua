local wezterm = require("wezterm")

local config = wezterm.config_builder()
local act = wezterm.action

-- or, changing the font size and color scheme.
config.font_size = 12
config.color_scheme = "One Half Black (Gogh)"
config.font_rules = {
  {
    intensity = 'Normal',
    italic = false,
    font = wezterm.font_with_fallback({
      "JetBrainsMono Nerd Font",
      { family = "Symbols Nerd Font Mono" } -- Fixes the missing YAML icon natively
    }),
  },
}
config.window_decorations = "NONE"
-- WezTerm's XIM client leaks an X window per cursor move when it has no input
-- context; tens of thousands per day stall Chrome and other X clients.
-- use_ime alone does NOT stop it (update_pos is ungated). The actual fix is
-- launching with XMODIFIERS=@im=none: see
-- ~/.local/share/applications/org.wezfurlong.wezterm.desktop
config.use_ime = false
config.tab_bar_at_bottom = true
config.use_fancy_tab_bar = false
config.show_new_tab_button_in_tab_bar = false
config.default_workspace = "~"
config.window_padding = {
	top = 10,
	right = 0,
	bottom = 0,
	left = 0,
}
config.selection_word_boundary = " \t\n{}[]()\"'`/-"

wezterm.on("update-right-status", function(window, pane)
	local workspace = window:active_workspace()

	-- Make it italic and underlined
	window:set_left_status(wezterm.format({
		{ Text = " " .. workspace .. " " },
	}))
end)

wezterm.on("format-tab-title", function(tab, _, _, conf, _, _)
	local index = tab.tab_index + 1
	return {
		{ Text = " " .. index .. ":" .. tab.active_pane.title .. " " },
	}
end)

config.colors = {
	background = "#060608",
	ansi = {
		"black",
		"#a13131",
		"#5fd988",
		"#ebc275",
		"#18c2ed",
		"#c88ee8",
		"teal",
		"silver",
	},
	brights = {
		"#546178",
		"#ef5f6b",
		"#5fd988",
		"#ebc275",
		"#18c2ed",
		"#ed72b9",
		"aqua",
		"white",
	},
	tab_bar = {
		background = "#060608",
		active_tab = {
			bg_color = "#060608",
			fg_color = "#5fd988",
			intensity = "Bold",
		},
		inactive_tab = {
			bg_color = "#060608",
			fg_color = "#7d899f",
		},
		inactive_tab_hover = {
			bg_color = "#060608",
			fg_color = "#a5b0c5",
			italic = false,
		},
	},
}

local get_fzf_dirs = function()
	local user_home = os.getenv("HOME")
	local handle = io.popen("find ~ ~/projects ~/.config ~/.dotfiles/config/.config /var/www/ -maxdepth 1 -type d")
	if not handle then
		return "Failed to run fzf"
	end
	local output = handle:read("*a")
	local success, exit_type, code = handle:close()

	local choices = {}
	if success then
		for _, line in ipairs(wezterm.split_by_newlines(output)) do
			local name = line:gsub(user_home, "~")
			table.insert(choices, { id = line, label = name })
		end
		return choices
	else
		return string.format("The command failed (%s, code %d)\n", exit_type, code)
	end
end

local function switch_workspace()
	return wezterm.action_callback(function(window, pane)
		window:perform_action(
			act.InputSelector({
				title = "Choose Workspace",
				description = "Select a workspace and press Enter = accept, Esc = cancel, / = filter",
				fuzzy_description = "Switch to workspace:",
				choices = get_fzf_dirs(),
				action = wezterm.action_callback(function(window, pane, id, label)
					if not id and not label then
						wezterm.log_info("cancelled")
					else
						window:perform_action(act.SwitchToWorkspace({ name = label, spawn = { cwd = id } }), pane)
					end
				end),
				fuzzy = true,
			}),
			pane
		)
	end)
end

local function is_vim(pane)
	return pane:get_user_vars().IS_NVIM == "true"
end

local direction_keys = {
	h = "Left",
	j = "Down",
	k = "Up",
	l = "Right",
}

local function split_nav(resize_or_move, key)
	return {
		key = key,
		mods = resize_or_move == "resize" and "META" or "CTRL",
		action = wezterm.action_callback(function(win, pane)
			if is_vim(pane) then
				win:perform_action(
					{ SendKey = { key = key, mods = resize_or_move == "resize" and "META" or "CTRL" } },
					pane
				)
			else
				if resize_or_move == "resize" then
					win:perform_action({ AdjustPaneSize = { direction_keys[key], 3 } }, pane)
				else
					win:perform_action({ ActivatePaneDirection = direction_keys[key] }, pane)
				end
			end
		end),
	}
end

config.keys = {
	{ key = "1", mods = "CTRL", action = act.ActivateTab(0) },
	{ key = "2", mods = "CTRL", action = act.ActivateTab(1) },
	{ key = "3", mods = "CTRL", action = act.ActivateTab(2) },
	{ key = "4", mods = "CTRL", action = act.ActivateTab(3) },
	{ key = "5", mods = "CTRL", action = act.ActivateTab(4) },
	{ key = "6", mods = "CTRL", action = act.ActivateTab(5) },
	{ key = "7", mods = "CTRL", action = act.ActivateTab(6) },
	{ key = "8", mods = "CTRL", action = act.ActivateTab(7) },
	{ key = "9", mods = "CTRL", action = act.ActivateTab(8) },
	{ key = "f", mods = "CTRL", action = switch_workspace() },
	{ key = "Backspace", mods = "CTRL", action = act.SendKey({ key = "w", mods = "CTRL" }) },

	-- Pane split shortcuts
	{ key = "(", mods = "CTRL", action = act.SplitPane({ direction = "Right" }) },
	{ key = ")", mods = "CTRL", action = act.SplitPane({ direction = "Down" }) },

	-- Pane navigation with smart Neovim detection
	split_nav("move", "h"),
	split_nav("move", "j"),
	split_nav("move", "k"),
	split_nav("move", "l"),
	split_nav("resize", "h"),
	split_nav("resize", "j"),
	split_nav("resize", "k"),
	split_nav("resize", "l"),
}

-- Finally, return the configuration to wezterm:
return config
