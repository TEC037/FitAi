# FitAI — Análisis de Arquitectura

## Grafo de dependencias (capas)

```mermaid
graph TD
  subgraph Entry["Entrada"]
    main["main.tsx"] --> App["App.tsx (router por currentScreen)"]
  end

  subgraph UI["UI (42 componentes)"]
    direction LR
    Views["11 vistas lazy-loaded"]
    Nav["SidebarNav · MobileNav"]
    Shared["ErrorBoundary · SafetyModal · PageLoader"]
  end

  subgraph State["Estado"]
    CTX["AppContext (AppProvider + useApp)"]
    Hooks["usePersistedState · useModalAccessibility · useDebouncedValue · useTelemetrySimulation"]
  end

  subgraph Core["Lógica de dominio"]
    AI["ai/coachEngine.ts"]
    Allo["services/allometricService.ts"]
    ExDB["services/exerciseDatabaseService.ts"]
    Net["lib/serverlessCoach.ts"]
  end

  subgraph Data["Datos"]
    Mock["data/mock*.ts (usuario, rutinas, progreso, coach)"]
    DB["data/exercisesDatabase.json (1,324 ejercicios · 1.7 MB)"]
  end

  subgraph Serverless["functions/ (opcional)"]
    API["api/coach · api/allometric · api/health"]
    LLM["lib/llm.ts"]
  end

  App --> UI
  UI --> CTX
  CTX --> Core
  CTX --> Mock
  Core --> Data
  ExDB --> DB
  Net -.->|VITE_SERVERLESS_URL| API
  API --> AI
  API --> LLM
```

## Resumen

- **Arquitectura**: SPA sin router real; navegación por `currentScreen` en contexto global. Flujo: Landing/Auth → Onboarding → Layout (Sidebar + vistas lazy).
- **Estado central** (`AppContext.tsx` · 668 ln): God object con 7 responsabilidades (auth, nav, workout, chat, rutinas, historial, persistencia). Candidato principal a descomposición.
- **Capa científica** (`allometricService.ts` · 413 ln): motor alométrico (Kleiber M^3/4, cardíaca M^-1/4, fuerza M^2/3). Diferenciador de la app.
- **Dataset** (`exercisesDatabase.json` · 1.7 MB): 78% del build dist. Importado eagerly por `DashboardView`. Candidato a externalización CDN.
- **Serverless** (`functions/`): opcional, 0 consumo sin configurar. Coach con fallback local → serverless → LLM.