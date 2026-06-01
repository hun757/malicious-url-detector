chrome.tabs.query(
  { active: true, currentWindow: true },
  function(tabs) {
    const currentURL = tabs[0].url;

    document.getElementById("url").textContent = currentURL;

    const result = analyzeURL(currentURL);
    fetch("http://127.0.0.1:5000/predict", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    url: currentURL
  })
})
.then(response => response.json())
.then(data => {
  document.getElementById("mlProbability").textContent =
    data.phishing_probability;

  const mlLabel = document.getElementById("mlLabel");
  mlLabel.textContent = data.ml_label;

  if (data.ml_label === "Legitimate") {
    mlLabel.className = "status-badge safe-badge";
  } else if (data.ml_label === "Suspicious") {
    mlLabel.className = "status-badge suspicious-badge";
  } else {
    mlLabel.className = "status-badge high-risk-badge";
  }
})
.catch(error => {
  console.error("Python ML backend error:", error);
  document.getElementById("mlLabel").textContent = "Offline";
});

    const statusElement = document.getElementById("status");
    const scoreElement = document.getElementById("score");
    const riskFill = document.getElementById("riskFill");

    statusElement.textContent = result.status;
    scoreElement.textContent = result.score;
    riskFill.style.width = result.score + "%";

    if (result.status === "Safe") {
      statusElement.className = "status-badge safe-badge";
      riskFill.className = "risk-fill safe-fill";
    } else if (result.status === "Suspicious") {
      statusElement.className = "status-badge suspicious-badge";
      riskFill.className = "risk-fill suspicious-fill";
    } else {
      statusElement.className = "status-badge high-risk-badge";
      riskFill.className = "risk-fill high-risk-fill";
    }

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
document.getElementById("dashboardBtn").addEventListener("click", function() {
  chrome.tabs.create({
    url: chrome.runtime.getURL("dashboard.html")
  });
});