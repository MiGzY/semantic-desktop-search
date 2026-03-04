"""
Search engine: embeds text chunks with sentence-transformers,
stores them in a FAISS index, and retrieves the top-k nearest
neighbours for a natural-language query.
"""

import os
import json
import pickle
import hashlib
from pathlib import Path
from typing import List, Dict

import numpy as np

from ingest import extract_text, SUPPORTED_EXTENSIONS

INDEX_DIR = Path(__file__).parent / "data"
INDEX_FILE = INDEX_DIR / "faiss.index"
META_FILE = INDEX_DIR / "metadata.pkl"

# Lazy imports so the server starts quickly even if the model is still loading
_model = None
_faiss = None


def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def _get_faiss():
    global _faiss
    if _faiss is None:
        import faiss as _f
        _faiss = _f
    return _faiss


def _chunk_text(text: str, chunk_size: int = 300, overlap: int = 50) -> List[str]:
    """Split text into overlapping word-level chunks."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunks.append(" ".join(words[start:end]))
        start += chunk_size - overlap
    return chunks


class SearchEngine:
    def __init__(self):
        self._index = None          # faiss.IndexFlatIP
        self._metadata: List[Dict] = []   # [{path, snippet}, ...]

    # ── Persistence ─────────────────────────────────────────────────────────

    def load_or_build_index(self):
        INDEX_DIR.mkdir(parents=True, exist_ok=True)
        if INDEX_FILE.exists() and META_FILE.exists():
            faiss = _get_faiss()
            self._index = faiss.read_index(str(INDEX_FILE))
            with open(META_FILE, "rb") as f:
                self._metadata = pickle.load(f)
            print(f"[search] Loaded index with {len(self._metadata)} chunks.")
        else:
            self._init_empty_index()
            print("[search] No existing index — starting fresh.")

    def _init_empty_index(self):
        faiss = _get_faiss()
        dim = 384  # all-MiniLM-L6-v2 output dimension
        self._index = faiss.IndexFlatIP(dim)
        self._metadata = []

    def _save(self):
        INDEX_DIR.mkdir(parents=True, exist_ok=True)
        faiss = _get_faiss()
        faiss.write_index(self._index, str(INDEX_FILE))
        with open(META_FILE, "wb") as f:
            pickle.dump(self._metadata, f)

    # ── Ingest ───────────────────────────────────────────────────────────────

    def ingest_directory(self, directory: str) -> int:
        root = Path(directory).expanduser().resolve()
        if not root.exists():
            raise FileNotFoundError(f"Directory not found: {root}")

        model = _get_model()
        new_chunks = []
        new_meta = []

        for ext in SUPPORTED_EXTENSIONS:
            for filepath in root.rglob(f"*{ext}"):
                try:
                    text = extract_text(filepath)
                    if not text.strip():
                        continue
                    for chunk in _chunk_text(text):
                        new_chunks.append(chunk)
                        new_meta.append({
                            "path": str(filepath),
                            "snippet": chunk[:200],
                        })
                except Exception as e:
                    print(f"[ingest] Skipping {filepath}: {e}")

        if not new_chunks:
            return 0

        embeddings = model.encode(new_chunks, show_progress_bar=True, normalize_embeddings=True)
        embeddings = np.array(embeddings, dtype="float32")

        if self._index is None:
            self._init_empty_index()

        self._index.add(embeddings)
        self._metadata.extend(new_meta)
        self._save()
        return len(new_chunks)

    # ── Search ───────────────────────────────────────────────────────────────

    def search(self, query: str, top_k: int = 10) -> List[Dict]:
        if self._index is None or self._index.ntotal == 0:
            return []

        model = _get_model()
        q_vec = model.encode([query], normalize_embeddings=True)
        q_vec = np.array(q_vec, dtype="float32")

        k = min(top_k, self._index.ntotal)
        scores, indices = self._index.search(q_vec, k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            meta = self._metadata[idx]
            results.append({
                "path": meta["path"],
                "snippet": meta["snippet"],
                "score": float(score),
            })
        return results

    # ── Utilities ────────────────────────────────────────────────────────────

    def index_size(self) -> int:
        return self._index.ntotal if self._index else 0

    def clear(self):
        self._init_empty_index()
        if INDEX_FILE.exists():
            INDEX_FILE.unlink()
        if META_FILE.exists():
            META_FILE.unlink()
