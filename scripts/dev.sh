#!/bin/bash

echo "🚀 Lancement en mode développement"

# Fonction pour tuer les processus à la sortie
cleanup() {
    echo "🛑 Arrêt des services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup EXIT INT TERM

# Lancer le backend
echo "🔧 Démarrage du backend..."
cd backend
python main.py &
BACKEND_PID=$!
cd ..

# Attendre que le backend soit prêt
sleep 2

# Lancer le frontend
echo "⚛️ Démarrage du frontend..."
cd web
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Services démarrés!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8000"
echo "Appuyez sur Ctrl+C pour arrêter"

# Attendre
wait