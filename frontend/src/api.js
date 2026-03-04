const BASE_URL = "http://127.0.0.1:8000";

/**
 * Run a semantic search against the FastAPI backend.
 * @param {string} query - Natural language query
 * @param {number} topK  - Max results to return
 * @returns {Promise<Array<{path: string, snippet: string, score: number}>>}
 */
export async function search(query, topK = 10) {
    const res = await fetch(`${BASE_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k: topK }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Search failed (${res.status})`);
    }
    return res.json();
}

/**
 * Trigger indexing of a local directory.
 * @param {string} directory - Absolute path to the directory to index
 */
export async function ingestDirectory(directory) {
    const res = await fetch(`${BASE_URL}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directory }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Ingest failed (${res.status})`);
    }
    return res.json();
}

/**
 * Fetch backend health / index stats.
 */
export async function getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error("Backend unavailable");
    return res.json();
}
