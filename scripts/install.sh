#!/bin/bash

echo "🚀 Installation du projet Hackathon MVP"

# Installation backend
echo "📦 Installation des dépendances backend..."
cd backend
pip install -r requirements.txt
cd ..

# Installation frontend
echo "📦 Installation des dépendances frontend..."
cd web
npm install
cd ..

echo "✅ Installation terminée!"
echo "Lancez ./scripts/dev.sh pour démarrer le projet"