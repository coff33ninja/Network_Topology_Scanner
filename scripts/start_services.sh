#!/bin/bash

# Start all services for Network Topology Scanner
echo "Starting Network Topology Scanner services..."

# Start Python scanner
cd ../backend/python_scanner
python scanner.py &

# Start Node.js API
cd ../node_api
npm start &

# Start React frontend
cd ../../frontend/react_ui
npm start &

echo "All services started!"