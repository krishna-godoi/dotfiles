eval "$(starship init zsh)"
eval "$(zoxide init zsh)"

autoload -Uz compinit
compinit
autoload -z edit-command-line
zle -N edit-command-line
bindkey "^X^E" edit-command-line

# Preseve history to file shared between shells
HISTFILE=${ZDOTDIR:-~/.config/zsh}/.zsh_history
HISTSIZE=10000
SAVEHIST=10000
setopt SHARE_HISTORY
setopt APPEND_HISTORY
setopt INC_APPEND_HISTORY
setopt HIST_IGNORE_ALL_DUPS
setopt HIST_NO_STORE

# custom aliases
alias vim="nvim"
alias tmux='tmux -f "$XDG_CONFIG_HOME/tmux/tmux.conf"'

# antidote package manager
source ${ZDOTDIR:-~}/.antidote/antidote.zsh
# load plugins from .zsh_plugins.txt
antidote load

typeset -A ZSH_HIGHLIGHT_STYLES
ZSH_HIGHLIGHT_STYLES[path]='none'
ZSH_HIGHLIGHT_STYLES[path_prefix]='none'

function () {
	# `seq` is a fallback for the case when terminfo is not available.
	local kcap seq widget
	for	kcap   seq        widget (                       # key name
		kdch1  '^[[3~'    delete-char                    # Delete
		kDC5   '^[[3;5~'  kill-word                      # Ctrl + Delete
		kRIT5  '^[[1;5C'  forward-word                   # Ctrl + RightArrow
		kLFT5  '^[[1;5D'  backward-word                  # Ctrl + LeftArrow
	); do
		bindkey -M emacs ${terminfo[$kcap]:-$seq} $widget
		bindkey -M viins ${terminfo[$kcap]:-$seq} $widget
		bindkey -M vicmd ${terminfo[$kcap]:-$seq} $widget
	done
}

if [ "$TMUX" = "" ]; then tmux new -A -s main; fi

export PATH=$PATH:/home/krisc/.spicetify

eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
