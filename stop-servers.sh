#!/bin/bash

echo "Stopping React and Tauri development servers..."

# 1. Kill process on port 5173 (Vite/React default) or 3000 (CRA default)
# Add or change ports as needed
FOR_PORT_5173=$(lsof -t -i:5173)
FOR_PORT_3000=$(lsof -t -i:3000)

if [ ! -z "$FOR_PORT_5173" ]; then
  kill -9 $FOR_PORT_5173
  echo "Killed React/Vite on port 5173"
fi

if [ ! -z "$FOR_PORT_3000" ]; then
  kill -9 $FOR_PORT_3000
  echo "Killed React on port 3000"
fi

# 2. Kill any processes with 'tauri' in the name
pkill -f tauri

echo "Cleanup complete."