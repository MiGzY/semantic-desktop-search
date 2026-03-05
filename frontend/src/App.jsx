// src/App.jsx
import React, { useState } from "react";
import { ToastProvider, useToast } from "./ToastProvider";
import { search, ingestDirectory } from "./api";

function AppContent() {
    const [q, setQ] = useState("");
    const [results, setResults] = useState([]);
    const [ingestPath, setIngestPath] = useState("");
    const [ingesting, setIngesting] = useState(false);
    const addToast = useToast();

    const handleSearch = async () => {
        try {
            const res = await search(q);
            setResults(res);
            addToast(`${res.length} results found`, "success");
        } catch (err) {
            addToast("Search failed — is the backend running?", "error");
            console.error(err);
        }
    };

    const handleIngest = async () => {
        if (!ingestPath.trim()) return;
        setIngesting(true);
        try {
            const res = await ingestDirectory(ingestPath.trim());
            addToast(res.message, "success");
        } catch (err) {
            addToast("Ingest failed: " + err.message, "error");
            console.error(err);
        } finally {
            setIngesting(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    return (
        <div style={{ padding: 20, fontFamily: "Arial, sans-serif", maxWidth: 800, margin: "0 auto" }}>
            <h1>🔍 Semantic Desktop Search</h1>

            {/* Ingest panel */}
            <details style={{ marginBottom: 20, background: "#f5f5f5", padding: 12, borderRadius: 6 }}>
                <summary style={{ cursor: "pointer", fontWeight: "bold" }}>📂 Index a directory</summary>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <input
                        type="text"
                        value={ingestPath}
                        onChange={(e) => setIngestPath(e.target.value)}
                        placeholder="/Users/you/Documents"
                        style={{ flex: 1, padding: 8, fontSize: 14 }}
                    />
                    <button onClick={handleIngest} disabled={ingesting} style={{ padding: "8px 12px" }}>
                        {ingesting ? "Indexing…" : "Index"}
                    </button>
                </div>
            </details>

            {/* Search bar */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search your files semantically…"
                    style={{ flex: 1, padding: 8, fontSize: 14 }}
                />
                <button onClick={handleSearch} style={{ padding: "8px 12px" }}>
                    Search
                </button>
            </div>

            {/* Results */}
            <div>
                {results.length === 0 && q && (
                    <p style={{ color: "#888" }}>No results found.</p>
                )}
                {results.map((r, i) => (
                    <div
                        key={i}
                        style={{
                            border: "1px solid #ddd",
                            padding: 12,
                            borderRadius: 6,
                            marginBottom: 10,
                            background: "#fff",
                        }}
                    >
                        <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 4, wordBreak: "break-all", color: "#1a73e8" }}>
                            📄 {r.path}
                        </div>
                        <div style={{ fontSize: 13, color: "#333", lineHeight: 1.5, marginBottom: 6 }}>
                            {r.snippet}
                        </div>
                        <div style={{ fontSize: 11, color: "#888" }}>
                            Similarity: {(r.score * 100).toFixed(1)}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function App() {
    return (
        <ToastProvider>
            <AppContent />
        </ToastProvider>
    );
}
