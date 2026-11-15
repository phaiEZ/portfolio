# Portfolio

Next.js site with a small built-in admin at `/admin`: edit every section in place (click to edit, drag to reorder) and
add works with pictures and a link to the live site. Data lives in one SQLite file + an `uploads/` folder in `DATA_DIR`.

## Dev

```bash
cp .env.example .env.local   # set ADMIN_PASSWORD (≥12 chars) and SESSION_SECRET (openssl rand -hex 32)
npm install
npm run dev                  # http://localhost:3000, admin at /admin
```

## Production (VPS, shared Caddy proxy)

Runs in Docker on the same VPS as other sites. No host ports: the shared Caddy stack in `/opt/proxy` reaches the app
as `portfolio-app:3000` on the external `web` network. Works and uploads are in the `portfolio_data` volume.

```bash
cd /opt/portfolio
git clone https://github.com/phaiEZ/portfolio.git .
cp .env.example .env         # fill in ADMIN_PASSWORD + SESSION_SECRET
docker compose up -d --build
cp deploy/portfolio.caddy /opt/proxy/sites/
cd /opt/proxy && docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

Update by hand: `cd /opt/portfolio && ./scripts/deploy.sh`.

## Auto deploy

Push to `main` → GitHub Actions SSHes into the VPS with a key that can only run `scripts/deploy.sh`
(`command=` in `~/.ssh/authorized_keys`), which pulls and rebuilds. A failed build leaves the running site alone.
Watch it in the repo's **Actions** tab; **Run workflow** there redeploys by hand.

Repo settings → Secrets and variables → Actions:
- secrets `VPS_SSH_KEY` (private half of the deploy key) and `VPS_KNOWN_HOSTS` (`ssh-keyscan <VPS IP>`)
- variables `VPS_HOST` (VPS IP; the workflow is skipped while it's empty) and `VPS_USER` (server user)

On the VPS the public half is in `~/.ssh/authorized_keys` as
`command="/opt/portfolio/scripts/deploy.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ssh-ed25519 ...`.
If `deploy/portfolio.caddy` changes, the deploy log says so: copy it to `/opt/proxy/sites/` and reload Caddy yourself.

Backup: `docker run --rm -v portfolio_data:/data -v "$PWD":/out busybox tar czf /out/portfolio-data.tgz -C /data .`

## Security notes

- `/admin` needs the password; 5 wrong tries from one IP lock it for 15 minutes. Session = signed, httpOnly, SameSite=Strict cookie (12 h).
- Uploads: type checked by magic bytes (JPEG/PNG/WebP/AVIF only, no SVG/GIF), ≤10 MB, re-encoded to WebP ≤1600 px with metadata stripped, random file names.
- Work links must be `https://`; other links `http(s)://`; all re-checked when rendered.
- Container runs read-only as the `node` user with all capabilities dropped; CSP and security headers in `next.config.mjs`.
