export XDG_DATA_HOME="$HOME"/.local/share
export XDG_CONFIG_HOME="$HOME"/.config
export XDG_STATE_HOME="$HOME"/.local/state
export XDG_CACHE_HOME="$HOME"/.cache
export ZDOTDIR="$XDG_CONFIG_HOME"/zsh

export GOPATH="$XDG_DATA_HOME"/go
export NODE_GYP_FORCE_PYTHON=/usr/bin/python
export LD_LIBRARY_PATH=/usr/local/lib

export WAKATIME_HOME="$XDG_CONFIG_HOME"/wakatime
export NPM_CONFIG_USERCONFIG="$XDG_CONFIG_HOME"/npm/npmrc
export HISTFILE="$ZDOTDIR"/history
export DOCKER_CONFIG="$XDG_CONFIG_HOME"/docker

export NVM_DIR="$XDG_CONFIG_HOME"/nvm
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
export EDITOR=nvim
