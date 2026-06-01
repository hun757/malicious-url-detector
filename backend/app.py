from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def simple_ml_prediction(url):
    score = 0

    suspicious_words = [
        "login",
        "verify",
        "secure",
        "bank",
        "password",
        "free",
        "gift"
    ]

    url_lower = url.lower()

    if not url.startswith("https://"):
        score += 20

    if len(url) > 80:
        score += 15

    if any(word in url_lower for word in suspicious_words):
        score += 30

    if "-" in url:
        score += 10

    if "." in url:
        score += 5

    if score > 100:
        score = 100

    label = "Legitimate"

    if score >= 70:
        label = "Phishing Likely"
    elif score >= 40:
        label = "Suspicious"

    return score, label

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    url = data.get("url", "")

    probability, label = simple_ml_prediction(url)

    return jsonify({
        "url": url,
        "phishing_probability": probability,
        "ml_label": label
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)