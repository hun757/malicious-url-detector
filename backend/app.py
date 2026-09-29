"""Local URL analysis API. It never opens the submitted URL."""

from flask import Flask, jsonify, request

from features import valid_url
from predictor import Predictor
from threat_intel import SafeBrowsing


app = Flask(__name__)

# Load the trained model when the server starts.
model = Predictor()
intel = SafeBrowsing()


def extension_origin(origin):
    return (
        origin.startswith("chrome-extension://")
        and origin.removeprefix("chrome-extension://").isalnum()
    )


@app.after_request
def extension_cors(response):
    origin = request.headers.get("Origin", "")

    if extension_origin(origin):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"

    return response


@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return ("", 204)

    origin = request.headers.get("Origin")

    if origin and not extension_origin(origin):
        return jsonify({"error": "Extension origin required"}), 403

    data = request.get_json(silent=True)
    url = data.get("url") if isinstance(data, dict) else None

    if not valid_url(url):
        return jsonify({
            "error": "Expected an HTTP(S) URL of at most 4096 characters"
        }), 400

    probability = model.predict(url)

    if probability is None:
        label = "Unavailable"
    elif probability >= 0.7:
        label = "Phishing Likely"
    elif probability >= 0.4:
        label = "Suspicious"
    else:
        label = "Legitimate"

    return jsonify({
        "phishing_probability": (
            round(probability * 100, 2)
            if probability is not None
            else None
        ),
        "ml_label": label,
        "threat_intel": intel.check(url),
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)