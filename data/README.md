# Training data

The training script expects a CSV with `url,label` columns.

Supported labels:

- Negative class: `benign`, `legitimate`, `safe`
- Positive class: `phishing`, `malicious`, `malware`, `defacement`

The committed model was trained using the "URL dataset.csv" file from:

Kaitholikkal, J. K. S., and Arthi B. (2024).
Phishing URL dataset. Mendeley Data, Version 1.
https://doi.org/10.17632/vfszbj9b36.1
License: CC BY 4.0.

`training/prepare_mendeley.py` verifies the source file hash and converts
its `type` column to `label`. The scripts parse URL strings but never visit
the URLs. Source CSV files are not committed to this repository.