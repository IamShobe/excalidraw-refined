#!/bin/bash
set -e

# Install dependencies for backend
pushd .
cd backend/
poetry install
popd

# Install dependencies for frontend
pushd .
cd frontend/
npm install
popd

# Install dependencies for the project
npm install