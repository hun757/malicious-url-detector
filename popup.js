chrome.tabs.query(
  { active: true, currentWindow: true },
  function(tabs) {

    const currentURL = tabs[0].url;

    document.getElementById("url").textContent =
      currentURL;
  }
);