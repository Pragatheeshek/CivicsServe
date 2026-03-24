import re
from pathlib import Path
from pypdf import PdfReader

pdf_path = Path(r"p:\EM PROJECT SOURCE CODE\CivicsServe\data\schemes\tn_scholarship.pdf")
reader = PdfReader(str(pdf_path))
print('pages', len(reader.pages))
non_empty = []
for i, page in enumerate(reader.pages, start=1):
    txt = page.extract_text() or ''
    txt = re.sub(r'\s+', ' ', txt).strip()
    if txt:
        non_empty.append((i, txt))
print('non_empty_pages', len(non_empty))
for page_no, txt in non_empty[:2]:
    print(f"\nPAGE {page_no}\n{txt[:900]}")
