#!/bin/bash
set -e
# Install dependencies for the project
pushd .
cd backend/
poetry install
popd

pushd .
cd frontend/
npm install
popd
