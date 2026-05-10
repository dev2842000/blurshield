const OVERLAY_ID = "blurshield-overlay";

// Bridge: MAIN world (injected.js) → ISOLATED world (here) via postMessage.
// We write directly to chrome.storage.local — no background hop — so a sleeping
// MV3 service worker can never drop this signal.
window.addEventListener("message", (event) => {
  if (event.source !== window || !event.data?.__blurshield) return;
  chrome.storage.local.set({ privacyMode: event.data.__blurshield === "started" });
});

// --- Domain matching ---
function matchesSite(hostname, pattern) {
  const h = hostname.toLowerCase();
  const p = pattern.toLowerCase().replace(/^www\./, "");
  return h === p || h === "www." + p || h.endsWith("." + p);
}

function isCurrentSiteProtected(sites) {
  return sites.some((s) => matchesSite(location.hostname, s));
}

// --- Blur overlay ---
function applyBlur() {
  if (document.getElementById(OVERLAY_ID)) return;

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.style.cssText = [
    "position:fixed",
    "inset:0",
    "width:100vw",
    "height:100vh",
    "backdrop-filter:blur(24px)",
    "-webkit-backdrop-filter:blur(24px)",
    "background:rgba(0,0,0,0.35)",
    "z-index:2147483647",
    "pointer-events:none",
  ].join(";");

  const label = document.createElement("div");
  label.style.cssText = [
    "position:absolute",
    "bottom:16px",
    "right:16px",
    "background:rgba(0,0,0,0.7)",
    "color:#fff",
    "font:600 12px/1 -apple-system,sans-serif",
    "padding:6px 10px",
    "border-radius:6px",
    "letter-spacing:0.5px",
    "pointer-events:none",
  ].join(";");
  label.textContent = "🛡 BlurShield active";
  overlay.appendChild(label);

  const attach = () => {
    if (document.body) document.body.appendChild(overlay);
    else document.addEventListener("DOMContentLoaded", attach, { once: true });
  };
  attach();
}

function removeBlur() {
  document.getElementById(OVERLAY_ID)?.remove();
}

// --- Evaluate current blur state from storage ---
function evaluate() {
  chrome.storage.sync.get({ sites: [] }, ({ sites }) => {
    chrome.storage.local.get({ privacyMode: false }, ({ privacyMode }) => {
      if (privacyMode && isCurrentSiteProtected(sites)) applyBlur();
      else removeBlur();
    });
  });
}

// On page load
evaluate();

// React to any storage change — both sync (sites list) and local (privacy mode).
// This fires in every tab's content script automatically, no message passing needed.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && "privacyMode" in changes) evaluate();
  if (area === "sync" && "sites" in changes) evaluate();
});
