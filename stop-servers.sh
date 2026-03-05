#!/bin/bash
echo "🛑 Stopping all Semantic Desktop Search servers..."

for PORT in 3000 8000; do
    echo "  Clearing port $PORT..."
    # Try lsof first
    PIDS=$(lsof -ti tcp:$PORT 2>/dev/null)
    if [ -n "$PIDS" ]; then
        echo "$PIDS" | xargs kill -9 2>/dev/null
        echo "  ✅ Killed PIDs $PIDS on port $PORT"
    fi
    # Also try fuser as a backup
    fuser -k $PORT/tcp 2>/dev/null && echo "  ✅ fuser cleared port $PORT" || true
done

# Double check
sleep 1
for PORT in 3000 8000; do
    REMAINING=$(lsof -ti tcp:$PORT 2>/dev/null)
    if [ -n "$REMAINING" ]; then
        echo "  ⚠️  Port $PORT still in use by PID $REMAINING — trying again..."
        kill -9 $REMAINING 2>/dev/null || true
    else
        echo "  ✅ Port $PORT is free"
    fi
done

echo "✅ Done."
