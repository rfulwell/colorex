importScripts('matching.js');

const INDICATOR_ID = 'colorex-indicator';
const DEBOUNCE_MS = 150;

let mappings = [];
let initPromise = null;

// --- Initialization (single-flight) ---

function initialize() {
  if (initPromise) return initPromise;
  initPromise = chrome.storage.sync.get({ urlColorMappings: ColorEx.DEFAULT_MAPPINGS })
    .then(data => { mappings = data.urlColorMappings; });
  return initPromise;
}

function invalidateCache() {
  initPromise = null;
}

// --- Indicator injection via chrome.scripting ---

async function applyIndicator(tabId, hexColor) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (id, color) => {
        if (color) {
          let el = document.getElementById(id);
          if (!el) {
            el = document.createElement('div');
            el.id = id;
            document.documentElement.appendChild(el);
          }
          el.style.cssText = [
            'position:fixed', 'top:0', 'left:0', 'right:0', 'bottom:0',
            'z-index:2147483647', 'pointer-events:none',
            'transition:box-shadow 0.2s',
            `box-shadow:inset 0 0 0 4px ${color}, inset 0 4px 0 0 ${color}`
          ].join(';');
        } else {
          const el = document.getElementById(id);
          if (el) el.remove();
        }
      },
      args: [INDICATOR_ID, hexColor]
    });
  } catch {
    // Restricted pages (chrome://, chrome-extension://, etc.) will throw — ignore.
  }
}

// --- URL processing ---

async function applyColorForTab(tabId, url) {
  await initialize();
  const match = ColorEx.findMatch(url, mappings);
  await applyIndicator(tabId, match ? match.hexValue : null);
}

const updateTimers = new Map();

function debouncedApply(tabId, url) {
  clearTimeout(updateTimers.get(tabId));
  updateTimers.set(tabId, setTimeout(() => {
    updateTimers.delete(tabId);
    applyColorForTab(tabId, url);
  }, DEBOUNCE_MS));
}

// --- Event listeners ---

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.url) applyColorForTab(tab.id, tab.url);
  } catch { /* tab closed before we could read it */ }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    debouncedApply(tabId, changeInfo.url);
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  try {
    const [tab] = await chrome.tabs.query({ active: true, windowId });
    if (tab?.url) applyColorForTab(tab.id, tab.url);
  } catch { /* window may have closed */ }
});

// --- Message handling ---

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'refreshMappings') {
    invalidateCache();
    initialize().then(async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.url) await applyColorForTab(tab.id, tab.url);
      } catch { /* ignore */ }
      sendResponse({ status: 'complete' });
    });
    return true; // keep channel open for async response
  }
  if (msg.type === 'validateExpression') {
    sendResponse({ matches: ColorEx.matchUrl(msg.targetUrl, msg.expression) });
    return false;
  }
});

// --- Startup ---

async function onStart() {
  await initialize();
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) await applyColorForTab(tab.id, tab.url);
  } catch { /* no active tab */ }
}

chrome.runtime.onStartup.addListener(onStart);
chrome.runtime.onInstalled.addListener(onStart);
