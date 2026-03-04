# Semantic Desktop -- GitHub Release Checklist

## ✅ Pre-Release

-   [ ] Update version in package.json
-   [ ] Update version in tauri.conf.json
-   [ ] Run full production build
-   [ ] Test desktop app on local machine
-   [ ] Verify toast notifications work
-   [ ] Confirm no console errors
-   [ ] Update README if needed

## 🛠️ Build

-   [ ] npm install
-   [ ] npm run build (frontend)
-   [ ] npx tauri build (desktop app)
-   [ ] Confirm output inside src-tauri/target

## 📦 GitHub Release

-   [ ] Commit all changes
-   [ ] Tag version (e.g., v0.1.0)
-   [ ] Push tag to GitHub
-   [ ] Create new Release on GitHub
-   [ ] Upload generated binaries
-   [ ] Add release notes

## 🚀 Post-Release

-   [ ] Verify download works
-   [ ] Test installed app
-   [ ] Announce release
