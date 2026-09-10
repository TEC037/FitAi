# Punto Fuerte

Plataforma SPA (prototipo) de entrenamiento fitness con **Coaching IA** y **biometría alométrica** (leyes de escala biológica de Kleiber M^3/4, dinámica cardíaca M^-1/4 y fuerza isométrica M^2/3).

## Stack

- React 19 + TypeScript + Vite
- TailwindCSS v4 (plugin de Vite)
- lucide-react (iconos)
- Zustand-free: estado global con React Context (`src/context/AppContext.tsx`)
- Supabase (Auth + datos) con fallback a modo local sin red

## Pantallas

3 pantallas autenticadas (minimalistas) + landing/auth/onboarding:

- **Rutina** — entrenamiento unificado: plan del día, registro de series en vivo, temporizador de descanso y Coach IA en un solo lugar.
- **Biblioteca** — explorador de 1324 ejercicios con filtros y fichas técnicas.
- **Perfil** — datos personales + métricas de progreso (KPIs, evolución de peso y récords).

Navegación mediante **botón circular superior** (menú radial) con **pulsos dorados** que guían: sin sesión → Perfil (nombre), rutina con ejercicios → Rutina (entrenar), nombre personalizado → Biblioteca (añadir ejercicio).

## Estructura

```
src/
├── components/   # Vistas (Landing, Auth, Onboarding, Routine, Exercises, Profile) + chrome (TopBar, RoundNav, ProgressSummary)
├── context/      # AppContext (estado global + persistencia localStorage/Supabase)
├── lib/          # supabaseClient y supabaseService (mappers + persistencia)
├── services/     # allometricService y exerciseDatabaseService
├── hooks/        # useGuidanceStep, useIsMobile, ...
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

## Supabase (Auth + Datos)

Sin configurar, la app funciona en **modo local**: usuario demo (`Carlos Ramírez`), rutinas de ejemplo y persistencia en `localStorage`.

Para activar Supabase:

1. Crea un proyecto en [supabase.com](https://supabase.com) y en el editor SQL ejecuta `supabase/migrations/0001_init.sql` (perfiles, rutinas, sesiones, récords, historial de peso y chat con RLS).
2. Configura variables en `.env` (ver `.env.example`):

   ```
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

3. Con variables presentes, la app usa auth + datos de Supabase: el login/registro crean el perfil (`profiles`), el flujo demo crea el usuario demo (`demo@fitai.app`) vía `ensureDemoData`, y todo cambio se persiste con write-through hacia las tablas.
4. Demo local sin Supabase: pulsa el botón circular → **Probar la demo**.

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

### Cloudflare Pages (recomendado)

Conecta este repositorio directamente a **Cloudflare Pages** y usa estos valores:

| Ajuste | Valor |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js | `22` |

Las funciones de `functions/api/` se publican automáticamente como Pages Functions; no deben copiarse dentro de `dist`. Configura `VITE_SERVERLESS_URL=/api/coach` en las variables de producción de Pages para que el frontend use el endpoint del mismo dominio. El endpoint de salud es `/api/health` y el perfil alométrico está disponible en `POST /api/allometric`.

La URL `fitai.l3onardo9208.workers.dev` que se venía usando corresponde a un Worker estático que actualmente resuelve las rutas desconocidas con `index.html`; por eso `/api/health` devuelve HTML y `/api/coach` puede responder `405`. Para activar las funciones serverless hay que desplegar este repositorio como **Cloudflare Pages**, o configurar explícitamente un Worker con esas rutas; subir únicamente `dist/` no publica `functions/`.

El flujo GitHub Pages vía `.github/workflows/static.yml` sigue disponible para previews estáticos sin Supabase, pero GitHub Pages no ejecuta las Pages Functions.
