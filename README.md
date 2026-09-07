# FitAI Coach

Plataforma SPA (prototipo) de entrenamiento fitness con **Coaching IA** y **biometría alométrica** (leyes de escala biológica de Kleiber M^3/4, dinámica cardíaca M^-1/4 y fuerza isométrica M^2/3).

## Stack

- React 19 + TypeScript + Vite
- TailwindCSS v4 (plugin de Vite)
- lucide-react (iconos)
- Zustand-free: estado global con React Context (`src/context/AppContext.tsx`)

## Estructura

```
src/
├── components/   # Vistas (Dashboard, Routine, ActiveWorkout, CoachAI, ...)
├── context/      # AppContext (estado global + persistencia localStorage)
├── services/     # allometricService y exerciseDatabaseService
├── data/         # mockData.ts y ejercicios (1324) en JSON
└── types/        # Tipos de dominio (UserProfile, Exercise, ...)
```

## Scripts

| Comando                | Descripción                       |
| ---------------------- | --------------------------------- |
| `npm run dev`          | Servidor de desarrollo Vite       |
| `npm run build`        | Typecheck (`tsc -b`) + build Vite |
| `npm run preview`      | Preview del build                 |
| `npm run lint`         | ESLint (flat config)              |
| `npm run format`       | Prettier (autoformato de `src/`)  |
| `npm run format:check` | Verifica formato sin modificar    |

## Dataset de ejercicios

Base de 1324 ejercicios del repositorio [`hasaneyldrm/exercises-dataset`](https://github.com/hasaneyldrm/exercises-dataset), servido por CDN (jsDelivr) con traducción automática a español.

## Coach IA: capa serverless (opcional)

El Coach IA responde **localmente** (motor rule-based, sin red) si no configuras nada: 0 peticiones y 0 MB consumidos. Desplegando las funciones se obtiene el flujo serverless:

```
Cliente (VITE_SERVERLESS_URL)  ──POST { q, w, days, goal, xp, n }──▶  /api/coach
       ◀────────────────────────── { answer, source } ──────────────────┘
                    │
                    ├─ COACH_LLM_API_URL + COACH_LLM_API_KEY → LLM (OpenAI-style) → source: "llm"
                    └─ sin configuración o ante fallo/timeout → motor local   → source: "engine"
```

- **Cliente**: variable `VITE_SERVERLESS_URL`. Si está vacía → nunca hay red.
- **Serverless** (`functions/`): `coach`, `allometric`, `health`. Compatibles con Cloudflare Pages Functions y Workers (mismo código).
- **LLM real (opcional)**: `COACH_LLM_API_URL` (cualquier endpoint de chat completions OpenAI-style), `COACH_LLM_API_KEY` y `COACH_LLM_MODEL` (por defecto `gpt-4o-mini`). Sin estas variables (o ante cualquier error/timeout de 6 s) el endpoint responde con el motor local, siempre bajo el mismo contrato `{ answer, source }` (`source` ∈ `llm` | `engine`). Ver `.env.example`.
- **Feedback de origen en la UI**: cada burbuja del coach muestra si la respuesta vino del LLM, del motor servidor o del motor local del dispositivo.

## Despliegue

GitHub Pages vía `.github/workflows/static.yml` (build en rama `main`). Las funciones serverless se despliegan aparte (Cloudflare Pages/Workers) y se apunta `VITE_SERVERLESS_URL` a su URL.
