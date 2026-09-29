function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function addTextCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = String(value ?? "");
  row.appendChild(cell);
  return cell;
}

async function showDashboard() {
  const { scanLogs = [] } = await chrome.storage.local.get({
    scanLogs: []
  });

  const counts = {
    totalScanned: scanLogs.length,
    safeCount: scanLogs.filter(log => log.status === "Safe").length,
    suspiciousCount: scanLogs.filter(log => log.status === "Suspicious").length,
    highRiskCount: scanLogs.filter(log => log.status === "High Risk").length,
    blockedCount: scanLogs.filter(log => log.blocked).length
  };

  for (const [id, count] of Object.entries(counts)) {
    document.getElementById(id).textContent = count;
  }

  const table = document.getElementById("logTable");
  table.replaceChildren();

  document.getElementById("emptyState").hidden = scanLogs.length > 0;

  for (const log of scanLogs) {
    const row = document.createElement("tr");

    addTextCell(row, formatTime(log.time));
    addTextCell(row, log.domain);
    addTextCell(row, `${log.score ?? "—"} / 100`);

    const statusCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className =
      log.status === "Safe" ? "scan-badge badge-safe" :
      log.status === "Suspicious" ? "scan-badge badge-suspicious" :
      log.status === "High Risk" ? "scan-badge badge-high-risk" :
      "scan-badge";

    badge.textContent = log.status || "Unknown";
    statusCell.appendChild(badge);
    row.appendChild(statusCell);

    const redirectedCell = addTextCell(
      row,
      log.blocked ? "Yes" : "No"
    );
    redirectedCell.className = log.blocked
      ? "redirected-yes"
      : "redirected-no";

    table.appendChild(row);
  }
}

document.getElementById("clearBtn").addEventListener("click", async () => {
  await chrome.storage.local.set({ scanLogs: [] });
  await showDashboard();
});

document.getElementById("exportBtn").addEventListener("click", async () => {
  const { scanLogs = [] } = await chrome.storage.local.get({
    scanLogs: []
  });

  const blob = new Blob(
    [JSON.stringify(scanLogs, null, 2)],
    { type: "application/json" }
  );

  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = "url-scan-events.json";
  link.click();

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
});

showDashboard().catch(console.error);