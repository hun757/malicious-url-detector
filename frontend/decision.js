/* Use the same risk decision for automatic scans and the popup. */
function decideURL(url, backend) {
  const heuristic = analyzeURL(url);

  const probability =
    Number.isFinite(backend?.phishing_probability) &&
    backend.phishing_probability >= 0 &&
    backend.phishing_probability <= 100
      ? backend.phishing_probability
      : null;

  const matched = backend?.threat_intel?.status === "match";

  const score = matched
    ? 100
    : probability === null
      ? heuristic.score
      : Math.round(0.6 * heuristic.score + 0.4 * probability);

  const reasons = [...heuristic.reasons];

  if (matched) {
    reasons.push("Known threat reported by Google Safe Browsing");
  }

  if (probability !== null && probability >= 70) {
    reasons.push("URL-only model estimates elevated risk");
  }

  return {
    score,
    status: score >= 70 ? "High Risk" : score >= 40 ? "Suspicious" : "Safe",
    reasons,
    heuristicScore: heuristic.score,
    mlProbability: probability,
    mlLabel: probability === null ? "Unavailable" : backend.ml_label,
    intelStatus: backend?.threat_intel?.status || "unavailable",
    threatTypes: matched ? backend.threat_intel.threat_types || [] : []
  };
}

if (typeof module !== "undefined") {
  module.exports = { decideURL };
}