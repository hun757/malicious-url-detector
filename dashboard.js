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
    const stats = result.stats;
    const scanLogs = result.scanLogs;

    document.getElementById("totalScanned").textContent = stats.totalScanned;
    document.getElementById("safeCount").textContent = stats.safe;
    document.getElementById("suspiciousCount").textContent = stats.suspicious;
    document.getElementById("highRiskCount").textContent = stats.highRisk;
    document.getElementById("blockedCount").textContent = stats.blocked;

    const logTable = document.getElementById("logTable");
    logTable.innerHTML = "";

    scanLogs.forEach(log => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${log.time}</td>
        <td>${log.domain}</td>
        <td>${log.score}</td>
        <td>${log.status}</td>
        <td>${log.blocked ? "Yes" : "No"}</td>
      `;

      logTable.appendChild(row);
    });
  }
);

document.getElementById("clearBtn").addEventListener("click", function() {
  chrome.storage.local.set(
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
    function() {
      location.reload();
    }
  );
});