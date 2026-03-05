# Semantic Desktop Search - GitHub Release Checklist

## ✅ Pre-Release
- [ ] Update version in `frontend/package.json`
- [ ] Update version in `src-tauri/tauri.conf.json`
- [ ] Update version in `src-tauri/Cargo.toml`
- [ ] Run full production build
- [ ] Test desktop app on local machine
- [ ] Verify toast notifications work (search + ingest)
- [ ] Verify Browse button opens native folder picker in Tauri window
- [ ] Verify live indexing progress bar works
- [ ] Confirm backend starts correctly on a clean `.venv`
- [ ] Confirm no console errors
- [ ] Update README if needed

## 🛠️ Build
- [ ] `cd app && .venv/bin/pip install -r requirements.txt` (verify no dependency conflicts)
- [ ] `cd frontend && npm install`
- [ ] `npm run build` (frontend)
- [ ] `npx tauri build` (desktop app)
- [ ] Confirm output inside `src-tauri/target/release/bundle/`

## 🐍 Backend Checks
- [ ] Python 3.11 or 3.12 confirmed (not 3.13/3.14)
- [ ] `numpy<2.0.0` confirmed in `.venv`
- [ ] `transformers<4.57.0` confirmed in `.venv`
- [ ] Backend starts cleanly: `.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000`
- [ ] `/health` endpoint returns `{"status":"ok"}`
- [ ] `/ingest` completes without 500 errors
- [ ] `/search` returns results with path, snippet, and score
- [ ] `app/data/` index persists between restarts

## 📦 GitHub Release
- [ ] Commit all changes
- [ ] Tag version (e.g., `v0.1.0`)
- [ ] Push tag to GitHub
- [ ] Create new Release on GitHub
- [ ] Upload generated binaries
- [ ] Add release notes

## 🚀 Post-Release
- [ ] Verify download works
- [ ] Test installed app end-to-end (index a folder → search → results)
- [ ] Announce release
