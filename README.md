# Malicious URL Detector

A real-time browser security extension designed to detect suspicious and phishing URLs using heuristic analysis and a Python-based phishing prediction backend.

## Features

* Real-time URL monitoring
* Heuristic phishing detection
* Risk scoring system
* Automatic high-risk URL blocking
* Custom security warning page
* Trusted website whitelist system
* Persistent local storage
* Security dashboard with scan statistics
* Python Flask phishing prediction backend
* AI-assisted phishing probability analysis
* Modern browser security UI

---

## Technologies Used

### Frontend

* JavaScript
* HTML5
* CSS3
* Chrome Extension API

### Backend

* Python
* Flask
* Flask-CORS

### Storage

* Chrome Local Storage API

---

## Project Structure

```bash
malicious-url-detector/
│
├── manifest.json
├── popup.html
├── popup.js
├── detector.js
├── background.js
├── dashboard.html
├── dashboard.js
├── warning.html
├── warning.js
├── styles.css
│
└── backend/
    └── app.py
```

---

## How It Works

1. The extension monitors visited URLs in real time.
2. URLs are analyzed using heuristic phishing detection methods.
3. Suspicious features such as:

   * suspicious keywords
   * long URLs
   * IP-based URLs
   * excessive hyphens
   * missing HTTPS
     are evaluated.
4. The extension communicates with a Python Flask backend for phishing probability prediction.
5. High-risk websites are automatically blocked and redirected to a custom warning page.
6. All scan activity is stored locally and displayed in the security dashboard.

---

## Detection Techniques

### Heuristic Analysis

* Suspicious keyword detection
* HTTPS validation
* URL structure analysis
* IP address detection
* Hyphen and length analysis

### AI-Assisted Prediction

The backend simulates phishing probability prediction using weighted URL feature analysis through a Python Flask API.

---

## Dashboard Features

* Total scanned URLs
* Safe URLs
* Suspicious URLs
* High-risk detections
* Blocked websites
* Recent scan logs

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/malicious-url-detector.git
```

### 2. Start the Python Backend

```bash
cd backend
python app.py
```

### 3. Load the Extension

1. Open Chrome
2. Go to:

```txt
chrome://extensions
```

3. Enable Developer Mode
4. Click "Load unpacked"
5. Select the project folder

---

## Future Improvements

* Real machine learning model integration
* Google Safe Browsing API integration
* Threat intelligence feeds
* CSV/JSON log export
* Interactive dashboard charts
* Cloud synchronization
* Advanced phishing dataset training

---

## Disclaimer

This project was created for educational and cybersecurity research purposes only.

## Example Test URLs

### Safe URLs

```txt
https://www.google.com
https://www.youtube.com
https://github.com
```

### Suspicious Test URLs

```txt
http://example.com/login-bank-secure-update-password-free-gift

http://192.168.1.1/verify-account-update

http://free-prize-secure-login-example.com
```

### Expected Behaviour

| URL Type       | Expected Result                     |
| -------------- | ----------------------------------- |
| Safe URL       | Low risk score / Legitimate         |
| Suspicious URL | Medium or high risk score           |
| High-Risk URL  | Automatic warning page and blocking |

---

## Example Detection Output

```txt
Status: High Risk
Risk Score: 100/100
Python ML Prediction: 85%
```


## Screenshots

### Security Warning Page
![Warning Page](C:\Users\pjhgn\OneDrive\사진\스크린샷\warning-page.png)

### Security Dashboard
![Dashboard](C:\Users\pjhgn\OneDrive\사진\스크린샷\dashboard.png)

### Popup UI
![Popup](C:\Users\pjhgn\OneDrive\사진\스크린샷\popup.png)