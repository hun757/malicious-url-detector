const params = new URLSearchParams(window.location.search);

const blockedUrl = params.get("blockedUrl");
const score = params.get("score");
const reasons = JSON.parse(params.get("reasons") || "[]");

document.getElementById("blockedUrl").textContent = blockedUrl;
document.getElementById("score").textContent = score;

const reasonsList = document.getElementById("reasons");

reasons.forEach(reason => {
  const li = document.createElement("li");
  li.textContent = reason;
  reasonsList.appendChild(li);
});

document.getElementById("backBtn").addEventListener("click", function() {
  window.location.href = "https://www.google.com";
});

document.getElementById("trustBtn").addEventListener("click", function() {
  if (!blockedUrl) {
    alert("Blocked URL not found.");
    return;
  }

  const domain = new URL(blockedUrl).hostname;

  chrome.storage.local.get({ trustedSites: [] }, function(result) {
    const trustedSites = result.trustedSites;

    if (!trustedSites.includes(domain)) {
      trustedSites.push(domain);
    }

    chrome.storage.local.set({ trustedSites: trustedSites }, function() {
      window.location.href = blockedUrl;
    });
  });
});