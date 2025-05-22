#!/bin/bash
# install.sh - Setup and build both backend and frontend, then start the backend server

# Exit immediately if a command exits with a non-zero status
set -e

# Check if webapp/dist directory exists
if [ ! -d "webapp/dist" ]; then
  echo "Error: webapp/dist directory does not exist. Aborting."
  exit 1
fi

# Install backend dependencies
npm install

# Build backend
npm run build

# Start backend server
npm start