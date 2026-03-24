import json
import re
from pathlib import Path
from pypdf import PdfReader

pdf_path = Path(r"p:\EM PROJECT SOURCE CODE\CivicsServe\data\schemes\tn_scholarship.pdf")
metadata_path = Path(r"p:\EM PROJECT SOURCE CODE\CivicsServe\backend\data\metadata.json")

reader = PdfReader(str(pdf_path))

pages = []
for i, page in enumerate(reader.pages, start=1):
    txt = page.extract_text() or ""
    txt = re.sub(r"\s+", " ", txt).strip()
    if txt:
        pages.append((i, txt))

selected = []
for idx, (page_no, txt) in enumerate(pages):
    lower = txt.lower()
    if "scholarship" in lower or "boarding grants" in lower or "educational schemes" in lower:
        selected.append((page_no, txt))

# Add neighbors for context.
selected_pages = {p for p, _ in selected}
for p, _ in list(selected):
    selected_pages.add(max(1, p - 1))
    selected_pages.add(p + 1)

page_map = {p: t for p, t in pages}
records = []
for p in sorted(selected_pages):
    txt = page_map.get(p)
    if not txt:
        continue
    txt = txt[:1400]
    records.append({
        "category": "schemes",
        "service": "TN Scholarship Schemes",
        "text": f"Page {p}: {txt}",
        "source": "tn_scholarship.pdf"
    })

if metadata_path.exists():
    existing = json.loads(metadata_path.read_text(encoding="utf-8") or "[]")
else:
    existing = []

# Remove previously generated entries for this PDF to avoid duplicates on rerun.
existing = [
    item for item in existing
    if not (str(item.get("source", "")).lower() == "tn_scholarship.pdf" and str(item.get("service", "")).lower() == "tn scholarship schemes")
]

updated = existing + records
metadata_path.write_text(json.dumps(updated, indent=2, ensure_ascii=False), encoding="utf-8")

print(f"Total pages parsed: {len(pages)}")
print(f"Selected scheme pages: {len(selected_pages)}")
print(f"Records written: {len(records)}")
print(f"Metadata total records: {len(updated)}")
