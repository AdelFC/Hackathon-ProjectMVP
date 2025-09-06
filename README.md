# Social Media Strategy Assistant - MVP 24h

## Vision Produit

Plateforme SaaS permettant aux PME de générer et gérer leur stratégie de contenu social media de manière intelligente et automatisée.

### Parcours Utilisateur
1. **Landing** → Introduction produit avec marquee animée
2. **Setup** → Configuration du profil, analyse du site, connexions OAuth (mock)
3. **App** → 
   - Stratégie & Posts : génération, édition, calendrier éditorial
   - Analytics : KPIs, timeline, insights (mock)

## Structure du Projet

```
.
├── backend/          # API FastAPI + outils AI
├── web/             # Frontend React + TypeScript
├── scripts/         # Scripts de build et déploiement
└── docker-compose.yml
```

## Scripts Disponibles

```bash
# Installation
./scripts/install.sh

# Développement
./scripts/dev.sh       # Lance frontend + backend + mocks

# Build
./scripts/build.sh     # Build production

# Tests
./scripts/test.sh      # Lance les tests
```

## Stack Technique

### Frontend (web/)
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Routing**: React Router
- **DnD**: @dnd-kit
- **HTTP**: Axios
- **Mocks**: MSW

### Backend (backend/)
- **Framework**: FastAPI
- **AI**: BLACKBOX API
- **Validation**: Pydantic

## Conventions de Code

### Git
- Commits atomiques avec prefixes : `feat:`, `fix:`, `chore:`, `docs:`
- Branches : `feature/*`, `fix/*`, `chore/*`

### Frontend
- Components en PascalCase
- Hooks custom avec prefix `use`
- Types dans `types/`
- Stores Zustand dans `stores/`

### Structure des Composants
```tsx
// Component.tsx
export function Component() {
  // hooks
  // state
  // handlers
  // render
}
```

## Endpoints API (Mocks)

- `POST /api/context/primary` → Analyse de marque
- `POST /api/strategy/generate` → Génération stratégie
- `POST /api/posts/generate` → Génération posts
- `GET /api/analytics/summary` → KPIs et métriques
- `GET /api/insights` → Insights et recommandations

## Variables d'Environnement

```env
# Frontend
VITE_API_URL=http://localhost:8000
VITE_MOCK_MODE=true

# Backend
BLACKBOX_API_KEY=your_key
```

## Démarrage Rapide

```bash
# Clone et installation
git clone [repo]
cd hackathon-mvp
./scripts/install.sh

# Lancer en dev
./scripts/dev.sh

# Accès
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
```

## Licence

MIT