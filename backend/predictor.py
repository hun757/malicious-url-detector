"""Run a locally trained logistic regression without loading pickle files."""

import json
import math
from pathlib import Path

from features import FEATURE_NAMES, extract_features


MODEL_PATH = Path(__file__).with_name("model.json")


class Predictor:
    def __init__(self, path=MODEL_PATH):
        self.model = None

        if Path(path).exists():
            data = json.loads(Path(path).read_text(encoding="utf-8"))

            if (
                data.get("feature_names") != list(FEATURE_NAMES)
                or any(
                    len(data.get(key, [])) != len(FEATURE_NAMES)
                    for key in ("mean", "scale", "coefficient")
                )
                or any(scale <= 0 for scale in data["scale"])
            ):
                raise ValueError(
                    "Model feature schema does not match this application"
                )

            self.model = data

    def predict(self, url):
        if self.model is None:
            return None

        values = extract_features(url)
        model = self.model

        logit = model["intercept"] + sum(
            weight * (value - mean) / scale
            for weight, value, mean, scale in zip(
                model["coefficient"],
                values,
                model["mean"],
                model["scale"],
            )
        )

        return 1 / (1 + math.exp(-max(-700, min(700, logit))))