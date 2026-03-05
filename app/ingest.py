"""
Text extraction for supported file types.
Add new extractors here and register the extension in SUPPORTED_EXTENSIONS.
"""

from pathlib import Path

SUPPORTED_EXTENSIONS = [".txt", ".md", ".py", ".js", ".ts", ".jsx", ".tsx",
                        ".json", ".yaml", ".yml", ".toml", ".csv", ".html",
                        ".css", ".rst", ".pdf", ".docx"]


def extract_text(filepath: Path) -> str:
    """Dispatch to the right extractor based on file extension."""
    ext = filepath.suffix.lower()

    if ext == ".pdf":
        return _extract_pdf(filepath)
    elif ext == ".docx":
        return _extract_docx(filepath)
    else:
        return _extract_plaintext(filepath)


# ── Extractors ───────────────────────────────────────────────────────────────

def _extract_plaintext(filepath: Path) -> str:
    try:
        return filepath.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""


def _extract_pdf(filepath: Path) -> str:
    try:
        import pdfplumber
        text_parts = []
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text_parts.append(t)
        return "\n".join(text_parts)
    except ImportError:
        print("[ingest] pdfplumber not installed — skipping PDF extraction.")
        return ""
    except Exception as e:
        print(f"[ingest] PDF error {filepath}: {e}")
        return ""


def _extract_docx(filepath: Path) -> str:
    try:
        import docx
        doc = docx.Document(str(filepath))
        return "\n".join(p.text for p in doc.paragraphs)
    except ImportError:
        print("[ingest] python-docx not installed — skipping DOCX extraction.")
        return ""
    except Exception as e:
        print(f"[ingest] DOCX error {filepath}: {e}")
        return ""
