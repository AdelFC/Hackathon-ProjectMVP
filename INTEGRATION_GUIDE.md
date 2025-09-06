# Guide d'Intégration Frontend-Backend

## 📊 Analyse de l'Architecture Backend

### Structure du Backend
- **Framework**: FastAPI (Python)
- **IA**: BlackBox API via LangChain
- **Agents spécialisés**:
  - `StrategyAgentV2`: Génération de stratégies mensuelles
  - `OrchestratorAgentV2`: Orchestration quotidienne des publications
  - Agents par plateforme: LinkedIn, Facebook, Twitter
- **Stockage**: Système de fichiers JSON avec gestion d'idempotence

### Endpoints Principaux

#### 🎯 Strategy (Stratégie)
- `POST /strategy/generate` - Génère une stratégie mensuelle complète
- `GET /strategy/active/{brand_name}` - Récupère la stratégie active
- `GET /strategy/posts/{brand_name}/{date}` - Posts prévus pour une date

#### 🤖 Orchestrator (Publication)
- `POST /orchestrator/daily` - Exécute la publication quotidienne
- `GET /orchestrator/status` - Statut de l'orchestrateur
- `POST /orchestrator/retry/{date}/{platform}` - Réessayer une publication

#### 📈 Analytics
- `POST /analytics/performance` - Métriques de performance
- `GET /analytics/yesterday/{brand_name}` - Analytics de la veille

## 🔗 Axes de Connexion Proposés

### 1. Service API Frontend (`/web/src/services/api.ts`)
✅ **Créé** - Service centralisé pour tous les appels API avec:
- Configuration axios avec intercepteurs
- Types TypeScript alignés sur les modèles backend
- Gestion des erreurs globale
- Endpoints pour tous les services backend

### 2. Hooks React Personnalisés (`/web/src/hooks/useApi.ts`)
✅ **Créé** - Hooks réutilisables pour:
- `useStrategyGeneration()` - Génération de stratégie
- `useOrchestration()` - Publication de contenu
- `useAnalytics()` - Récupération des métriques
- `useLandingPageAnalysis()` - Analyse de landing page
- `useActiveStrategy()` - Stratégie active
- `useOrchestratorStatus()` - Statut orchestrateur

### 3. Pages Connectées

#### StrategyConnected (`/web/src/pages/StrategyConnected.tsx`)
✅ **Créé** - Page de gestion de stratégie avec:
- Génération de stratégie basée sur le profil de marque
- Visualisation du calendrier éditorial
- Publication manuelle ou test (dry run)
- Affichage des posts par jour
- Guidelines éditoriales

#### AnalyticsConnected (`/web/src/pages/AnalyticsConnected.tsx`)
✅ **Créé** - Dashboard analytics avec:
- Métriques agrégées (impressions, engagements, clics)
- Graphiques temporels (Recharts)
- Analyse par plateforme
- Top posts par engagement
- Filtres par date et plateforme

## 🚀 Flux d'Intégration Recommandés

### Flux 1: Setup → Stratégie
```
1. User remplit BrandForm dans /setup
2. Analyse optionnelle de landing page
3. Données stockées dans projectStore (Zustand)
4. Navigation vers /app/strategy
5. Génération automatique de stratégie mensuelle
```

### Flux 2: Stratégie → Publication
```
1. Stratégie active affichée dans /app/strategy
2. User sélectionne une date
3. Visualisation des posts prévus
4. Test (dry run) ou publication réelle
5. Feedback immédiat via Toast
```

### Flux 3: Publication → Analytics
```
1. Posts publiés via orchestrateur
2. Métriques collectées automatiquement
3. Dashboard /app/analytics mis à jour
4. Graphiques et KPIs en temps réel
```

## 🔧 Configuration Requise

### Variables d'Environnement
```env
# Frontend (.env)
VITE_API_URL=http://localhost:8000
VITE_MOCK_MODE=false

# Backend (.env)
BLACKBOX_API_KEY=your_key_here
BLACKBOX_MODEL=blackboxai/openai/gpt-4o
```

### CORS Backend
Le backend est configuré pour accepter toutes les origines (`*`). 
En production, configurer spécifiquement:
```python
allow_origins=["http://localhost:3001", "https://yourdomain.com"]
```

## 📝 Prochaines Étapes

### Court Terme
1. **Intégrer AnalyzeUrlPanel** avec l'endpoint d'analyse landing page
2. **Connecter les Integrations** pour OAuth réel avec les plateformes
3. **Implémenter la persistence** des stratégies côté frontend
4. **Ajouter la gestion d'erreur** plus granulaire

### Moyen Terme
1. **WebSocket** pour les mises à jour en temps réel
2. **Queue de tâches** (Celery) pour les opérations longues
3. **Cache Redis** pour les métriques fréquemment consultées
4. **Upload d'images** pour les posts avec média

### Long Terme
1. **ML Pipeline** pour l'optimisation des horaires de publication
2. **A/B Testing** automatique des variations de contenu
3. **Prédiction de performance** basée sur l'historique
4. **API publique** pour intégrations tierces

## 🧪 Tests d'Intégration

### Test Manuel Rapide
```bash
# 1. Démarrer le backend
docker compose up backend

# 2. Démarrer le frontend en dev
cd web && npm run dev

# 3. Tester la connexion
curl http://localhost:8000/health

# 4. Créer une stratégie test
curl -X POST http://localhost:8000/test/create-sample-strategy \
  -H "Content-Type: application/json" \
  -d '{"brand_name": "TestBrand"}'
```

### Tests Automatisés Suggérés
- Tests d'intégration avec MSW pour mocker l'API
- Tests E2E avec Playwright pour les flux complets
- Tests de charge avec Locust pour l'API

## 🔒 Sécurité

### Recommandations
1. **Authentication JWT** pour sécuriser l'API
2. **Rate limiting** sur les endpoints sensibles
3. **Validation des inputs** côté frontend et backend
4. **HTTPS** obligatoire en production
5. **Secrets management** avec vault ou équivalent

## 📚 Documentation API

La documentation interactive de l'API est disponible à:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 💡 Tips de Développement

1. **Utiliser les hooks fournis** plutôt que d'appeler directement l'API
2. **Gérer le loading state** avec les Skeleton components
3. **Afficher les erreurs** via le système de Toast
4. **Persister l'état** important dans Zustand avec persist
5. **Optimiser les requêtes** avec React Query (à implémenter)