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