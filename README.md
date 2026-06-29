# Email Signature Builder

A small single-page web app for generating Outlook-ready HTML email signatures. It uses plain HTML, CSS, and JavaScript only; there is no application backend, no npm dependency, no authentication, no build step, and no persistent user data.

## Important tradeoffs

This version is the static site itself: deploy the committed `public/` directory directly. That removes the Python build step.

There are two consequences to be aware of:

1. **Editable defaults are web-accessible.** A browser-only static app can only read files that the web server serves, so `public/defaults.js` cannot be private. This is usually acceptable for a school address, telephone number, and website because those details are public-facing anyway. Keeping defaults outside the web root requires a build step, server-side template rendering, or a backend.
2. **A real JPG/PNG logo file must be copied to the server.** The app references a normal image path, `public/assets/school-logo.png`, but this repository intentionally does not commit a binary image because the Codex PR flow reports “Binary files are not supported” when binary files are included. Deployers should copy their actual JPG/PNG logo into `public/assets/` and set the path in `public/defaults.js`.

## Features

- Single-page signature builder UI.
- Fields for display name, two job titles, school postal address, telephone number, work email, and school website.
- Editable defaults in `public/defaults.js`.
- Optional single JPG/PNG qualification logo upload, validated in the browser with a 500KB limit.
- Outlook-friendly table-based signature output with a left details column, separator line, and vertically centred logo column.
- Built with a simple structure that allows future signature formats to be added later.

## Project structure

```text
public/index.html           # Single-page UI
public/styles.css           # Styling
public/defaults.js          # Editable public defaults
public/app.js               # Signature generator logic
public/assets/README.md     # Instructions for adding the school logo

deploy/nginx-email-signature-builder.conf # Example nginx server block
```


## Get the project with git

If you have not used git before, think of `git clone` as downloading a working copy of the project onto your server or laptop.

1. Install git if it is not already installed. On Debian or Ubuntu:

   ```bash
   sudo apt update
   sudo apt install git
   ```

2. Choose where you want to keep the app. For a server deployment, `/opt` is a common location:

   ```bash
   cd /opt
   ```

   On a laptop, you can use a normal projects folder instead, for example:

   ```bash
   mkdir -p ~/projects
   cd ~/projects
   ```

3. Clone the repository. Replace the URL below with the actual GitHub repository URL if it differs:

   ```bash
   git clone https://github.com/your-organisation/email-signature-builder.git
   ```

4. Move into the project folder:

   ```bash
   cd email-signature-builder
   ```

5. Later, to download newer changes from GitHub, run this from inside the project folder:

   ```bash
   git pull
   ```

After cloning, continue with the configuration and deployment steps below.

## Configure the school defaults

Edit `public/defaults.js` before deploying:

```js
window.SIGNATURE_DEFAULTS = {
  schoolAddress: ['Example School', '1 Learning Lane', 'Education Town', 'AB1 2CD'],
  schoolTelephone: '+44 (0)1234 567890',
  schoolWebsite: 'https://www.example-school.org',
  schoolLogoPath: 'assets/school-logo.png',
  schoolLogoAlt: 'Example School logo'
};
```

The postal address supports up to four lines. Put the school's actual JPG or PNG logo in `public/assets/` and update `schoolLogoPath` if you use a different filename.

## Run locally

No build is required. Do **not** run a Python build script and do **not** look for a `scripts/build.py` file; the app is already in `public/`.

Serve `public/` with any static web server. Python's built-in web server is only one convenient way to preview static files locally:

```bash
python3 -m http.server 8000 --directory public
```

Open <http://localhost:8000>.


## GitHub conflict guidance

If GitHub shows a README conflict while merging this PR, do not choose by button label alone. Read both sides of the conflict and keep the text that says the app is served directly from `public/` and that there is **no build step**. Remove any old instructions that mention `scripts/build.py`, `config/defaults.json`, or generating `public/` before deployment. If GitHub offers “accept incoming changes” and the incoming side is this PR's no-build README, accepting incoming is correct; if the incoming side is the old build-script README, do not accept it wholesale.

## Debian deployment

1. Install nginx:

   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. Copy this repository to the server, for example `/opt/email-signature-builder`.

3. There is no build step. The nginx web root should point directly at `/opt/email-signature-builder/public`.

4. Edit `/opt/email-signature-builder/public/defaults.js`.

5. Copy the school's actual JPG or PNG logo to `/opt/email-signature-builder/public/assets/school-logo.png`, or update `schoolLogoPath` in `public/defaults.js` to match your filename.

6. Configure nginx to serve `/opt/email-signature-builder/public` as the web root.

7. Copy or adapt `deploy/nginx-email-signature-builder.conf` into `/etc/nginx/sites-available/email-signature-builder`, enable it, and reload nginx:

   ```bash
   sudo ln -s /etc/nginx/sites-available/email-signature-builder /etc/nginx/sites-enabled/email-signature-builder
   sudo nginx -t
   sudo systemctl reload nginx
   ```

8. Add HTTPS using your normal certificate workflow, such as Certbot:

   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d signatures.example.org
   ```


## nginx hardening note

The sample nginx configuration is intentionally allow-list based: it serves only `/`, `/index.html`, `/styles.css`, `/defaults.js`, `/app.js`, and `/assets/school-logo.png`/`.jpg`/`.jpeg`. Everything else returns 404.

A static browser app cannot hide files that the browser must load. In this app, `styles.css`, `defaults.js`, `app.js`, and the configured logo image are necessarily directly requestable by URL. To make defaults or logo assets inaccessible by direct URL while still rendering them in the app would require a build step that embeds them into the HTML, server-side rendering, or a backend/proxy endpoint.

## Privacy and data storage

The app does not write user input or uploaded images to disk. The optional qualification logo is read in the user's browser as a data URL and is embedded into the generated signature HTML only for that browser session.
