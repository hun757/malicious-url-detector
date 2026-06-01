# Malicious URL Detector

A browser extension that detects potentially malicious or phishing URLs in real time using heuristic analysis techniques.

---

## Project Overview

This project is a cybersecurity-focused browser extension designed to analyze website URLs and identify potentially suspicious or malicious patterns.

The extension uses heuristic-based analysis methods to evaluate URLs and calculate a risk score based on indicators commonly associated with phishing websites and malicious links.

This project was developed for educational and defensive cybersecurity research purposes only.

---

## Features

* Real-time URL analysis
* Suspicious keyword detection
* HTTPS validation
* URL length analysis
* IP-address-based URL detection
* Risk scoring system
* Browser popup warning system

---

## Technologies Used

* JavaScript
* HTML/CSS
* WebExtensions API
* Google Chrome Extension Framework

---

## How Detection Works

The extension analyzes the current browser URL and checks for suspicious characteristics such as:

* Missing HTTPS encryption
* Excessively long URLs
* Suspicious phishing-related keywords
* URLs containing raw IP addresses
* Multiple hyphens or unusual formatting

Each suspicious indicator increases the overall risk score.

---

## Example Detection

Example suspicious URL:

http://secure-login-paypal.verify-account.xyz
http://neverssl.com/login-bank-secure-update-password-free-gift
http://example.com/login-bank-secure-update-password-free-gift

Possible detection results:

* No HTTPS
* Contains suspicious keywords
* Unusually long URL
* Potential phishing structure

Risk Score: High

---

## Installation

1. Clone this repository

```bash
git clone https://github.com/YOUR_USERNAME/malicious-url-detector.git
```

2. Open Google Chrome

3. Navigate to:

```txt
chrome://extensions
```

4. Enable Developer Mode

5. Click "Load unpacked"

6. Select the project folder

---

## Future Improvements

* Google Safe Browsing API integration
* Machine learning phishing detection
* Real-time website blocking
* Threat intelligence integration
* Browser notification alerts

---

## Disclaimer

This project is intended strictly for educational and defensive cybersecurity research purposes.

The developer does not encourage or support malicious activities, phishing attacks, or unauthorized access attempts.
