
"""Extract features from a URL string for use in a machine learning model"""

import ipaddress
import math
import re
from collections import Counter
from urllib.parse import urlsplit

FEATURE_NAMES = (
    "url_length", "host_length", "dots", "hyphens", "digits", "digit_ratio",
    "subdomain_labels", "ip_host", "is_http", "has_at", "percent_encoded",
    "path_length", "query_length", "query_parameters", "punycode",
    "suspicious_words", "url_entropy",
)

WORDS = (
    "login", "verify", "account", "secure", "update",
    "bank", "password", "gift", "prize",
)


def valid_url(url):
    if not isinstance(url, str) or not 1 <= len(url) <= 4096:
        return False

    try:
        parts = urlsplit(url)
        return (
            parts.scheme.lower() in ("http", "https")
            and bool(parts.hostname)
            and parts.port != 0
        )
    except ValueError:
        return False


def extract_features(url):
    if not valid_url(url):
        raise ValueError("Expected an HTTP(S) URL of at most 4096 characters")

    parts = urlsplit(url)
    host = parts.hostname.lower()

    try:
        ipaddress.ip_address(host)
        ip_host = 1
    except ValueError:
        ip_host = 0

    counts = Counter(url)
    entropy = -sum(
        (count / len(url)) * math.log2(count / len(url))
        for count in counts.values()
    )

    searchable = (host + parts.path + "?" + parts.query).lower()
    digit_count = sum(char.isdigit() for char in url)

    return [
        len(url),                                     
        len(host),                                     
        host.count("."),                               
        url.count("-"),                              
        digit_count,                                   
        digit_count / len(url),                       
        max(0, len(host.split(".")) - 2) if not ip_host else 0,
        ip_host,                                      
        int(parts.scheme.lower() == "http"),         
        int("@" in parts.netloc),                     
        len(re.findall(r"%[0-9a-fA-F]{2}", url)),     
        len(parts.path),                              
        len(parts.query),                            
        len(parts.query.split("&")) if parts.query else 0,
        int("xn--" in host),                         
        sum(word in searchable for word in WORDS),   
        entropy,                                      
    ]