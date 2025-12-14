# IllBetYa Fullscreen PWA (minimal)

This is a minimal Progressive Web App that demonstrates a fullscreen white app with a black header and two sub-header options.

Files added:

- `index.html` — main page
- `styles.css` — styles for fullscreen white background and header/subheaders
- `app.js` — service worker registration + UI behavior
- `manifest.json` — web app manifest (display: standalone)
- `sw.js` — basic service worker caching

How to run locally

1. Start a simple static server in the project folder. Example (PowerShell):

```powershell
python -m http.server 8000
```

or, if you have Node.js installed:

```powershell
npx http-server -c-1 . 8000
```

2. Open `http://localhost:8000` on your phone (same network) or in a desktop browser. To test installability, open Chrome on Android and use the install menu or the prompt.

Notes and caveats

- `manifest.json` uses `display: standalone`. Some browsers may prefer `fullscreen`; `standalone` is generally friendlier and keeps system UI where appropriate. You can change `display` to `fullscreen` in `manifest.json` if you want to attempt removing even the status bar.
- iOS: Safari on iOS ignores the web manifest and service worker in some situations. To make the PWA behave fullscreen on iOS, users must use the Safari “Add to Home Screen” action; include `apple-mobile-web-app-capable` meta tag (already present) and consider adding Apple-specific icons for a polished experience.
- Icons in the manifest are embedded as a small SVG data URI. Replace with proper PNG icons in an `icons/` folder for production.

Next steps (optional)

- Add proper icons and splash screens
- Improve offline behavior and caching strategy
- Add an explicit install button and UX
