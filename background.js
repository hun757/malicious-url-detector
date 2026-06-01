importScripts("detector.js");

chrome.webNavigation.onCompleted.addListener(function(details) {
  if (details.frameId !== 0) {
    return;
  }

  const url = details.url;

  if (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.includes("warning.html")
  ) {
    return;
  }

  const result = analyzeURL(url);

  if (result.score >= 70) {
    const warningUrl =
      chrome.runtime.getURL("warning.html") +
      "?blockedUrl=" +
      encodeURIComponent(url) +
      "&score=" +
      result.score +
      "&reasons=" +
      encodeURIComponent(JSON.stringify(result.reasons));

    chrome.tabs.update(details.tabId, {
      url: warningUrl
    });
  }
});