# Email Signature Builder

A small single-page web app for generating Outlook-ready HTML email signatures. It uses plain HTML, CSS, and JavaScript only; there is no application backend, no npm dependency, no authentication, and no persistent user data.

## Features

- Single-page signature builder UI.
- Fields for display name, two job titles, school postal address, telephone number, work email, and school website.
- Server-side source defaults stored in `config/defaults.json` and embedded into the generated static site by `scripts/build.py`.
- Optional single JPG/PNG qualification logo upload, validated in the browser with a 500KB limit.
- Outlook-friendly table-based signature output with a left details column, separator line, and vertically centred logo column.
- Built with a simple structure that allows future signature formats to be added later.

## Project structure

```text
config/defaults.json        # Persistent school defaults, not served directly
src/                        # Source HTML, CSS, JS, and text-encoded bundled school logo
scripts/build.py            # Builds the deployable static site
public/                     # Generated static web root for nginx (not committed)

deploy/nginx-email-signature-builder.conf # Example nginx server block
```

## Configure the school defaults

Edit `config/defaults.json` before building:

```json
{
  "schoolAddress": ["Example School", "1 Learning Lane", "Education Town", "AB1 2CD"],
  "schoolTelephone": "+44 (0)1234 567890",
  "schoolWebsite": "https://www.example-school.org",
  "schoolLogoAlt": "Example School logo"
}
```

The postal address supports up to four lines. Replace the bundled logo by base64-encoding the school's JPG or PNG into `src/assets/school-logo.png.b64`; the build script decodes it to `public/assets/school-logo.png` so the deployed app still serves a normal PNG file.

## Build locally

Python 3 is required only to copy files and embed the private defaults into the generated static app.

```bash
./scripts/build.py
```

Then serve the generated `public/` directory with any static web server.

For a quick local check:

```bash
python3 -m http.server 8000 --directory public
```

Open <http://localhost:8000>.

## Debian deployment

1. Install nginx:

   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. Copy this repository to the server, for example `/opt/email-signature-builder`.

3. Edit `/opt/email-signature-builder/config/defaults.json` and replace `/opt/email-signature-builder/src/assets/school-logo.png.b64`.

4. Build the static site:

   ```bash
   cd /opt/email-signature-builder
   ./scripts/build.py
   ```

5. Configure nginx to serve only `/opt/email-signature-builder/public`. Do not point nginx at the repository root; this keeps `config/defaults.json` outside the web root.

6. Copy or adapt `deploy/nginx-email-signature-builder.conf` into `/etc/nginx/sites-available/email-signature-builder`, enable it, and reload nginx:

   ```bash
   sudo ln -s /etc/nginx/sites-available/email-signature-builder /etc/nginx/sites-enabled/email-signature-builder
   sudo nginx -t
   sudo systemctl reload nginx
   ```

7. Add HTTPS using your normal certificate workflow, such as Certbot:

   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d signatures.example.org
   ```

## Privacy and data storage

The app does not write user input or uploaded images to disk. The optional qualification logo is read in the user's browser as a data URL and is embedded into the generated signature HTML only for that browser session.
