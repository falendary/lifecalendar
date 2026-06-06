# Deploying Life Calendar to a DigitalOcean droplet

A step-by-step runbook to put this app online securely, locked to a single
private user (password + mandatory two-factor authentication), reachable from
your phone over HTTPS.

**Stack:** Ubuntu + Gunicorn (unix socket) + Nginx + systemd, SQLite database,
WhiteNoise for static files, free DuckDNS hostname, Let's Encrypt TLS.

The placeholder **`YOUR-SUBDOMAIN.duckdns.org`** appears throughout this guide,
in `.env.example`, and in `deploy/nginx.conf`. Replace it with your real DuckDNS
hostname in `.env` and the Nginx config on the server (it's intentionally kept
out of the repo).

---

## 1. Create the droplet

1. DigitalOcean → Create → Droplet.
2. Image: **Ubuntu 24.04 LTS**. Size: the cheapest shared-CPU plan is plenty.
3. Authentication: **SSH key** (more secure than a password).
4. Create it, note the **public IPv4 address**.

SSH in as root:

```bash
ssh root@YOUR_DROPLET_IP
```

## 2. System packages + app user

```bash
apt update && apt upgrade -y
apt install -y python3-venv python3-pip nginx git

# Dedicated unprivileged user to run the app.
adduser --disabled-password --gecos "" lifecalendar
adduser lifecalendar www-data
```

## 3. Get the code

As the `lifecalendar` user, into `/home/lifecalendar/lifecalendar`:

```bash
su - lifecalendar
git clone YOUR_REPO_URL lifecalendar   # or scp the project up
cd lifecalendar
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
```

Copy your existing data up if you want it (from your laptop):

```bash
# run on your laptop, not the droplet
scp db.sqlite3 lifecalendar@YOUR_DROPLET_IP:/home/lifecalendar/lifecalendar/
```

## 4. Configure secrets (`.env`)

Still as `lifecalendar`, in the project dir:

```bash
cp .env.example .env
# Generate a real secret key:
./venv/bin/python -c "from django.core.management.utils import get_random_secret_key as k; print(k())"
```

Edit `.env`:

```ini
SECRET_KEY=<paste the generated key>
DEBUG=False
ALLOWED_HOSTS=YOUR-SUBDOMAIN.duckdns.org
```

Lock down the file: `chmod 600 .env`.

## 5. Migrate, collect static, create your account

```bash
./venv/bin/python manage.py migrate
./venv/bin/python manage.py collectstatic --noinput
./venv/bin/python manage.py createsuperuser   # THIS is your one login
```

Quick smoke test (then Ctrl-C):

```bash
./venv/bin/gunicorn --bind 127.0.0.1:8000 config.wsgi:application
```

Exit back to root: `exit`.

## 6. systemd: run Gunicorn as a service

As root, install the socket + service unit (shipped in `deploy/`):

```bash
cp /home/lifecalendar/lifecalendar/deploy/gunicorn.socket /etc/systemd/system/
cp /home/lifecalendar/lifecalendar/deploy/gunicorn.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now gunicorn.socket
systemctl status gunicorn.socket        # should be "active (listening)"
```

The service starts on the first request to the socket. Check it:

```bash
curl --unix-socket /run/lifecalendar.sock http://localhost/account/login/ -I
systemctl status gunicorn.service
```

## 7. Nginx reverse proxy

```bash
cp /home/lifecalendar/lifecalendar/deploy/nginx.conf /etc/nginx/sites-available/lifecalendar
# (server_name is already set to YOUR-SUBDOMAIN.duckdns.org)
ln -s /etc/nginx/sites-available/lifecalendar /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
```

## 8. DuckDNS hostname

1. Go to https://www.duckdns.org, sign in (GitHub/Google), create the subdomain
   `YOUR-SUBDOMAIN`.
2. Set its IP to your droplet's public IPv4 and **Update**.
3. Verify: `dig +short YOUR-SUBDOMAIN.duckdns.org` returns your droplet IP.

(The droplet IP is static, so you don't strictly need the DuckDNS auto-update
cron. If you want it anyway, add a 5-min cron calling the DuckDNS update URL.)

Now `http://YOUR-SUBDOMAIN.duckdns.org` should load the login page.

## 9. HTTPS with Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d YOUR-SUBDOMAIN.duckdns.org --redirect -m you@example.com --agree-tos
```

Certbot edits the Nginx config to add TLS and force HTTP→HTTPS. Auto-renewal is
installed as a systemd timer; verify with `certbot renew --dry-run`.

Because `DEBUG=False`, Django now also enforces secure cookies, HSTS, and an SSL
redirect (see the security block in `config/settings.py`).

## 10. Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

## 11. Enrol two-factor authentication (required)

The app forces 2FA: after your first password login you are redirected to the
setup wizard and can't reach any page until you finish it.

1. Open `https://YOUR-SUBDOMAIN.duckdns.org` and log in with your password.
2. You land on the 2FA **setup** page. Choose **Authenticator app (TOTP)**.
3. Scan the QR code with an authenticator app (Google Authenticator, Authy,
   1Password, etc.) and enter the 6-digit code to confirm.
4. **Save the backup tokens** it shows you somewhere safe (a password manager).
   They're your way back in if you lose the phone. You can regenerate them later
   at `/account/two_factor/backup/tokens/`.

From now on every login asks for password **+** the 6-digit code.

> Lost your authenticator and backup codes? From an SSH session you can disable
> 2FA for the account and re-enrol:
> `./venv/bin/python manage.py remove_stale_devices` won't help here — instead
> delete the device in `python manage.py shell`:
> `from django_otp.plugins.otp_totp.models import TOTPDevice; TOTPDevice.objects.all().delete()`.

## 12. Use it from your phone

1. Open `https://YOUR-SUBDOMAIN.duckdns.org` — you should see the padlock.
2. Log in (password + 6-digit code).
3. Browser menu → **Add to Home Screen**. It now opens like an app.

---

## Updating the app later

```bash
su - lifecalendar
cd ~/lifecalendar
git pull
./venv/bin/pip install -r requirements.txt
./venv/bin/python manage.py migrate
./venv/bin/python manage.py collectstatic --noinput
exit
sudo systemctl restart gunicorn.service
```

## Further server hardening (recommended)

Do these once, after the app is up. Each is independent.

### SSH: key-only, no root login
Confirm your key login works first, then in `/etc/ssh/sshd_config` set:

```
PermitRootLogin no
PasswordAuthentication no
```

```bash
systemctl restart ssh
```

This blocks password brute-forcing and direct root access — the two most
common droplet attacks. (Do your admin work as a sudo user instead of root.)

### Block brute-force with fail2ban

```bash
apt install -y fail2ban
systemctl enable --now fail2ban
```

Bans IPs that repeatedly fail SSH auth. Default config covers SSH out of the box.

### Automatic security updates

```bash
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades   # answer "Yes"
```

Keeps the OS patched without you having to remember.

### DigitalOcean Cloud Firewall (defense in depth)
In the DO control panel, attach a Cloud Firewall to the droplet allowing inbound
only **22 (SSH)**, **80**, **443**. This sits in front of UFW, so a misconfigured
UFW can't accidentally expose a port.

### File permissions
```bash
chmod 600 /home/lifecalendar/lifecalendar/.env
chmod 600 /home/lifecalendar/lifecalendar/db.sqlite3
```

### Don't store your login password on the server
On the droplet, create your account **interactively** (`manage.py createsuperuser`)
rather than putting `DJANGO_SUPERUSER_PASSWORD` in the server's `.env`. The local
`.env` convenience is fine for your laptop; on a public-facing server, keep the
plaintext password out of files. The server `.env` only needs `SECRET_KEY`,
`DEBUG`, and `ALLOWED_HOSTS`.

## Backups (SQLite)

Your whole database is one file. Back it up with a daily cron, e.g.:

```bash
sqlite3 /home/lifecalendar/lifecalendar/db.sqlite3 ".backup /home/lifecalendar/backups/db-$(date +\%F).sqlite3"
```

## Troubleshooting

- **502 Bad Gateway** → Gunicorn isn't running: `systemctl status gunicorn.service`,
  `journalctl -u gunicorn.service -n 50`.
- **CSS missing / unstyled** → re-run `collectstatic`; confirm `STATIC_ROOT`
  (`staticfiles/`) exists and the service was restarted.
- **DisallowedHost error** → add the hostname to `ALLOWED_HOSTS` in `.env`,
  restart the service.
- **CSRF "Origin checking failed"** → ensure you're on `https://` and the host
  is in `ALLOWED_HOSTS` (CSRF_TRUSTED_ORIGINS is derived from it).
