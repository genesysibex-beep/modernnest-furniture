# ModernNest Furniture — Proof of Concept

A static, single-page furniture e-commerce website built with plain HTML, CSS, and
JavaScript. No build step, no backend, no framework — it runs by opening `index.html`
directly, or hosted for free on GitHub Pages.

This is a **frontend-only proof of concept**. It includes clean, clearly-marked
placeholders for two features that will be added later:

- **Customer login**, to be replaced with **OAuth 2.0 / OpenID Connect**
- **The floating "Chat with us" button**, to be replaced with **Genesys Cloud Web
  Messenger**

Both placeholders are marked with `// TODO` comments in `app.js`.

## Project structure

```text
furniture-website/
├── index.html      Page structure and content
├── style.css        All styling (no external CSS frameworks)
├── app.js           All behavior (no external JS frameworks)
├── images/          Placeholder product illustrations (SVG)
└── README.md         This file
```

## Running it locally

No installation or server required. Just open the file in a browser:

1. Download or clone this folder.
2. Double-click `index.html` (or right-click → **Open with** → your browser).

## Publishing with GitHub Pages

### 1. Create a GitHub repository

1. Go to [github.com/new](https://github.com/new).
2. Name the repository (for example, `furniture-website`).
3. Choose **Public** (GitHub Pages on the free tier requires a public repo,
   unless you're on GitHub Team/Enterprise).
4. Click **Create repository**. Leave it empty — don't add a README here, since
   you already have one.

### 2. Upload the files

**Option A — using the GitHub website (no Git required):**

1. Open your new repository on GitHub.
2. Click **Add file → Upload files**.
3. Drag in `index.html`, `style.css`, `app.js`, `README.md`, and the whole
   `images/` folder (drag the folder in directly — GitHub preserves the
   folder structure).
4. Scroll down and click **Commit changes**.

**Option B — using Git from your computer:**

```bash
cd furniture-website
git init
git add .
git commit -m "Initial commit: ModernNest Furniture proof of concept"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/furniture-website.git
git push -u origin main
```

Replace `YOUR-USERNAME` and the repository name with your own.

### 3. Enable GitHub Pages

1. In your repository, go to **Settings**.
2. In the left sidebar, click **Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Under **Branch**, choose `main` and folder `/ (root)`, then click **Save**.
5. Wait a minute or two — GitHub will show a banner with your live URL once
   it's published.

### 4. Open the published website

Your site will be live at:

```text
https://YOUR-USERNAME.github.io/furniture-website/
```

(Replace `YOUR-USERNAME` and `furniture-website` with your actual GitHub
username and repository name.) You can find this exact URL any time under
**Settings → Pages**.

## What's implemented vs. placeholder

| Feature | Status |
|---|---|
| Responsive layout (desktop / tablet / mobile) | ✅ Implemented |
| Product grid with 6 furniture items | ✅ Implemented |
| "View Details" product modal | ✅ Implemented |
| Login button + login modal UI | ✅ Implemented (UI only — no real auth) |
| OAuth 2.0 / OpenID Connect sign-in | ⏳ Placeholder — see `TODO` in `app.js` |
| "Chat with us" floating button + click feedback | ✅ Implemented |
| Genesys Cloud Web Messenger integration | ⏳ Placeholder — see `TODO` in `app.js` |

## Where to plug in the real integrations later

Both integration points are isolated in `app.js` so they're easy to find and
replace without touching the rest of the site:

- **Login (`loginForm` submit handler)** — currently just shows a message and
  closes the modal. Replace the handler with a redirect to your identity
  provider's `/authorize` endpoint, or wire in an OIDC client library. Handle
  the token exchange in a dedicated callback route, and never store client
  secrets in this static frontend.
- **Chat button (`chatFab` click handler)** — currently just shows a toast
  message. Replace it with the Genesys Cloud Web Messenger deployment script,
  and pass the authenticated customer's identity (from the step above) in as
  participant attributes so Genesys Architect can route the conversation.

## Notes on the images

The `images/` folder contains simple SVG illustrations used as stand-ins for
real product photography, styled to match the site's color palette. Swap them
out for real photos (JPEG or WebP) of the same filenames — the layout is
built to handle either.

## Browser support

Built with standard, widely-supported CSS and JavaScript (CSS Grid, Flexbox,
`fetch`-free vanilla JS). Works in all current versions of Chrome, Firefox,
Safari, and Edge.
