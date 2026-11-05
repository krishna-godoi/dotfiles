# cassandra (X99 home server) — desktop side

Everything this desktop needs to talk to cassandra. Full server build/ops notes: `x99-harbor-build.md`.

## Stowed automatically (`stow config`)
- `~/bin/cassandra` (`cass`) — find cassandra on the LAN by MAC and ssh in (`cass --ip` prints the address)
- `~/bin/cass-put` (`cput`) — rsync files into `~` on cassandra
- `~/.zshrc` puts `~/bin` on `PATH`

## Manual steps after a reinstall
1. **SSH key**: restore `~/.ssh/id_ed25519` from the private backup (cassandra trusts its pubkey).
2. **ssh alias**: append `ssh-config-cassandra` to `~/.ssh/config` (optional: `cass` works without it).
3. **Hostname must stay `krishna-godoi`**: cassandra's lsyncd pushes to `krisc@krishna-godoi.local`.
   `sudo hostnamectl set-hostname krishna-godoi`
4. **Receive the lsyncd reverse sync** (cassandra → desktop, potion-app):
   ```
   sudo apt install openssh-server avahi-daemon libnss-mdns rsync   # rsync ships /usr/bin/rrsync
   cat authorized_keys-lsyncd >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys
   mkdir -p ~/projects/worker-toolkit-potion-polyglot/repos/potion-app
   ```
   Username must stay `krisc`. The key is forced to `rrsync -wo` into that one dir: keep the restrictions.
   On cassandra, `ssh-keygen -R krishna-godoi.local` will be needed (desktop host key changes on reinstall),
   then `systemctl --user restart lsyncd-potion-app`.
