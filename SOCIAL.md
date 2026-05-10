# BlurShield — Social Media Content

---

## Twitter / X Post

```
Just shipped BlurShield — a free Chrome extension that auto-blurs sensitive websites the moment you start screen sharing.

Add any domain once → it blurs automatically on Google Meet, Zoom, Teams (browser). No clicks needed mid-call.

Base domain matching. Zero tracking. All local.

🔗 Chrome Store: [link]
⭐ GitHub: [link]

#buildinpublic #privacy #devtools
```

---

## LinkedIn Thread (5 posts)

### Post 1 — Hook

```
I just shipped BlurShield — a free Chrome extension that automatically blurs sensitive websites when you start screen sharing.

Zero clicks. Works with Google Meet, Zoom, and Teams (browser version).

Here's why I built it and how it works ↓
```

---

### Post 2 — The Problem

```
Every time I share my screen on a call, there's a moment of panic.

Is my banking tab open? My inbox? An internal dashboard I shouldn't flash to 20 people?

Most existing "blur" extensions make you manually click every element before sharing. That's friction at exactly the wrong moment.

I wanted something that just... worked.
```

---

### Post 3 — The Solution

```
BlurShield works differently:

1. Open the extension → add a base domain (e.g. "getbit.money")
2. That's it.

The next time you start sharing your screen on Google Meet or Zoom (browser), every page on that domain blurs automatically — subdomains, subpaths, all of it.

When you stop sharing → blur lifts.

No manual toggle before every call. No per-element clicking. No friction.
```

---

### Post 4 — How It Works (Technical)

```
A few interesting engineering decisions behind BlurShield:

→ Manifest V3 Chrome extension (future-proof)
→ Detects screen sharing by patching navigator.mediaDevices.getDisplayMedia at document_start — before the page loads its own JS
→ When any web app (Meet, Zoom, Teams) calls it, the extension intercepts, lets it proceed, and blurs all whitelisted tabs simultaneously
→ Blur is a CSS backdrop-filter overlay — pointer-events: none, so the page stays fully clickable underneath
→ Base domain matching: add "example.com" and it covers app.example.com, staging.example.com, everything
→ chrome.storage.sync — your protected sites follow you across devices
→ No servers. No analytics. Nothing leaves your browser.

One honest caveat: native desktop apps (Zoom app, Teams app) can't be detected by any browser extension. For those, Alt+Shift+B is a one-press fallback.
```

---

### Post 5 — CTA

```
BlurShield is free and open source.

If you do demos, pair programming, or any screen sharing at work — give it a try. Add your sensitive domains once and never think about it again.

⭐ GitHub: [link]
🔗 Chrome Web Store: [link]

Built this in a day. What else would you want it to do?
```

---

## Publishing Checklist (Chrome Web Store)

1. Zip the extension: `zip -r blurshield.zip . --exclude "*.md" --exclude ".git/*"`
2. Go to https://chrome.google.com/webstore/devconsole
3. Pay one-time $5 developer fee
4. Upload zip → fill in:
   - **Name**: BlurShield
   - **Short description**: Auto-blurs protected websites when you start screen sharing. Add any domain once — no friction mid-call.
   - **Category**: Privacy & Security
   - **Screenshots**: 2–3 showing popup UI + blurred page
5. Add Privacy Policy URL (GitHub Pages with a simple policy page is fine)
6. Submit for review (typically 3–7 business days)
