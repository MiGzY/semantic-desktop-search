// src/App.jsx
import React, { useState, useRef } from "react";
import { ToastProvider, useToast } from "./ToastProvider";
import { search, ingestDirectory, getHealth } from "./api";

// Tauri dialog API — only available inside the desktop app
async function pickDirectory() {
    try {
        const { open } = await import("@tauri-apps/plugin-dialog");
        return await open({ directory: true, multiple: false, title: "Select a folder to index" });
    } catch {
        // Running in browser dev mode — fall back gracefully
        return null;
    }
}

function AppContent() {
    const [q, setQ] = useState("");
    const [results, setResults] = useState([]);
    const [ingestPath, setIngestPath] = useState("");
    const [ingesting, setIngesting] = useState(false);
    const [indexedCount, setIndexedCount] = useState(null);
    const pollRef = useRef(null);
    const addToast = useToast();

    const startPolling = () => {
        pollRef.current = setInterval(async () => {
            try {
                const health = await getHealth();
                setIndexedCount(health.indexed_files);
            } catch (_) {}
        }, 1000);
    };

    const stopPolling = () => {
        clearInterval(pollRef.current);
        pollRef.current = null;
    };

    const handlePickDirectory = async () => {
        const selected = await pickDirectory();
        if (selected) setIngestPath(selected);
    };

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
        setIndexedCount(0);
        startPolling();
        addToast("Indexing in progress…", "info");
        try {
            const res = await ingestDirectory(ingestPath.trim());
            const msg = res?.message ?? "Indexing complete";
            addToast(msg, "success");
        } catch (err) {
            addToast("Ingest failed: " + (err?.message ?? "unknown error"), "error");
            console.error(err);
        } finally {
            stopPolling();
            try {
                const health = await getHealth();
                setIndexedCount(health.indexed_files);
            } catch (_) {}
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
            <div style={{ marginBottom: 20, background: "#f5f5f5", padding: 12, borderRadius: 6 }}>
                
                <p style={{ fontWeight: "bold", marginBottom: 8, marginTop: 0 }}>📂 Index a directory</p>
                <div style={{ display: "flex", gap: 8 }}>
                    <input
                        type="text"
                        value={ingestPath}
                        onChange={(e) => setIngestPath(e.target.value)}
                        placeholder="/Users/you/Documents"
                        style={{ flex: 1, padding: 8, fontSize: 14 }}
                    />
                    <button
                        onClick={handlePickDirectory}
                        disabled={ingesting}
                        title="Browse for folder"
                        style={{ padding: "8px 12px", whiteSpace: "nowrap" }}
                    >
                        📁 Browse
                    </button>
                    <button
                        onClick={handleIngest}
                        disabled={ingesting || !ingestPath.trim()}
                        style={{ padding: "8px 12px", whiteSpace: "nowrap" }}
                    >
                        {ingesting ? "Indexing…" : "Index"}
                    </button>
                </div>

                {/* Progress indicator */}
                {ingesting && indexedCount !== null && (
                    <div style={{ marginTop: 10 }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12,
                            color: "#555",
                            marginBottom: 4
                        }}>
                            <span>⚙️ Embedding chunks…</span>
                            <span>{indexedCount.toLocaleString()} chunks indexed</span>
                        </div>
                        <div style={{ height: 6, background: "#ddd", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{
                                height: "100%",
                                width: "100%",
                                background: "linear-gradient(90deg, #4f8ef7 0%, #a78bfa 100%)",
                                backgroundSize: "200% 100%",
                                animation: "shimmer 1.5s infinite linear",
                            }} />
                        </div>
                    </div>
                )}

                {/* Done state */}
                {!ingesting && indexedCount !== null && (
                    <div style={{ marginTop: 10, fontSize: 12, color: "#2a7a2a" }}>
                        ✅ Index complete — {indexedCount.toLocaleString()} chunks stored
                    </div>
                )}
            </div>

            {/* Shimmer animation */}
            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>

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
