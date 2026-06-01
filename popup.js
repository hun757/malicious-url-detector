chrome.tabs.query(
  { active: true, currentWindow: true },
  function(tabs) {
    const currentURL = tabs[0].url;

    document.getElementById("url").textContent = currentURL;

    const result = analyzeURL(currentURL);

    document.getElementById("status").textContent = result.status;
    document.getElementById("score").textContent = result.score;

    const reasonsList = document.getElementById("reasons");
    reasonsList.innerHTML = "";

    if (result.reasons.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No suspicious indicators found";
      reasonsList.appendChild(li);
    } else {
      result.reasons.forEach(reason => {
        const li = document.createElement("li");
        li.textContent = reason;
        reasonsList.appendChild(li);
      });
    }
  }
);