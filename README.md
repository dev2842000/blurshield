# 🛡 BlurShield

**Automatically blurs sensitive websites the moment you start screen sharing.**

No clicking. No toggling before every call. Add a domain once — BlurShield handles the rest.

## Install

**Chrome / Brave / Arc** — manual install (free, 1 min):
1. [Download ZIP](https://github.com/dev2842000/blurshield/archive/refs/heads/main.zip) and unzip it
2. Go to `chrome://extensions` → enable **Developer mode** (top right)
3. Click **Load unpacked** → select the unzipped `blurshield-main` folder
4. Pin the extension from the puzzle icon in your toolbar

**Microsoft Edge** — coming soon on Edge Add-ons Store (free)

---

## The problem

You're on a Google Meet call, you share your screen, and suddenly your banking dashboard or company internal tool is visible to everyone. By the time you notice, it's too late.

Existing solutions make you manually blur elements one by one, or toggle a mode before every single call. That's friction at exactly the wrong moment.

---

## How BlurShield works

1. Open the extension and add a base domain — e.g. `getbit.money` or `gmail.com`
2. That's it. Go about your day.
3. The next time you share your screen on **Google Meet, Zoom, or Teams (browser)**, every page on that domain instantly blurs — subdomains, subpaths, everything.
4. When you stop sharing, the blur lifts automatically.

No manual action. No remembering. No panic.

---

## Features

- **Auto-detection** — detects screen sharing via `getDisplayMedia` (Google Meet, Zoom web, Teams web)
- **Base domain matching** — add `example.com` and it covers `app.example.com`, `dashboard.example.com`, all subpaths
- **Instant blur** — overlay applies within milliseconds of sharing starting
- **Auto-unblur** — blur lifts the moment you stop sharing
- **Manual override** — keyboard shortcut `Alt+Shift+B` for native apps (Zoom desktop, Teams desktop)
- **Syncs across devices** — your protected domain list follows you via Chrome sync
- **Zero tracking** — no servers, no analytics, no data ever leaves your browser

---

## Installation

### From Chrome Web Store *(recommended)*
> Link coming soon — currently under review

### Manual (Developer Mode)
1. Clone or download this repo
2. Open Chrome → go to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** → select the `blurshield` folder
5. The extension appears in your toolbar — pin it for easy access

---

## Usage

### Adding a protected site
1. Click the BlurShield icon in your toolbar
2. Type any domain in the input — e.g. `gmail.com`, `app.notion.so`, `yourcompany.com`
3. Click **Add** — the domain is saved and synced across your Chrome installs

### Auto-detection (browser screen sharing)
Works automatically with:
- Google Meet
- Zoom (browser version)
- Microsoft Teams (browser version)
- Any web app that uses the browser's `getDisplayMedia` API

When you click "Share screen" in any of these apps, BlurShield intercepts the signal and immediately blurs all your protected sites across all open tabs.

### Manual override (native apps)
For **Zoom desktop app**, **Teams desktop app**, or any native screen share tool:
- Press `Alt+Shift+B` to toggle blur on/off
- Or use the **Manual blur** toggle in the popup
- Remember to toggle off when your call ends

---

## How it's built

| Component | What it does |
|---|---|
| `injected.js` | Runs in the page's JS context (`world: "MAIN"`). Patches `MediaDevices.prototype.getDisplayMedia` to intercept screen share start/stop. Uses `window.postMessage` to signal the content script. |
| `content.js` | Runs in the extension's isolated context. Receives `postMessage` signals and writes directly to `chrome.storage.local`. Listens to `storage.onChanged` to apply/remove the blur overlay. |
| `background.js` | Service worker. Handles badge updates and the keyboard shortcut. Not in the critical path — so a sleeping service worker never causes missed signals. |
| `popup.js` | Extension popup. Manages the protected sites list and manual toggle. |

**Why write directly to `chrome.storage.local` instead of messaging the background?**
MV3 service workers go to sleep after ~30 seconds of inactivity. Routing screen share signals through `chrome.runtime.sendMessage` meant the background was sometimes asleep and silently dropped the message. Writing directly to storage from the content script bypasses this entirely — `storage.onChanged` fires in every tab immediately, no background needed.

**Why `MediaDevices.prototype` instead of `navigator.mediaDevices.getDisplayMedia`?**
Patching the prototype intercepts at the right level. Patching the instance property can be bypassed if the page reads the reference before the content script runs. Prototype patching is more reliable across page load timing variations.

**Why does the CSP bypass work?**
Sites like Google Meet have strict Content Security Policies that block `<script src="chrome-extension://...">` injection. Chrome MV3's `world: "MAIN"` content scripts bypass the page's CSP by design — they're injected by the browser itself, not by page-level script loading.

---

## Permissions explained

| Permission | Why it's needed |
|---|---|
| `storage` | Saves your protected domain list and blur state |
| `scripting` | Injects the blur overlay into matching pages |
| `tabs` | Reads open tab URLs to know which ones need blurring |
| `host_permissions: <all_urls>` | Required to inject into any page you've added to your list |

---

## Limitations

- **Native screen share apps** (Zoom desktop, Teams desktop, Slack desktop) cannot be auto-detected by any browser extension — the browser has no API for this. Use `Alt+Shift+B` as a one-press toggle.
- **Iframes** are not blurred (the overlay covers the top-level page only)
- Requires Chrome 111+ for `world: "MAIN"` content script support

---

## Privacy

BlurShield collects nothing. No analytics, no telemetry, no backend. Everything runs locally in your browser. See [privacy-policy.html](privacy-policy.html) for full details.

---

## Contributing

PRs welcome. Key areas for improvement:
- Firefox support (requires porting to MV2 or Firefox's MV3 implementation)
- Per-site blur intensity setting
- Allowlist for elements to exclude from blur (e.g. keep the video feed visible)

---

## License

MIT
