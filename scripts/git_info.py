# Adds git dates and authors to each page's front matter before the build.
# Runs in CI only. It edits files in docs/, so don't commit the result.
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path


def fmt(iso):
    d = datetime.fromisoformat(iso)
    return f"{d.strftime('%B')} {d.day}, {d.year}"


docs = Path(sys.argv[1] if len(sys.argv) > 1 else "docs")
for path in sorted(docs.rglob("*.md")):
    log = subprocess.run(
        ["git", "log", "--follow", "--format=%aN\t%aI", "--", str(path)],
        capture_output=True,
        text=True,
    ).stdout
    rows = [l.split("\t") for l in log.splitlines() if "\t" in l]
    if not rows:
        continue  # file not committed yet
    names = [n for n, _ in rows]
    authors = sorted(set(names), key=lambda n: (-names.count(n), names[::-1].index(n)))
    meta = (
        f"git_revision_date_localized: {json.dumps(fmt(rows[0][1]))}\n"
        f"git_creation_date_localized: {json.dumps(fmt(rows[-1][1]))}\n"
        f"git_authors: {json.dumps(authors, ensure_ascii=False)}\n"
    )
    text = path.read_text(encoding="utf-8")
    end = text.find("\n---", 4) if text.startswith("---\n") else -1
    if end != -1:
        text = text[: end + 1] + meta + text[end + 1 :]
    else:
        text = f"---\n{meta}---\n\n{text}"
    path.write_text(text, encoding="utf-8")
    print("dated", path)
