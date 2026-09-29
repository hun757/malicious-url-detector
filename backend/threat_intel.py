"""Optional Google Safe Browsing v5 lookup with response-directed caching."""

import ipaddress
import json
import os
import threading
import time
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen


class SafeBrowsing:
    def __init__(self, key=None):
        self.key = key if key is not None else os.getenv(
            "SAFE_BROWSING_API_KEY", ""
        )
        self.cache = {}
        self.lock = threading.Lock()

    def check(self, url):
        if not self.key:
            return {"status": "disabled", "threat_types": []}

        host = urlsplit(url).hostname

        try:
            ip = ipaddress.ip_address(host)

            if not ip.is_global:
                return {"status": "skipped", "threat_types": []}

        except ValueError:
            if (
                "." not in host
                or host == "localhost"
                or host.endswith(
                    (
                        ".localhost",
                        ".local",
                        ".internal",
                        ".test",
                        ".invalid",
                        ".example",
                    )
                )
            ):
                return {"status": "skipped", "threat_types": []}

        now = time.monotonic()

        with self.lock:
            cached = self.cache.get(url)

            if cached and cached[0] > now:
                return cached[1]

        try:
            query = urlencode({"key": self.key, "urls": url})

            request = Request(
                "https://safebrowsing.googleapis.com/v5/urls:search?"
                + query,
                headers={"Accept": "application/json"},
            )

            with urlopen(request, timeout=2) as response:
                payload = json.load(response)

            threats = payload.get("threats", [])

            result = {
                "status": "match" if threats else "miss",
                "threat_types": sorted(
                    {
                        threat_type
                        for threat in threats
                        for threat_type in threat.get("threatTypes", [])
                    }
                ),
            }

            duration = float(
                payload.get("cacheDuration", "0s").removesuffix("s")
            )

            if duration > 0:
                with self.lock:
                    if len(self.cache) >= 1000:
                        self.cache.clear()

                    self.cache[url] = (
                        time.monotonic() + min(duration, 86400),
                        result,
                    )

            return result

        except (OSError, ValueError, KeyError, TypeError):
            return {"status": "error", "threat_types": []}