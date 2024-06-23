### 1 - Install dependencies:
```
sudo dnf install fzf golang hyprland hyprpaper lazygit neovim pavucontrol snapd stow waybar zoxide zsh
```

### 2 - Clone the repo
```
git clone git@github.com:krishna-godoi/dotfiles.git .dotfiles
```

### 3 - Use stow to symlink the configs
```
cd .dotfiles 
stow config
