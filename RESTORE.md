# Restoring this desktop after the 2026-11-04 reinstall

Written for a Claude Code session on the fresh install: read this whole file, then work through it in order.
Backup taken 2026-11-04, before reformatting to enable full-disk encryption.

## Where everything is

| Location | What |
|---|---|
| This repo (`krishna-godoi/dotfiles`, public) | Dev configs (stow package `config/`), `~/bin` scripts, cassandra notes in `cassandra/` |
| cassandra (home server, `krishna-godoi@cassandra.local`, normally `192.168.1.22`) `~/desktop-backup-2026-11-04/` | Everything private |

On cassandra, `~/desktop-backup-2026-11-04/` contains:

| Item | Contents | Restores to |
|---|---|---|
| `private-config-2026-11-04.tar.zst` | `~/.ssh` (all keys + full ssh config), `~/.aws`, `~/.azure`, `~/.kube`, `~/.tsh`, `~/.magento-cloud`, Claude memory (`~/.claude/projects/*/memory`), an old `~/.gitconfig` | `~` |
| `cli-logins-2026-11-04.tar.zst` | `~/.azure-devops`, `~/.yarnrc`, `~/.gk`, `~/.claude/.credentials.json`, `~/.claude.json`, `~/.codex/auth.json`, `~/.pi/agent/auth.json`, `~/.gemini`, `~/.local/share/opencode/auth.json` | `~` |
| `work-credentials-2026-11-04.tar.zst` | Git-ignored work project secrets (`env.php`, `auth.json`, `.env.local`, `compose.local.yml`, `wp-config.php`, TLS keys) and the mkcert root CA (`~/.local/share/mkcert`). Stored with **absolute paths** (`var/www/...`, `home/krisc/...`) | `/` (needs sudo) |
| `home/` (plain rsync copy) | All of `~/.config` (minus Cursor and app caches), `~/.gnupg`, `~/.local/share/keyrings`, `~/.t3` (T3 Code data), and folders: `notes`, `Documents`, `Pictures`, `Videos`, `Desktop`, `cli-trace-extractor`, `youtube-transcription-service`, `qual-explore`, `revrec*`, `fcg-foundry-export`, `krisc`, `screenshots-modal` | `~` |
| `projects/` (plain rsync copy) | `~/projects` in full | `~/projects` |

**Deliberately NOT backed up** (do not go looking for them): `~/Downloads`, loose files in `~`, `/var/www` work checkouts
(re-clone them; only their secrets are in `work-credentials`), Docker volumes, Unity, `~/src` (libgit2, bench),
upstream clones (neovim, Hyprland, hypr*), Cursor, anything hummingbird, fonts in `~/.local/share/fonts`, package lists.

## Step 1 — the user runs this (needs passwords; Claude can't type them)

Requirements on the new install: username **`krisc`**, hostname **`krishna-godoi`** (cassandra's lsyncd pushes to
`krisc@krishna-godoi.local`), and the **same login password as before** (it unlocks the restored GNOME keyring).
The cassandra password is the same as the login password.

```bash
sudo apt install -y git stow zsh rsync zstd openssh-server avahi-daemon libnss-mdns sqlite3
sudo hostnamectl set-hostname krishna-godoi
chsh -s /usr/bin/zsh

B=krishna-godoi@cassandra.local:desktop-backup-2026-11-04     # if .local fails, use 192.168.1.22
ssh ${B%%:*} "cat ${B#*:}/private-config-2026-11-04.tar.zst" | tar --zstd -xpf - -C ~
ssh ${B%%:*} "cat ${B#*:}/work-credentials-2026-11-04.tar.zst" | sudo tar --zstd -xpf - -C /
sudo chown -R krisc:krisc /var/www/* ~/magebit-docker ~/.local   # tar created the parent dirs as root
echo '127.0.0.1 satmodo.docker' | sudo tee -a /etc/hosts
```

After this, `~/.ssh/id_ed25519` is back and cassandra accepts it, so no further passwords are needed.
Then start Claude Code **in a plain terminal, not inside T3 Code** (step 2.3 needs T3 Code closed) and hand over to step 2.

## Step 2 — Claude does the rest

Use `ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes krishna-godoi@cassandra.local` for cassandra
(`~/bin/cassandra --ip` finds it by MAC once the dotfiles are stowed). Verify each step before moving on.

1. **Dotfiles.** `git clone git@github.com:krishna-godoi/dotfiles.git ~/.dotfiles`.
   Remove the fresh-install defaults that would collide: `~/.profile`, `~/.zshrc`, and the old `~/.gitconfig`
   restored in step 1 (the repo has the current one). Then `cd ~/.dotfiles && stow config`. `.stowrc` sets
   `--no-folding` — keep it, so apps never write caches or credentials into this public repo. If stow reports another
   conflict, look at the file: if it's a fresh-install default, delete it and re-stow; if not, ask the user.
2. **CLI logins.** `ssh … "cat desktop-backup-2026-11-04/cli-logins-2026-11-04.tar.zst" | tar --zstd -xpf - -C ~`
3. **Home folders and `~/.config`.** Ask the user to **close Chrome and T3 Code** first, then
   `rsync -aH krishna-godoi@cassandra.local:desktop-backup-2026-11-04/home/ ~/`.
   Symlinks inside `~/.config` point into `~/.dotfiles`, which is why step 1 comes first. Tell the user to
   **log out and back in** afterwards so GNOME (dconf), the keyring and the apps pick the restored files up.
4. **Projects.** `rsync -aH krishna-godoi@cassandra.local:desktop-backup-2026-11-04/projects/ ~/projects/`
   (18 GB, roughly 30 min on this LAN — run it in the background).
5. **Permissions.** `chmod 700 ~/.ssh ~/.gnupg && chmod 600 ~/.ssh/id_* ~/.ssh/config ~/.ssh/*.pem`.
6. **cassandra → desktop sync (lsyncd).** Follow `cassandra/README.md` in this repo: append
   `cassandra/authorized_keys-lsyncd` to `~/.ssh/authorized_keys`, create
   `~/projects/worker-toolkit-potion-polyglot/repos/potion-app` if step 4 didn't, then on cassandra run
   `ssh-keygen -R krishna-godoi.local && systemctl --user restart lsyncd-potion-app` (the desktop's host key changed,
   and lsyncd uses `StrictHostKeyChecking=accept-new`, which refuses a changed key). Confirm the unit stays active.
7. **Work projects.** Re-clone them into `/var/www/...` and `~/magebit-docker` at the paths step 1 recreated
   (`sudo tar` already put the secret files there, so clone into those existing directories, e.g.
   `git init && git remote add origin … && git fetch && git checkout -f <branch>`). magebit-docker: run its
   `make certs`; it reuses the restored mkcert CA in `~/.local/share/mkcert`, so browsers trust `*.docker` after
   `mkcert -install`.

## Step 3 — check

- `cass --ip` prints cassandra's address; `cass true` logs in without a password.
- `git config user.name` → `krishna-godoi`; `ssh -T git@github.com` authenticates.
- `aws sts get-caller-identity`, `az account show`, `kubectl config current-context` work.
  `tsh` and AWS SSO sessions expire on their own: `tsh login` / `aws sso login` again is expected, not a failed restore.
- Neovim starts and lazy.nvim installs plugins; tmux, starship and WezTerm look right.
- WezTerm is launched via `~/.local/share/applications/org.wezfurlong.wezterm.desktop` (`XMODIFIERS=@im=none`):
  without it WezTerm leaks X windows and Chrome slows down.
- Chrome profile, T3 Code threads, GNOME shortcuts and saved passwords (keyring) are back.
- Tracked dotfiles are still symlinks (any listed here have drifted):
  `cd ~/.dotfiles/config && git ls-files | while read f; do [ "$(readlink -f ~/"$f")" = "$PWD/$f" ] || echo "$f"; done | grep -v -E 'fonts|nvim/|tmux/plugins'`

The apps themselves (WezTerm, Neovim, starship, tmux, Chrome, T3 Code, Docker, the cloud CLIs) are not in the backup:
install them as usual; their configs and logins come back from the steps above.
