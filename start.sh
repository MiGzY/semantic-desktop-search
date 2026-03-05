#!/bin/bash
set -e

echo "🚀 Starting Semantic Desktop Search Dev Environment..."

# ── Backend ─────────────────────────────────────────────────────────────────
cd app

if [ ! -d ".venv" ]; then
    echo "📦 Creating Python virtual environment..."

    # Python 3.14 does not support torch yet — prefer 3.11 or 3.12
    if command -v python3.11 &>/dev/null; then
        PYTHON=python3.11
    elif command -v python3.12 &>/dev/null; then
        PYTHON=python3.12
    else
        echo "⚠️  Python 3.11/3.12 not found. Installing via Homebrew..."
        brew install python@3.11
        PYTHON=python3.11
    fi

    echo "✅ Using $($PYTHON --version)"
    $PYTHON -m venv .venv
fi

source .venv/bin/activate

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt -q

echo "🐍 Starting FastAPI backend on http://127.0.0.1:8000 ..."
uvicorn main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

echo "⏳ Waiting for backend..."
while ! nc -z 127.0.0.1 8000; do sleep 0.5; done
echo "✅ Backend ready."

deactivate
cd ..

# ── Frontend ────────────────────────────────────────────────────────────────
cd frontend
if [ ! -d "node_modules" ]; then npm install; fi

npm run dev &
FRONTEND_PID=$!

echo "⏳ Waiting for React server..."
while ! nc -z localhost 3000; do sleep 0.5; done
echo "✅ React server ready."

cd ..

# ── Tauri ────────────────────────────────────────────────────────────────────
echo "🖥️  Launching Tauri..."
npx tauri dev

# ── Cleanup ──────────────────────────────────────────────────────────────────
kill $FRONTEND_PID $BACKEND_PID 2>/dev/null || true
echo "🛑 All servers stopped."
