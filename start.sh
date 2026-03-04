#!/bin/bash
set -e

echo "🚀 Starting Semantic Desktop Search Dev Environment..."

cd frontend
if [ ! -d "node_modules" ]; then npm install; fi

npm run dev &
FRONTEND_PID=$!

echo "⏳ Waiting for React server..."
while ! nc -z localhost 3000; do sleep 0.5; done
echo "✅ React server ready."

cd ..
echo "🖥️ Launching Tauri..."
npx tauri dev

kill $FRONTEND_PID
echo "🛑 React dev server stopped."
