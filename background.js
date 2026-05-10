// Background only handles badge updates and keyboard shortcut.
// Critical state (privacyMode) lives in chrome.storage.local and is written
// directly by content scripts — no message passing, no sleeping-worker risk.

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !("privacyMode" in changes)) return;
  const enabled = changes.privacyMode.newValue;
  chrome.action.setBadgeText({ text: enabled ? "ON" : "" });
  chrome.action.setBadgeBackgroundColor({ color: enabled ? "#ef4444" : "#6b7280" });
});

// Keyboard shortcut fallback for native screen share apps
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle-privacy") return;
  const { privacyMode } = await chrome.storage.local.get({ privacyMode: false });
  chrome.storage.local.set({ privacyMode: !privacyMode });
});

// Restore badge on startup
chrome.runtime.onStartup.addListener(async () => {
  const { privacyMode } = await chrome.storage.local.get({ privacyMode: false });
  if (privacyMode) {
    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
  }
});
