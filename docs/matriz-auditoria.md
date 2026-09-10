# Matriz de Auditoría — Punto Fuerte (antes FitAI Coach)

Auditoría realizada el **2026-09-09** recorriendo: inicio (Hoy), iniciar sesión,
registro, recuperación, perfil, Rutinas, Entrenar, Progreso y preferencias.
Revisión en código fuente (`src/`), migraciones Supabase, CI/CD y tests.

Leyenda de estado: **Implementado** · **Parcial** · **Simulado** · **Local** ·
**Mock** · **Demo** · **Ausente** · **Roto**.

---

## Matriz

| # | Área | Estado real | Evidencia (código/ejecución) | Riesgo | Prioridad | Dependencia | Cambio propuesto | Criterio de aceptación |
|---|------|-------------|------------------------------|--------|-----------|-------------|------------------|------------------------|
| A1 | Marca única | **Parcial/Inconsistente** | `index.html`= "Punto Fuerte"; `README.md`= "FitAI Coach"; `.github/workflows/static.yml`= "FitAI"; `src/config/constants.ts`, `src/ai/coachEngine.ts` comentan "FitAI Coach"; `src/utils/routineShare.ts` emite "Mi Rutina FitAI"; `functions/lib/llm.ts` usa sistem prompt "FitAI Coach" | Confusión de marca y mensajes técnicos | **1** | Ninguna | Unificar "Punto Fuerte" en producto, docs y funciones | Sin referencias visibles a "FitAI" fuera del histórico `docs/` y claves de storage heredadas |
| A2 | Demo vs producción | **Simulado como real** | `src/ui/data/store.tsx:190-265` genera sesiones/racha/tonelaje ficticios (`buildDemoSessions`, PRNG) que se presentan sin aviso; Header pilla "Demo"; `AuthScreen` botón "Explorar con cuenta demo" | El usuario cree que sus datos ficticios son reales | **P0** | A1 | Aislar demo en `/demo` etiquetado "Ejemplo"; en modo real nunca mostrar seeds | En cuenta real no aparece ningún dato "Ejemplo/demo"; demo aislada y etiquetada |
| A3 | Persona ficticia | **Demo** | `src/data/mockUser.ts` = "Carlos Ramírez", `carlos.ramirez@fitai.example`; `mockData.ts:28` default "Carlos"; `FinishWorkoutModal:63` "Excelente trabajo Carlos."; `App.test.tsx:18` | Nombres de personas falsas como datos reales | **P0** | A1 | Sustituir por perfil neutro ("Atleta Ejemplo") y actualizar tests | Ningún nombre de persona ficticio en producción; tests verdes |
| A4 | Autenticación | **Parcial** | `AuthScreen` (login/register/recovery) + `SupabaseService` (signIn/signUp/reset); gate en `App.tsx:105` exige sesión SOLO si `isSupabaseEnabled`; sin Supabase se entra directo a la app demo | Sin backend no hay control de cuenta real; rutas no protegidas en demo | **2** | A2 | Exigir sesión siempre en producción; demo aislada; proteger rutas | La app nunca muestra la app demo sin cuenta real |
| A5 | Cierre de sesión / sesión expirada | **Parcial** | `logout` en AppContext y `signOutSession`; `onAuthStateChange` sincroniza; sin página de expiración | Cierre OK pero sin estados de "sesión expirada" visibles | **3** | A4 | Añadir manejo UI de evento `SIGNED_OUT`/expirado | Cerrar sesión vuelve a AuthScreen; expiración muestra mensaje |
| A6 | Rutinas (programación) | **Parcial** | `RutinasScreen` + `custom_routines` (Supabase + localStorage); motor `app.routines` read-only | Edición de rutinas del motor no persistida; "Rutinas" no lista ejercicios por día | **3** | B4 | Modelo común rutina↔sesión (Iteración 3) | Rutinas y Entrenar comparten configuración sin divergencias |
| A7 | Entrenar (ejecución) | **Parcial/Simulado** | `EntrenarScreen` usa `ACTIVE_EXERCISES` mock o `app.activeRoutine`; cronómetro inicializa en `34*60+12`; `FinishWorkoutModal` título/volumen con defaults ficticios; resumen `volumeKg` fallback `4250` | Sesión no siempre derivada de rutina real; datos hardcodeados | **P0** | A6 | Sesión basada en rutina+versión concreta; persistencia de series (Iteración 3) | Entrenar ejecuta exactamente la rutina programada; sin literales ficticios |
| A8 | Progreso | **Parcial/Simulado** | `ProgresoScreen` combina dashboard; usa seeds demo en modo demo; botón "Nuevo PR" abre `CreateRoutineModal` (bug: `App.tsx:160` pasa `setIsCreateRoutineOpen`) | Bug de UI; métricas ficticias presentadas como reales | **P0** | A2 | Corregir/retirar botón; integrar con perfil → "Personalizar" (objetivo IA) | Sin acciones rotas; métricas sólo reales en cuenta real |
| A9 | Biblioteca de ejercicios | **Ausente en UI** | `exerciseDatabaseService.ts` (1.324 ejercicios) + `src/services/*` y JSON en `public/`; favoritos store; pero **no hay pantalla Biblioteca** en `App.tsx` | Función clave invisible para el usuario | **1** | B4 | Crear pantalla de Biblioteca como primera vista (prioridad producto) | El usuario explora, filtra y consulta ejercicios desde la primera pestaña |
| A10 | Iconos | **Parcial/Roto** | Uso extenso de `material-symbols-outlined` con nombres internos (`schedule`, `fitness_center`, `space_dashboard`, `manage_search`…). Si la fuente no carga, se muestra el nombre literal | Nombres técnicos visibles como texto | **P0** | Ninguna | Sustituir por SVG accesible (lucide-react ya es dependencia) | Sin nombres de iconos visibles; SVG con `aria-label` |
| A11 | Idioma y siglas | **Parcial** | "RPE" en Entrenar (`RPE:`), Rutinas ("Cardio / HIIT", "PPL (Push Pull Legs)"), "1RM", "PR" en récords, "PR 95kg" en ejercicios | Siglas sin explicación ni glosario | **1** | Ninguna | Sustituir por español claro + glosario (Fase 6) | Sin siglas sin explicar en la interfaz |
| A12 | Persistencia | **Parcial** | `AppContext` `usePersistedState` (localStorage `fitai_*`) + write-through Supabase; `ui/store` usa claves `puntofuerte_*` | Doble capa de persistencia; riesgo de divergencia | **3** | A6 | Consolidar fuente de verdad única por entidad | Un cambio de datos se refleja en todas las vistas sin duplicación |
| A13 | Ejercicio detalle completo | **Ausente** | `VideoModal` muestra gif; no hay anamnesis del ejercicio (músculos, equipo, pasos, errores, alternativas) | El usuario no entiende el ejercicio antes de ejecutarlo | **2** | A9, B4 | Detalle completo por ejercicio (Fase 5) | Antes de Entrenar, cada ejercicio abre ficha verificada |
| A14 | Dataset / licencia | **Parcial** | Media vía CDN jsDelivr (`hasaneyldrm/exercises-dataset`) con atribución "© Gym visual"; sin doc de licencia, versión ni fallback | Redistribución/no disponibilidad de URLs externas | **2** | Ninguna | Documentar licencia, versión, fallback y atribución (Fase 9) | Atribución verificada y estrategia de fallback documentada |
| A15 | Validación y seguridad | **Parcial** | `validation.ts` básico; inputs tipo number; RLS por usuario en SQL; auth por email; sin validación servidor para la app (sólo functions) | Entrada no normalizada; CSRF/abuso no cubiertos | **4** | A4 | Validar cliente+servidor, confirmación en acciones críticas (Fase 7) | Operaciones críticas protegidas en servidor |
| A16 | Privacidad y eliminación | **Ausente** | No hay política de privacidad ni flujo "Eliminar mi cuenta" | Incumplimiento legal/UX crítico | **3** | A4 | Política simple + borrado cascada controlado (Fase 8) | El usuario puede eliminar cuenta y datos |
| A17 | Tema claro | **Ausente** | `index.html` fija `class="dark"` y colores oscuros hardcodeados en toda la UI | Sin opción de tema claro ni persistencia | **4** | Ninguna | Tema claro persistente sin duplicar lógica de presentación (Fase 10) | Tema claro opcional y persistente |
| A18 | Accesibilidad / estados | **Parcial** | `useModalAccessibility` (focus trap/Escape); botones con `aria-label` parcial; sin estados vacío/error coherentes en todas las vistas | Teclado/lector parcialmente cubiertos | **4** | — | Estados de carga/vacío/error/reintento; foco visible (Fase 10) | Utilizable con teclado y lector de pantalla |
| A19 | "Nuevo PR" roto | **Roto** | `ProgresoScreen` llama `onOpenNewPrModal`; `App.tsx:160` abre `CreateRoutineModal`; `NewPrModal` existe pero no está conectado | Acción abre el modal equivocado | **P0** | A8 | Corregir el cableado o retirar la acción hasta tener persistencia | La acción "Nuevo PR" nunca abre el modal de rutinas |
| A20 | CI/CD | **Implementado** | `.github/workflows/static.yml`: lint → test → build → deploy GitHub Pages; Cloudflare Pages para producción con functions | Nombre de workflow "FitAI" + despliegue de secrets de Supabase en cliente | **3** | A1 | Renombrar workflow; documentar despliegue y rollback | Pipeline verde con marca Punto Fuerte |
| A21 | Iconos/figuras | **Parcial** | imgs externas de Google (aida-public) para banner/avatar; sin control de disponibilidad o datos alternativos | Dependencias externas no auditadas | **4** | A14 | Eliminar o auditar URLs externas de imágenes | Imágenes sin dependencias no auditadas |

---

## Prioridad de producto (del encargo)

1. **Biblioteca** como primera vista (reemplaza el dashboard "Hoy").
2. **Rutinas** sincronizadas con Biblioteca.
3. **Personalizar** = progreso + perfil + Coach IA en una sola página.

## Próximo ciclo (Iteración 1)

- A1 marca única, A3 persona ficticia, A11 siglas, A8/A19 acción "Nuevo PR",
  A2/A4/A10 inicio de aislamiento de demo.