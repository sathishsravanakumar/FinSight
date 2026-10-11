#!/bin/bash
# Run the Venus Forex backend API server
cd "$(dirname "$0")/backend"
echo "Starting Venus Forex API on http://localhost:8000"
echo "Docs: http://localhost:8000/docs"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
