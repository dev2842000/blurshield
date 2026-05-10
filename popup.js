const toggle = document.getElementById("privacy-toggle");
const siteList = document.getElementById("site-list");
const emptyState = document.getElementById("empty-state");
const addForm = document.getElementById("add-form");
const urlInput = document.getElementById("url-input");
const errorMsg = document.getElementById("error-msg");
const statusCard = document.getElementById("status-card");
const statusTitle = document.getElementById("status-title");
const statusSub = document.getElementById("status-sub");
const manualWarn = document.getElementById("manual-warn");

let sites = [];

function extractDomain(raw) {
  raw = raw.trim();
  if (!raw) return null;
  try {
    const withProto = raw.includes("://") ? raw : "https://" + raw;
    return new URL(withProto).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function renderSites() {
  siteList.innerHTML = "";
  emptyState.style.display = sites.length === 0 ? "block" : "none";
  sites.forEach((site) => {
    const li = document.createElement("li");
    li.className = "site-item";
    const span = document.createElement("span");
    span.className = "site-domain";
    span.textContent = site;
    const btn = document.createElement("button");
    btn.className = "site-remove";
    btn.title = "Remove";
    btn.textContent = "×";
    btn.addEventListener("click", () => removeSite(site));
    li.append(span, btn);
    siteList.appendChild(li);
  });
}

function setStatusUI(privacyMode) {
  statusCard.classList.toggle("active", privacyMode);
  statusTitle.textContent = privacyMode ? "Screen sharing — sites are blurred" : "Not sharing";
  statusSub.textContent = privacyMode
    ? "BlurShield is protecting your whitelisted sites right now."
    : "Sites will blur automatically when you share screen on Meet, Zoom, or Teams (browser).";
  toggle.checked = privacyMode;
  manualWarn.style.display = privacyMode ? "block" : "none";
}

async function removeSite(site) {
  sites = sites.filter((s) => s !== site);
  await chrome.storage.sync.set({ sites });
  renderSites();
}

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";
  const domain = extractDomain(urlInput.value);
  if (!domain) { errorMsg.textContent = "Enter a valid domain (e.g. gmail.com)"; return; }
  if (sites.includes(domain)) { errorMsg.textContent = `${domain} is already protected.`; return; }
  sites = [...sites, domain];
  await chrome.storage.sync.set({ sites });
  renderSites();
  urlInput.value = "";
  urlInput.focus();
});

// Manual toggle writes directly to local storage — same path as auto-detection
toggle.addEventListener("change", () => {
  chrome.storage.local.set({ privacyMode: toggle.checked });
  setStatusUI(toggle.checked);
});

// Live updates while popup is open
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && "privacyMode" in changes) setStatusUI(changes.privacyMode.newValue);
  if (area === "sync" && "sites" in changes) { sites = changes.sites.newValue ?? []; renderSites(); }
});

// Load initial state
chrome.storage.sync.get({ sites: [] }, ({ sites: s }) => { sites = s; renderSites(); });
chrome.storage.local.get({ privacyMode: false }, ({ privacyMode }) => setStatusUI(privacyMode));
