async function showCurrentTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  const url = tab?.url || "";
  document.getElementById("url").textContent =
    url || "No URL available";

  if (!/^https?:\/\//i.test(url)) {
    document.getElementById("status").textContent = "Unavailable";
    document.getElementById("mlLabel").textContent = "Unavailable";
    return;
  }

  let result;

  try {
    result = await chrome.runtime.sendMessage({
      type: "SCAN_URL",
      url
    });

    if (!result || result.error) {
      throw new Error(result?.error || "No response");
    }
  } catch (error) {
    // If the background request fails, show the heuristic result.
    result = decideURL(url, null);
  }

  const statusElement = document.getElementById("status");
  const riskFill = document.getElementById("riskFill");

  const badge =
    result.status === "Safe"
      ? "safe"
      : result.status === "Suspicious"
        ? "suspicious"
        : "high-risk";

  statusElement.textContent = result.status;
  statusElement.className = `status-badge ${badge}-badge`;

  document.getElementById("score").textContent = result.score;

  riskFill.style.width = result.score + "%";
  riskFill.className = `risk-fill ${badge}-fill`;

  const mlLabel = document.getElementById("mlLabel");
  mlLabel.textContent = result.mlLabel;
  const modelBadge =
  result.mlLabel === "Legitimate"
    ? "safe"
    : result.mlLabel === "Phishing Likely"
      ? "high-risk"
      : "suspicious";

mlLabel.className = `status-badge ${modelBadge}-badge`;

  document.getElementById("mlProbability").textContent =
    result.mlProbability === null
      ? "—"
      : result.mlProbability.toFixed(1);

  document.getElementById("intelStatus").textContent =
    result.intelStatus;

  const reasonsList = document.getElementById("reasons");
  reasonsList.replaceChildren();

  const reasons = result.reasons.length
    ? result.reasons
    : ["No suspicious indicators found"];

  for (const reason of reasons) {
    const li = document.createElement("li");
    li.textContent = reason;
    reasonsList.appendChild(li);
  }
}

showCurrentTab().catch(console.error);

document.getElementById("dashboardBtn").addEventListener(
  "click",
  () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("dashboard.html")
    });
  }
);