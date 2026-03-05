"""
Semantic Desktop Search — FastAPI Backend
Indexes files on the local filesystem and serves semantic search via
sentence-transformers embeddings + FAISS vector store.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import uvicorn

from search import SearchEngine

engine = SearchEngine()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the index (or build it) when the server starts."""
    engine.load_or_build_index()
    yield


app = FastAPI(title="Semantic Desktop Search API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "tauri://localhost"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ──────────────────────────────────────────────────────────────────

class SearchRequest(BaseModel):
    query: str
    top_k: int = 10


class SearchResult(BaseModel):
    path: str
    snippet: str
    score: float


class IngestRequest(BaseModel):
    directory: str


# ── Routes ──────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "indexed_files": engine.index_size()}


@app.post("/search", response_model=list[SearchResult])
def search(req: SearchRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    return engine.search(req.query, req.top_k)


@app.post("/ingest")
def ingest(req: IngestRequest):
    count = engine.ingest_directory(req.directory)
    return {"message": f"Indexed {count} files", "total": engine.index_size()}


@app.delete("/index")
def clear_index():
    engine.clear()
    return {"message": "Index cleared"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
