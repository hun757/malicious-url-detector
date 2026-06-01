importScripts("detector.js");

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {

  if (!changeInfo.url) {
    return;
  }

  const url = changeInfo.url;

  if (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.includes("warning.html")
  ) {
    return;
  }

  let domain;

  try {
    domain = new URL(url).hostname;
  } catch (error) {
    return;
  }

  chrome.storage.local.get({ trustedSites: [] }, function(result) {

    const trustedSites = result.trustedSites;

    if (trustedSites.includes(domain)) {
      console.log("Trusted site:", domain);
      return;
    }

    const analysis = analyzeURL(url);

    console.log("Analyzing:", url);
    console.log("Score:", analysis.score);

    if (analysis.score >= 70) {

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
    }
  });
});