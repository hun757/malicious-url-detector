"""Download and prepare the labeled phishing URL dataset.

Source: Kaitholikkal and Arthi B, Phishing URL dataset (2024),
Mendeley Data, V1, DOI 10.17632/vfszbj9b36.1.
The script downloads a CSV but never visits the URLs inside it.
"""

import argparse
import csv
import hashlib
from pathlib import Path
from urllib.request import urlopen


DOWNLOAD = (
    "https://data.mendeley.com/public-files/datasets/vfszbj9b36/files/"
    "f0de314f-ea72-4385-9faa-f06593bb0a2d/file_downloaded"
)

SHA256 = (
    "accb2dfbfd3329a8b5cb1b85dcad90314a660c272be755cb45d0f6865014b466"
)


def prepare(output, original=None):
    if original is None:
        with urlopen(DOWNLOAD, timeout=120) as response:
            contents = response.read()

        output.parent.mkdir(parents=True, exist_ok=True)
        original = output.parent / "mendeley-original.csv"
        original.write_bytes(contents)

    actual_hash = hashlib.sha256(original.read_bytes()).hexdigest()

    if actual_hash != SHA256:
        raise ValueError(
            "Downloaded CSV SHA-256 does not match the Mendeley file record"
        )

    output.parent.mkdir(parents=True, exist_ok=True)

    with original.open(newline="", encoding="utf-8-sig") as source, \
         output.open("w", newline="", encoding="utf-8") as target:

        reader = csv.DictReader(source)

        if not {"url", "type"}.issubset(reader.fieldnames or []):
            raise ValueError("Unexpected source CSV columns")

        writer = csv.writer(target)
        writer.writerow(["url", "label"])

        for row in reader:
            writer.writerow([row["url"], row["type"]])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)

    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "data/urls.csv",
    )

    parser.add_argument(
        "--original",
        type=Path,
        help="Previously downloaded Mendeley CSV",
    )

    args = parser.parse_args()
    prepare(args.output, args.original)