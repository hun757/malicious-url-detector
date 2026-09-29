"""Train and evaluate a phishing/legitimate URL classification model using URL features."""

import argparse
import csv
import hashlib
import json
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, precision_recall_fscore_support
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
from features import FEATURE_NAMES, extract_features, valid_url  # noqa: E402


LABELS = {
    "benign": 0,
    "legitimate": 0,
    "safe": 0,
    "phishing": 1,
    "malicious": 1,
    "malware": 1,
    "defacement": 1,
}


def read_dataset(path):
    records = {}

    with path.open(newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)

        if not reader.fieldnames or not {"url", "label"}.issubset(reader.fieldnames):
            raise ValueError("CSV must have url,label columns")

        for row in reader:
            url = (row["url"] or "").strip()
            label = LABELS.get((row["label"] or "").strip().lower())

            if label is None or not valid_url(url):
                continue

            if url in records and records[url] != label:
                raise ValueError("Conflicting labels for the same URL")

            records[url] = label

    counts = Counter(records.values())

    if any(counts[label] < 20 for label in (0, 1)):
        raise ValueError("Need at least 20 distinct valid URLs in each class")

    return list(records), list(records.values())


def train(data_path, source, model_out, report_out):
    urls, labels = read_dataset(data_path)

    groups = [urlsplit(url).hostname.lower() for url in urls]
    features = [extract_features(url) for url in urls]

    splitter = GroupShuffleSplit(
        n_splits=50,
        test_size=0.2,
        random_state=42,
    )

    split = next(
        (
            (train_indices, test_indices)
            for train_indices, test_indices in splitter.split(
                features, labels, groups
            )
            if set(labels[i] for i in train_indices) == {0, 1}
            and set(labels[i] for i in test_indices) == {0, 1}
        ),
        None,
    )

    if split is None:
        raise ValueError(
            "Need several independent hostnames in each class "
            "for a host-separated holdout"
        )

    train_indices, test_indices = split

    pipeline = make_pipeline(
        StandardScaler(),
        LogisticRegression(max_iter=2000, random_state=42),
    )

    pipeline.fit(
        [features[i] for i in train_indices],
        [labels[i] for i in train_indices],
    )

    actual = [labels[i] for i in test_indices]
    predicted = pipeline.predict([features[i] for i in test_indices])

    tn, fp, fn, tp = confusion_matrix(
        actual, predicted, labels=[0, 1]
    ).ravel()

    precision, recall, f1, _ = precision_recall_fscore_support(
        actual,
        predicted,
        labels=[1],
        zero_division=0,
    )

    scaler = pipeline.steps[0][1]
    classifier = pipeline.steps[1][1]

    model = {
        "feature_names": list(FEATURE_NAMES),
        "mean": scaler.mean_.tolist(),
        "scale": scaler.scale_.tolist(),
        "coefficient": classifier.coef_[0].tolist(),
        "intercept": float(classifier.intercept_[0]),
    }

    report = {
        "source": source,
        "trained_at_utc": datetime.now(timezone.utc).isoformat(),
        "dataset_sha256": hashlib.sha256(data_path.read_bytes()).hexdigest(),
        "split": (
            "GroupShuffleSplit by hostname, 20% test, "
            "random_state=42; model trained on training partition only"
        ),
        "train_size": len(train_indices),
        "test_size": len(test_indices),
        "class_counts": {
            "benign": labels.count(0),
            "malicious": labels.count(1),
        },
        "precision": float(precision[0]),
        "recall": float(recall[0]),
        "f1": float(f1[0]),
        "false_positive_rate": float(fp / (fp + tn)),
        "false_negative_rate": float(fn / (fn + tp)),
        "confusion_matrix": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp),
        },
        "notes": (
            "URL-only lexical model. Holdout estimates depend on dataset "
            "quality; not a production safety guarantee."
        ),
    }

    model["source"] = report["source"]
    model["dataset_sha256"] = report["dataset_sha256"]
    model["trained_at_utc"] = report["trained_at_utc"]

    model_out.parent.mkdir(parents=True, exist_ok=True)
    report_out.parent.mkdir(parents=True, exist_ok=True)

    model_out.write_text(
        json.dumps(model, indent=2) + "\n",
        encoding="utf-8",
    )
    report_out.write_text(
        json.dumps(report, indent=2) + "\n",
        encoding="utf-8",
    )

    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)

    parser.add_argument(
        "--data",
        type=Path,
        required=True,
        help="Labeled CSV with url,label columns",
    )
    parser.add_argument(
        "--source",
        required=True,
        help="Dataset URL, collection date, and license or usage terms",
    )
    parser.add_argument(
        "--model-out",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "backend/model.json",
    )
    parser.add_argument(
        "--report-out",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "training/metrics.json",
    )

    args = parser.parse_args()

    print(
        json.dumps(
            train(args.data, args.source, args.model_out, args.report_out),
            indent=2,
        )
    )