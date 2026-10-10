#!/bin/sh
# Rebuilds ../content from the decoded old guides, then adds the extras and the question links.
# Usage: sh scripts/build_content.sh /path/to/decoded/guides   (run from the project root)
set -e
python3 scripts/convert_guides.py "$1" content
python3 scripts/extract_extras.py "$1" content
python3 scripts/map_questions.py .
python3 - <<'PY'
import json, glob
metas = [json.load(open(f))["meta"] for f in sorted(glob.glob("content/lessons/*.json"))]
json.dump(metas, open("content/index.json", "w"), ensure_ascii=False, indent=1)
print("index.json:", len(metas), "lessons")
PY
