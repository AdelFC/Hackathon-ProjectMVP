#!/bin/bash

echo "🏗️ Build de production"

# Build frontend
echo "📦 Build du frontend..."
cd web
npm run build
cd ..

# Copier les fichiers de build si nécessaire
echo "📁 Organisation des fichiers de build..."
mkdir -p dist
cp -r web/dist/* dist/

echo "✅ Build terminé!"
echo "Les fichiers sont dans le dossier dist/"