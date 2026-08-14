#!/usr/bin/env python3
"""
extract_questions.py

Finds every base64-encoded quiz/guide sub-page embedded in the GrAte Apex Hub
hub files (hubs/*.html, plus any already-split hubs/data/<hub>/*_B64.txt
files), decodes them, pulls out the question-bank array (QUESTIONS /
RAW_QUESTIONS / ALL_Q) from the decoded HTML, and writes each hub's combined
question banks to a single JSON file.

Usage:
    python3 scripts/extract_questions.py
    python3 scripts/extract_questions.py --hubs biochemistry anatomy
    python3 scripts/extract_questions.py --out extracted_questions

Output:
    extracted_questions/<hub>.json   one file per hub, e.g.:
    {
      "hub": "biochemistry",
      "banks": [
        {
          "blob": "QUIZ_HTML_B64",
          "variable": "QUESTIONS",
          "count": 42,
          "questions": [ {...}, {...}, ... ]
        },
        ...
      ]
    }
"""

import argparse
import base64
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
HUBS_DIR = REPO_ROOT / "hubs"
DATA_DIR = HUBS_DIR / "data"

# Variable names the question-bank arrays are stored under, inside a
# decoded sub-page's <script>.
QUESTION_VAR_NAMES = ("RAW_QUESTIONS", "QUESTIONS", "ALL_Q")

# Matches: var/const/let SOMENAME_B64 = "....."; inside a raw hub .html file
B64_ASSIGNMENT_RE = re.compile(
    r'(?:var|const|let)\s+([A-Za-z0-9_]*B64)\s*=\s*"(.*?)"\s*;', re.S
)


def find_balanced_array(text: str, start_idx: int) -> str | None:
    """Given the index of the opening '[' of an array literal, return the
    full '[...]' substring (matching brackets, respecting quoted strings),
    or None if unbalanced."""
    depth = 0
    in_string = False
    string_char = ""
    escaped = False
    for i in range(start_idx, len(text)):
        ch = text[i]
        if in_string:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == string_char:
                in_string = False
        else:
            if ch in ('"', "'"):
                in_string = True
                string_char = ch
            elif ch == "[":
                depth += 1
            elif ch == "]":
                depth -= 1
                if depth == 0:
                    return text[start_idx : i + 1]
    return None


def extract_question_banks(decoded_html: str) -> list[dict]:
    """Scan a decoded sub-page's HTML/JS for question-array declarations
    and return a list of {variable, count, questions} dicts."""
    banks = []
    for var_name in QUESTION_VAR_NAMES:
        pattern = re.compile(
            r"(?:const|let|var)\s+" + re.escape(var_name) + r"\s*=\s*(\[)"
        )
        for m in pattern.finditer(decoded_html):
            array_text = find_balanced_array(decoded_html, m.start(1))
            if array_text is None:
                print(f"    ! could not balance brackets for {var_name}, skipping", file=sys.stderr)
                continue
            try:
                questions = json.loads(array_text)
            except json.JSONDecodeError as e:
                print(f"    ! JSON parse failed for {var_name}: {e}", file=sys.stderr)
                continue
            if isinstance(questions, list) and questions:
                banks.append(
                    {"variable": var_name, "count": len(questions), "questions": questions}
                )
    return banks


def iter_blobs_from_html(hub_html_path: Path):
    """Yield (blob_name, base64_string) for every *_B64 assignment found
    directly inside a raw hub .html file."""
    content = hub_html_path.read_text(encoding="utf-8", errors="ignore")
    for m in B64_ASSIGNMENT_RE.finditer(content):
        blob_name, b64_string = m.groups()
        yield blob_name, b64_string


def iter_blobs_from_data_dir(hub_data_dir: Path):
    """Yield (blob_name, base64_string) for every already-split
    hubs/data/<hub>/*_B64.txt file (raw base64 text, no JS wrapper)."""
    if not hub_data_dir.is_dir():
        return
    for txt_path in sorted(hub_data_dir.glob("*.txt")):
        b64_string = txt_path.read_text(encoding="utf-8", errors="ignore").strip()
        yield txt_path.stem, b64_string


def process_hub(hub_name: str) -> dict:
    print(f"[{hub_name}]")
    seen_blob_names = set()
    all_banks = []

    sources = []
    hub_html_path = HUBS_DIR / f"{hub_name}.html"
    if hub_html_path.exists():
        sources.append(iter_blobs_from_html(hub_html_path))
    sources.append(iter_blobs_from_data_dir(DATA_DIR / hub_name))

    for source in sources:
        for blob_name, b64_string in source:
            if blob_name in seen_blob_names:
                continue
            seen_blob_names.add(blob_name)

            try:
                decoded = base64.b64decode(b64_string).decode("utf-8", errors="ignore")
            except Exception as e:
                print(f"  ! failed to decode {blob_name}: {e}", file=sys.stderr)
                continue

            banks = extract_question_banks(decoded)
            for bank in banks:
                bank["blob"] = blob_name
                all_banks.append(bank)
                print(f"  {blob_name} -> {bank['variable']}: {bank['count']} questions")

    return {"hub": hub_name, "banks": all_banks}


def main():
    parser = argparse.ArgumentParser(description="Extract base64-embedded question banks from GrAte Apex Hub files.")
    parser.add_argument(
        "--hubs",
        nargs="*",
        default=["biochemistry", "physiology", "anatomy", "behavioural", "entomology"],
        help="Which hubs to process (default: all five).",
    )
    parser.add_argument(
        "--out",
        default="extracted_questions",
        help="Output directory, relative to repo root (default: extracted_questions).",
    )
    args = parser.parse_args()

    out_dir = REPO_ROOT / args.out
    out_dir.mkdir(parents=True, exist_ok=True)

    grand_total = 0
    for hub_name in args.hubs:
        result = process_hub(hub_name)
        hub_total = sum(bank["count"] for bank in result["banks"])
        grand_total += hub_total

        out_path = out_dir / f"{hub_name}.json"
        out_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"  -> wrote {out_path.relative_to(REPO_ROOT)} ({hub_total} questions total)\n")

    print(f"Done. {grand_total} questions extracted across {len(args.hubs)} hub(s) -> {out_dir.relative_to(REPO_ROOT)}/")


if __name__ == "__main__":
    main()
