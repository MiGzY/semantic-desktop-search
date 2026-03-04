// src/App.jsx
import React, { useState } from "react";
import { ToastProvider, useToast } from "./ToastProvider";
import { search } from "./api";

function AppContent() {
    const [q, setQ] = useState("");
    const [results, setResults] = useState([]);
    const addToast = useToast();

    const handleSearch = async () => {
        try {
            const res = await search(q);
            setResults(res);
            addToast(`${res.length} results found`, "success");
        } catch (err) {
            addToast("Search failed", "error");
            console.error(err);
        }
    };

    return (
        <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
            <h1>Semantic Desktop</h1>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search..."
                    style={{ flex: 1, padding: 8, fontSize: 14 }}
                />
                <button onClick={handleSearch} style={{ padding: "8px 12px" }}>
                    Search
                </button>
            </div>

            <div>
                {results.map((r, i) => (
                    <div
                        key={i}
                        style={{
                            border: "1px solid #ccc",
                            padding: 10,
                            borderRadius: 4,
                            marginBottom: 8,
                        }}
                    >
                        {r}
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