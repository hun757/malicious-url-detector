function analyzeURL(url) {
  let score = 0;
  let reasons = [];

  const suspiciousKeywords = [
    "login",
    "verify",
    "account",
    "secure",
    "update",
    "bank",
    "password",
    "free",
    "gift",
    "prize"
  ];

  if (!url.startsWith("https://")) {
    score += 25;
    reasons.push("URL does not use HTTPS");
  }

  if (url.length > 100) {
    score += 15;
    reasons.push("URL is unusually long");
  }

  suspiciousKeywords.forEach(keyword => {
    if (url.toLowerCase().includes(keyword)) {
      score += 10;
      reasons.push(`Contains suspicious keyword: ${keyword}`);
    }
  });

  if (/\d+\.\d+\.\d+\.\d+/.test(url)) {
    score += 20;
    reasons.push("URL contains an IP address");
  }

  if ((url.match(/-/g) || []).length >= 3) {
    score += 10;
    reasons.push("URL contains many hyphens");
  }

  if (score > 100) {
    score = 100;
  }

  let status = "Safe";

  if (score >= 70) {
    status = "High Risk";
  } else if (score >= 40) {
    status = "Suspicious";
  }

  return {
    score,
    status,
    reasons
  };
}