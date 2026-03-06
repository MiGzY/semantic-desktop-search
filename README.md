# Semantic Desktop Search

![React](https://img.shields.io/badge/React-18-blue)
![Tauri](https://img.shields.io/badge/Tauri-v2-green)
![Python](https://img.shields.io/badge/Python-3.11%2F3.12-yellow)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-teal)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

Semantic Desktop Search is a cross-platform desktop application that lets you search your local files using **natural language** rather than exact keywords. It combines a **React 18 + Tauri v2** frontend with a **FastAPI** backend powered by **sentence-transformers** embeddings and a **FAISS** vector index.

---

## ✨ Features

- 🔍 **Semantic search** — find files by meaning, not just keywords
- 📂 **Native folder picker** — browse for a directory using a native macOS/Windows/Linux dialog
- ⚡ **Fast retrieval** — FAISS flat inner-product search returns results in milliseconds
- 📊 **Live indexing progress** — real-time chunk counter and shimmer bar while indexing
- 📄 **Rich results** — shows file path, matching snippet, and similarity score
- 🖥️ **Native desktop app** — packaged via Tauri v2 for macOS, Windows, and Linux
- 🔔 **Custom toast notifications** — no external toast libraries
- 🧩 **Modular backend** — easy to extend with new file types or embedding models

### Supported file types

`.txt` `.md` `.py` `.js` `.ts` `.jsx` `.tsx` `.json` `.yaml` `.toml` `.csv` `.html` `.css` `.rst` `.pdf` `.docx`

---

## 🏗️ Architecture

```
semantic-desktop-search/
├── app/                              # Python FastAPI backend
│   ├── main.py                       # API routes (/search, /ingest, /health)
│   ├── search.py                     # FAISS index + sentence-transformers engine
│   ├── ingest.py                     # File text extraction (txt, pdf, docx, …)
│   ├── requirements.txt              # Python dependencies
│   └── data/                         # Persisted FAISS index (auto-created)
│       ├── faiss.index               # Vector embeddings (binary)
│       └── metadata.pkl              # File paths + snippets (pickle)
├── frontend/                         # React 18 frontend
│   ├── src/
│   │   ├── App.jsx                   # Main UI (search + ingest + results)
│   │   ├── api.js                    # fetch() calls to FastAPI backend
│   │   └── ToastProvider.jsx         # Custom toast notification system
│   └── public/
│   │   └── index.html                # HTML shell that React injects itself into
├── src-tauri/                        # Tauri v2 desktop wrapper
│   ├── src/
│   │   └── main.rs                   # Tauri app entry point + dialog plugin
│   ├── capabilities/
│   │   └── default.json              # Tauri permissions (dialog:allow-open)
│   ├── icons/                        # App icons (all sizes + formats)
│   │   ├── icon.png                  # Master icon (512x512)
│   │   ├── icon.icns                 # macOS
│   │   ├── icon.ico                  # Windows
│   │   ├── 32x32.png
│   │   ├── 128x128.png
│   │   ├── 128x128@2x.png
│   │   └── Square*Logo.png           # Windows Store icons
│   ├── tauri.conf.json               # Tauri configuration
│   ├── Cargo.toml                    # Rust dependencies
│   └── build.rs                      # Tauri build script
├── docs/
│   └── screenshot-main.png
├── README.md
├── start.sh                          # One-command dev launcher
└── stop-servers.sh                   # Kills backend (8000) and frontend (3000)
```

---

## 🛠️ Prerequisites

- **Node.js 18+**
- **Python 3.11 or 3.12** — Python 3.13+ is not supported (`torch` requires 3.11/3.12)
- **Rust toolchain** — [install here](https://www.rust-lang.org/tools/install)
- **Tauri v2 OS prerequisites** — see [Tauri docs](https://tauri.app/start/prerequisites/) for your OS

> ⚠️ **Do not use Python 3.13 or 3.14** — `torch` and `sentence-transformers` do not have wheels for these versions yet. Install Python 3.11 via Homebrew if needed:
> ```bash
> brew install python@3.11
> ```

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

1. Detect Python 3.11 or 3.12 (installs via Homebrew if missing)
2. Create a `.venv` inside `app/` and install Python dependencies
3. Start the FastAPI backend on `http://127.0.0.1:8000`
4. Install frontend npm dependencies if needed
5. Start the React dev server on `http://localhost:3000`
6. Launch the Tauri desktop window
7. Clean up all processes when you close the app

---

## 🔎 Usage

### 1 — Index a directory

Click **📁 Browse** to open a native folder picker, or type a path directly (e.g. `/Users/you/Documents`), then click **Index**. A live progress counter shows chunks being embedded in real time. Large directories may take several minutes on first run — the index is saved to `app/data/` and reused on subsequent starts.

### 2 — Search

Type a natural-language query (e.g. *"meeting notes about the Q3 budget"*) and press **Enter** or click **Search**. Results show:

- 📄 **File path** — where the match was found
- **Matching snippet** — the text chunk closest to your query
- **Similarity %** — cosine similarity score

### 3 — Reset the index

```bash
curl -X DELETE http://127.0.0.1:8000/index
```

Or delete the `app/data/` folder manually.

---

## 🐍 Backend API

The FastAPI backend runs on `http://127.0.0.1:8000`. Interactive docs at `http://127.0.0.1:8000/docs`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server status and indexed chunk count |
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

## ⚠️ Known Issues & Troubleshooting

**Backend won't start / torch errors**
Make sure you're using Python 3.11 or 3.12. Recreate the venv if needed:
```bash
cd app
rm -rf .venv
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**`uvicorn` uses wrong Python version**
Always run uvicorn via the venv path:
```bash
.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
```

**Port 8000 already in use**
Run `./stop-servers.sh` — it automatically clears both ports 3000 and 8000.

**Browse button does nothing**
The native folder picker only works inside the Tauri desktop window, not in the browser at `localhost:3000`.

---

## 📌 Notes

- Always use `start.sh` during development — it boots all three layers in the right order.
- The FAISS index persists between sessions in `app/data/`.
- Use `stop-servers.sh` to kill servers on ports 3000 and 8000.  If it's still stuck after this, run:
  sudo lsof -i :8000
  sudo lsof -i :3000

---

## 🚀 Releasing

See the full release checklist: [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md)

---

## 📜 License

MIT License — Copyright (c) 2026 Miguel Manzano
