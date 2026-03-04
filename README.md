# Semantic Desktop Search

![React](https://img.shields.io/badge/React-18-blue)
![Tauri](https://img.shields.io/badge/Tauri-v2-green)
![Python](https://img.shields.io/badge/Python-3.10%2B-yellow)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-teal)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

Semantic Desktop Search is a cross-platform desktop application that lets you search your local files using **natural language** rather than exact keywords. It combines a **React 18 + Tauri** frontend with a **FastAPI** backend powered by **sentence-transformers** embeddings and a **FAISS** vector index.

---

## ✨ Features

- 🔍 **Semantic search** — find files by meaning, not just keywords
- 📂 **Directory indexing** — point it at any folder and it indexes all supported files
- ⚡ **Fast retrieval** — FAISS flat inner-product search returns results in milliseconds
- 📄 **Rich results** — shows file path, matching snippet, and similarity score
- 🖥️ **Native desktop app** — packaged via Tauri for macOS, Windows, and Linux
- 🔔 **Custom toast notifications** — no external toast libraries
- 🧩 **Modular backend** — easy to extend with new file types or embedding models

### Supported file types

`.txt` `.md` `.py` `.js` `.ts` `.jsx` `.tsx` `.json` `.yaml` `.toml` `.csv` `.html` `.css` `.rst` `.pdf` `.docx`

---

## 🏗️ Architecture

```
semantic-desktop-search/
├── app/                        # Python FastAPI backend
│   ├── main.py                 # API routes (/search, /ingest, /health)
│   ├── search.py               # FAISS index + sentence-transformers engine
│   ├── ingest.py               # File text extraction (txt, pdf, docx, …)
│   ├── requirements.txt        # Python dependencies
│   └── data/                   # Persisted FAISS index (auto-created)
├── frontend/                   # React 18 frontend
│   ├── src/
│   │   ├── App.jsx             # Main UI (search bar + ingest panel + results)
│   │   ├── api.js              # fetch() calls to FastAPI backend
│   │   └── ToastProvider.jsx   # Custom toast notification system
│   └── public/
├── src-tauri/                  # Tauri desktop wrapper
│   ├── tauri.conf.json
│   └── Cargo.toml
├── start.sh                    # One-command dev launcher
└── stop-servers.sh             # Kills backend (8000) and frontend (3000)
```

---

## 🛠️ Prerequisites

- **Node.js 18+**
- **Python 3.10+**
- **Rust toolchain** (required for Tauri — [install here](https://www.rust-lang.org/tools/install))
- **Tauri OS prerequisites** — see [Tauri docs](https://tauri.app/v1/guides/getting-started/prerequisites) for your OS

---

## 🚀 Quick Start (Development)

Clone the repository:

```bash
git clone https://github.com/MiGzY/semantic-desktop-search.git
cd semantic-desktop-search
```

Make the launchers executable:

```bash
chmod +x start.sh stop-servers.sh
```

Run everything with one command:

```bash
./start.sh
```

This will:

1. Create a Python virtual environment inside `app/` and install dependencies
2. Start the FastAPI backend on `http://127.0.0.1:8000`
3. Install frontend npm dependencies if needed
4. Start the React dev server on `http://localhost:3000`
5. Launch the Tauri desktop window
6. Clean up all processes when you close the app

---

## 🔎 Usage

### 1 — Index a directory

Open the **"📂 Index a directory"** panel in the app, enter an absolute path (e.g. `/Users/you/Documents`), and click **Index**. The backend will crawl the directory, chunk every supported file, and embed the chunks into the FAISS index. Large directories may take a minute on the first run; subsequent runs add to the existing index.

### 2 — Search

Type a natural-language query into the search bar (e.g. *"meeting notes about the Q3 budget"*) and press **Enter** or click **Search**. Results show:

- 📄 **File path** — click to reveal in Finder/Explorer (coming soon)
- **Matching snippet** — the text chunk closest to your query
- **Similarity %** — cosine similarity score (higher = more relevant)

---

## 🐍 Backend API

The FastAPI backend runs on `http://127.0.0.1:8000`. Interactive docs are available at `http://127.0.0.1:8000/docs`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server status and indexed file count |
| POST | `/search` | Semantic search — body: `{ query, top_k }` |
| POST | `/ingest` | Index a directory — body: `{ directory }` |
| DELETE | `/index` | Clear the entire index |

---

## 📦 Production Build

Build the React frontend:

```bash
cd frontend
npm install
npm run build
```

Build the desktop app:

```bash
cd ..
npx tauri build
```

Your native application bundle will be in `src-tauri/target/release/bundle/`.

---

## 🔔 Toast Notification System

The app uses a custom `ToastProvider` — no external libraries required.

```js
const toast = useToast();
toast("Operation successful!", "success");
```

Supported types: `success` · `error` · `info`

Features: auto-dismiss with progress bar, click-to-dismiss, slide-out animation.

---

## 📌 Notes

- Always use `start.sh` during development — it boots all three layers in the right order.
- The FAISS index is persisted to `app/data/` between sessions.
- To reset the index entirely, call `DELETE /index` or delete the `app/data/` folder.
- Use `stop-servers.sh` to kill servers on ports 3000 and 8000.

---

## 🚀 Releasing

See the full release checklist: [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)

---

## 📜 License

MIT License — Copyright (c) 2026 Miguel Manzano
