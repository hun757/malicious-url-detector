importScripts("detector.js", "decision.js");

const recentScans = new Map();
const inFlight = new Map();

function shouldSkipUrl(url) {
  return !/^https?:\/\//i.test(url || "");
}

async function scanUrl(url) {
  let backend = null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: controller.signal
    });

    if (response.ok) {
      backend = await response.json();
    }
  } catch (error) {
    // If Flask is offline, the heuristic decision still works.
  } finally {
    clearTimeout(timer);
  }

  return decideURL(url, backend);
}

async function saveScanResult(url, analysis, blocked) {
  const domain = new URL(url).hostname;

  const { scanLogs = [] } = await chrome.storage.local.get({
    scanLogs: []
  });

  const entry = {
    url,
    domain,
    score: analysis.score,
    status: analysis.status,
    blocked,
    time: new Date().toISOString(),
    heuristicScore: analysis.heuristicScore,
    mlProbability: analysis.mlProbability,
    intelStatus: analysis.intelStatus
  };

  await chrome.storage.local.set({
    scanLogs: [entry, ...scanLogs].slice(0, 50)
  });
}

async function processUrl(tabId, url) {
  if (shouldSkipUrl(url)) return;

  const key = `${tabId}:${url}`;
  const now = Date.now();

  if (
    inFlight.has(key) ||
    now - (recentScans.get(key) || 0) < 3000
  ) {
    return;
  }

  inFlight.set(key, true);

  try {
    const analysis = await scanUrl(url);
    const tab = await chrome.tabs.get(tabId);

    // Do not redirect if the user has already moved to another URL.
    if (tab.url !== url && tab.pendingUrl !== url) return;

    const { trustedSites = [] } = await chrome.storage.local.get({
      trustedSites: []
    });

    const blocked =
      analysis.score >= 70 &&
      !trustedSites.includes(new URL(url).hostname);

    if (blocked) {
      const params = new URLSearchParams({
        blockedUrl: url,
        score: String(analysis.score),
        reasons: JSON.stringify(analysis.reasons)
      });

      await chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL("warning.html") + "?" + params
      });
    }

    await saveScanResult(url, analysis, blocked);

    recentScans.set(key, Date.now());

    if (recentScans.size > 200) {
      recentScans.clear();
    }
  } catch (error) {
    console.error("URL analysis failed:", error);
  } finally {
    inFlight.delete(key);
  }
}

chrome.webNavigation.onCommitted.addListener(details => {
  if (details.frameId === 0) {
    processUrl(details.tabId, details.url);
  }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
  if (details.frameId === 0) {
    processUrl(details.tabId, details.url);
  }
});

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if (message?.type !== "SCAN_URL") return;

    if (
      shouldSkipUrl(message.url) ||
      !sender.url?.startsWith(chrome.runtime.getURL("popup.html"))
    ) {
      sendResponse({ error: "Unsupported URL or sender" });
      return;
    }

    scanUrl(message.url)
      .then(sendResponse)
      .catch(() => sendResponse({ error: "Analysis failed" }));

    return true;
  }
);