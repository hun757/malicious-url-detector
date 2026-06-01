console.log("Background service worker loaded");

importScripts("detector.js");

const recentlyScanned = {};

function shouldSkipUrl(url) {
  return (
    !url ||
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("edge://") ||
    url.includes("warning.html")
  );
}

function saveScanResult(url, analysis, blocked) {
  let domain;

  try {
    domain = new URL(url).hostname;
  } catch (error) {
    console.log("Invalid URL:", url);
    return;
  }

  console.log("Saving scan result:", url, analysis.status, analysis.score);

  chrome.storage.local.get(
    {
      scanLogs: [],
      stats: {
        totalScanned: 0,
        safe: 0,
        suspicious: 0,
        highRisk: 0,
        blocked: 0
      }
    },
    function(result) {
      const scanLogs = result.scanLogs;
      const stats = result.stats;

      stats.totalScanned += 1;

      if (analysis.status === "Safe") stats.safe += 1;
      if (analysis.status === "Suspicious") stats.suspicious += 1;
      if (analysis.status === "High Risk") stats.highRisk += 1;
      if (blocked) stats.blocked += 1;

      scanLogs.unshift({
        url: url,
        domain: domain,
        score: analysis.score,
        status: analysis.status,
        blocked: blocked,
        time: new Date().toLocaleString()
      });

      chrome.storage.local.set(
        {
          scanLogs: scanLogs.slice(0, 50),
          stats: stats
        },
        function() {
          console.log("Saved successfully:", stats);
        }
      );
    }
  );
}

function processUrl(tabId, url) {
  if (shouldSkipUrl(url)) return;

  const now = Date.now();

  if (recentlyScanned[url] && now - recentlyScanned[url] < 3000) {
    return;
  }

  recentlyScanned[url] = now;

  let domain;

  try {
    domain = new URL(url).hostname;
  } catch (error) {
    return;
  }

  const analysis = analyzeURL(url);

  chrome.storage.local.get({ trustedSites: [] }, function(result) {
    const trustedSites = result.trustedSites;

    if (trustedSites.includes(domain)) {
      saveScanResult(url, analysis, false);
      return;
    }

    if (analysis.score >= 70) {
      saveScanResult(url, analysis, true);

      const warningUrl =
        chrome.runtime.getURL("warning.html") +
        "?blockedUrl=" +
        encodeURIComponent(url) +
        "&score=" +
        analysis.score +
        "&reasons=" +
        encodeURIComponent(JSON.stringify(analysis.reasons));

      chrome.tabs.update(tabId, {
        url: warningUrl
      });
    } else {
      saveScanResult(url, analysis, false);
    }
  });
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.url) {
    console.log("tabs.onUpdated detected:", tab.url);
    processUrl(tabId, tab.url);
  }
});

chrome.webNavigation.onCompleted.addListener(function(details) {
  if (details.frameId !== 0) return;

  console.log("webNavigation detected:", details.url);
  processUrl(details.tabId, details.url);
});