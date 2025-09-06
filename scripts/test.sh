#!/bin/bash

echo "🧪 Lancement des tests"

# Tests backend
echo "🔧 Tests backend..."
cd backend
python -m pytest
cd ..

# Tests frontend
echo "⚛️ Tests frontend..."
cd web
npm test
cd ..

echo "✅ Tests terminés!"