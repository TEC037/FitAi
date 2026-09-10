# A continuación hay un prompt a ser seguido, dice en algún punto que buscamos no depender de un dataset, sin embargo Dataset hasaneyldrm/exercises-dataset es prefecto en la medida que usa GIFs para presentar los ejercicios (bajo consumo de datos del usuario) si la licencia lo permite lo debemos usar y tener fallback. La solución busca ser muy ligero para el usuario final, también es importante respetar mejor la vista de los ejercicios para evitar cortar en lo absoluto el gif con el ejercicio; también es crucial que la solución sea minimalista sin sobrecarga cognitiva



# Actúa como un equipo senior de producto, UX, ingeniería full-stack, ciencia del entrenamiento, seguridad y QA. Debes analizar y llevar al siguiente nivel mi aplicación FitAI Coach, disponible en https://fitai.l3onardo9208.workers.dev/.

# No te limites a modificar visualmente la interfaz. Inspecciona primero el repositorio, la arquitectura, el bundle actual, las rutas, el modelo de datos, la autenticación, la persistencia, los componentes, el estado global, las integraciones y las limitaciones reales del proyecto. Comprueba qué funcionalidades funcionan de verdad y cuáles son únicamente prototipos, datos demo, mocks o valores almacenados localmente. No inventes servicios, APIs ni capacidades que no existan. Si falta una integración externa, diseña una interfaz desacoplada y una implementación simulada claramente identificada, pero deja la arquitectura preparada para conectarla posteriormente.

# Contexto observado de la solución actual

# FitAI Coach se presenta como una plataforma de entrenamiento inteligente con IA para gimnasios, entrenadores y clientes. La experiencia pública actual incluye:

# 

# &#x20;   Landing page con propuesta de rutinas hiperpersonalizadas.

# &#x20;   Botón de inicio de sesión.

# &#x20;   Onboarding o creación de rutina con IA, aunque debes verificar su implementación real.

# &#x20;   Prototipo demo con el usuario “Carlos Ramírez”.

# &#x20;   Rutina dividida en cinco días:

# &#x20;       Pecho y tríceps.

# &#x20;       Espalda y bíceps.

# &#x20;       Recuperación y flexibilidad.

# &#x20;       Piernas y glúteos.

# &#x20;       Hombros y abdomen.

# &#x20;   Rutinas con ejercicios, series, repeticiones, carga, descanso y grupo muscular.

# &#x20;   Modo de entrenamiento activo.

# &#x20;   Registro de peso, repeticiones y RPE.

# &#x20;   Registro de series completadas.

# &#x20;   Temporizador de descanso con reinicio y ajustes de menos o más 15 segundos.

# &#x20;   Navegación anterior y siguiente entre ejercicios.

# &#x20;   Consejos técnicos básicos por ejercicio.

# &#x20;   Perfil con nombre, correo, edad, estatura, peso, sistema métrico/imperial, objetivo, experiencia, días disponibles, duración de sesión y restricciones físicas.

# &#x20;   Preferencias para recordatorios, consejos del Coach IA y sonido al terminar el descanso.

# &#x20;   Historial reciente de entrenamientos.

# &#x20;   Métricas de constancia, volumen total, horas entrenadas, sesiones y volumen semanal.

# &#x20;   Sección de récords personales.

# &#x20;   Biblioteca de aproximadamente 1.324 ejercicios.

# &#x20;   Filtros por grupo muscular, equipamiento y músculo objetivo.

# &#x20;   Búsqueda de ejercicios.

# &#x20;   Favoritos.

# &#x20;   Ordenamiento de resultados.

# &#x20;   Detalles y técnica de ejercicios.

# &#x20;   Opción para añadir ejercicios a una rutina.

# &#x20;   Enlaces a una base de datos externa de ejercicios.

# &#x20;   Menú de rutina, biblioteca y perfil.

# &#x20;   Aviso médico que indica que la aplicación no sustituye a profesionales de la salud.

# 

# Usa estas observaciones únicamente como punto de partida. Verifica cada una en el código y en la ejecución real.

# Objetivo principal

# Transforma FitAI Coach en una plataforma de nivel profesional para gimnasios, entrenadores personales, estudios, coaches online y clientes finales. Debe competir funcionalmente con plataformas como ABC Trainerize, TrueCoach, My PT Hub, FitSW, Exercise.com, Virtuagym, TrainHeroic, Wodify, Hexfit y Gymdesk.

# La prioridad no es copiar productos existentes. La prioridad es construir una experiencia más coherente y diferenciada alrededor de este flujo:

# Perfil del atleta → evaluación inicial → generación de plan → programación periodizada → entrenamiento en vivo → registro de datos → adaptación segura → seguimiento del progreso → comunicación con el coach → retención y mejora continua.

# Fase 1: Auditoría técnica y funcional obligatoria

# Antes de implementar cambios:

# 

# &#x20;   Ejecuta la aplicación y recorre todos los flujos disponibles.

# &#x20;   Inspecciona las rutas, componentes, hooks, servicios, estado, almacenamiento y llamadas de red.

# &#x20;   Determina si los datos son persistentes, locales, mockeados o conectados a una base de datos.

# &#x20;   Verifica si el login, registro, logout y recuperación de contraseña funcionan realmente.

# &#x20;   Verifica si existen roles distintos para atleta, entrenador, administrador de gimnasio y superadministrador.

# &#x20;   Comprueba si los botones principales realizan acciones reales o solamente cambian la vista.

# &#x20;   Identifica errores de consola, errores de red, estados inconsistentes, problemas de navegación y problemas de responsive design.

# &#x20;   Comprueba la aplicación en móvil, tablet y escritorio.

# &#x20;   Verifica accesibilidad con teclado, foco visible, etiquetas, contraste, lectores de pantalla y tamaños táctiles.

# &#x20;   Identifica datos demo que estén mezclados con datos de usuario real.

# &#x20;   Comprueba si la aplicación puede manejar varios clientes, varios entrenadores, varios gimnasios y múltiples sedes.

# &#x20;   Revisa si el modelo de datos permite historial, auditoría, permisos, eliminación, exportación y recuperación.

# &#x20;   Documenta las funcionalidades existentes, incompletas, simuladas y ausentes.

# &#x20;   Crea una matriz de brechas con estas columnas:

# &#x20;       Área.

# &#x20;       Estado actual.

# &#x20;       Evidencia encontrada.

# &#x20;       Impacto para el negocio.

# &#x20;       Prioridad.

# &#x20;       Dependencias.

# &#x20;       Criterio de aceptación.

# 

# No des por implementada ninguna funcionalidad únicamente porque aparezca en el texto de la landing page.

# Fase 2: Arquitectura de producto necesaria

# Diseña una arquitectura preparada para:

# 

# &#x20;   Atletas individuales.

# &#x20;   Entrenadores personales.

# &#x20;   Gimnasios y estudios.

# &#x20;   Equipos de entrenadores.

# &#x20;   Administradores de gimnasio.

# &#x20;   Franquicias y multi-sede.

# &#x20;   Clientes presenciales, remotos e híbridos.

# 

# Implementa o prepara correctamente:

# 

# &#x20;   Autenticación segura.

# &#x20;   Registro de usuarios.

# &#x20;   Recuperación de contraseña.

# &#x20;   Verificación de correo.

# &#x20;   Roles y permisos.

# &#x20;   Multi-tenancy por gimnasio.

# &#x20;   Invitación de clientes por parte de entrenadores.

# &#x20;   Relación entrenador-atleta.

# &#x20;   Equipos y grupos.

# &#x20;   Gestión de sedes.

# &#x20;   Separación estricta entre datos demo y datos reales.

# &#x20;   Persistencia real.

# &#x20;   Migraciones y esquema de base de datos.

# &#x20;   Validación de datos en frontend y backend.

# &#x20;   Auditoría de cambios.

# &#x20;   Exportación de datos.

# &#x20;   Eliminación de cuenta y datos.

# &#x20;   Manejo de errores y estados de carga.

# &#x20;   Diseño responsive y accesible.

# &#x20;   Arquitectura modular para integrar IA, pagos, wearables y notificaciones sin acoplar todo el sistema.

# 

# Si el proyecto actual utiliza Supabase, Firebase u otra infraestructura, úsala de forma coherente en lugar de crear una segunda capa innecesaria. Si la persistencia actual es localStorage, migra los datos importantes a persistencia segura y deja localStorage únicamente para preferencias no sensibles o caché.

# Fase 3: Funcionalidades comunes que deben quedar completas

# 1\. Perfil y evaluación del atleta

# Amplía el perfil actual para incluir:

# 

# &#x20;   Nombre, foto y datos de contacto.

# &#x20;   Edad, sexo opcional, estatura, peso y unidades.

# &#x20;   Objetivo principal y objetivos secundarios.

# &#x20;   Nivel de experiencia por disciplina.

# &#x20;   Historial de entrenamiento.

# &#x20;   Días y horarios disponibles.

# &#x20;   Duración máxima por sesión.

# &#x20;   Equipamiento disponible.

# &#x20;   Ubicación o gimnasio habitual.

# &#x20;   Preferencias de ejercicios.

# &#x20;   Ejercicios que no desea realizar.

# &#x20;   Lesiones, molestias y limitaciones declaradas.

# &#x20;   Nivel de dolor y zona afectada.

# &#x20;   Calidad del sueño.

# &#x20;   Estrés percibido.

# &#x20;   Energía diaria.

# &#x20;   Historial de lesiones.

# &#x20;   Cuestionario de preparación física.

# &#x20;   Consentimiento informado.

# &#x20;   Fecha de última evaluación.

# &#x20;   Medidas corporales.

# &#x20;   Fotos de progreso opcionales.

# &#x20;   Objetivos cuantificables.

# &#x20;   Fecha objetivo.

# &#x20;   Disponibilidad semanal real.

# &#x20;   Preferencia por entrenamiento presencial, remoto o híbrido.

# 

# Incluye validaciones, rangos razonables y advertencias claras. El sistema nunca debe diagnosticar lesiones ni presentar una recomendación de IA como autorización médica.

# 2\. Generador de rutinas

# Convierte el generador actual en un sistema que permita:

# 

# &#x20;   Crear rutinas desde cero.

# &#x20;   Crear rutinas mediante IA.

# &#x20;   Usar plantillas.

# &#x20;   Duplicar rutinas.

# &#x20;   Crear microciclos, mesociclos y macrociclos.

# &#x20;   Definir fases de adaptación, hipertrofia, fuerza, potencia, resistencia, descarga y recuperación.

# &#x20;   Programar por fechas.

# &#x20;   Programar por días de la semana.

# &#x20;   Definir duración de un bloque.

# &#x20;   Definir volumen, intensidad, frecuencia y densidad.

# &#x20;   Definir series, repeticiones, carga, RPE, RIR, tempo y descansos.

# &#x20;   Usar superseries, biseries, triseries, circuitos, AMRAP, EMOM, intervalos, calentamientos y cooldowns.

# &#x20;   Configurar series de aproximación.

# &#x20;   Definir ejercicios obligatorios y opcionales.

# &#x20;   Definir alternativas por equipamiento.

# &#x20;   Ajustar unilateral/bilateral.

# &#x20;   Ajustar por nivel de experiencia.

# &#x20;   Añadir notas del entrenador.

# &#x20;   Añadir instrucciones de técnica.

# &#x20;   Reordenar ejercicios mediante drag-and-drop.

# &#x20;   Asignar una rutina a uno o varios clientes.

# &#x20;   Asignar una rutina a grupos.

# &#x20;   Programar la rutina para una fecha concreta.

# &#x20;   Crear versiones de una rutina.

# &#x20;   Comparar versiones.

# &#x20;   Guardar historial de cambios.

# &#x20;   Permitir que el entrenador bloquee partes de la rutina y que la IA solo modifique lo autorizado.

# 

# La IA debe generar una explicación breve y legible de sus decisiones: objetivo, volumen, intensidad, selección de ejercicios, restricciones respetadas y supuestos usados.

# 3\. Adaptación inteligente

# Implementa un motor de adaptación que considere:

# 

# &#x20;   Rendimiento real frente al objetivo.

# &#x20;   RPE y RIR.

# &#x20;   Repeticiones completadas.

# &#x20;   Carga utilizada.

# &#x20;   Velocidad de progreso.

# &#x20;   Fatiga acumulada.

# &#x20;   Dolor reportado.

# &#x20;   Sueño y estrés.

# &#x20;   Cumplimiento.

# &#x20;   Tiempo disponible.

# &#x20;   Equipamiento disponible ese día.

# &#x20;   Historial del ejercicio.

# &#x20;   Variación de técnica.

# &#x20;   Días omitidos.

# &#x20;   Estado de recuperación.

# &#x20;   Diferencia entre fatiga local y fatiga general.

# 

# La adaptación debe poder:

# 

# &#x20;   Subir o bajar carga.

# &#x20;   Cambiar repeticiones.

# &#x20;   Cambiar series.

# &#x20;   Aumentar o reducir descansos.

# &#x20;   Sustituir un ejercicio.

# &#x20;   Reducir volumen.

# &#x20;   Proponer una sesión de recuperación.

# &#x20;   Reprogramar una sesión perdida.

# &#x20;   Activar una semana de descarga.

# &#x20;   Detectar estancamiento.

# &#x20;   Detectar sobrecarga potencial.

# &#x20;   Pedir confirmación cuando la modificación sea relevante.

# &#x20;   Explicar por qué se propone el cambio.

# &#x20;   Permitir aceptar, rechazar o editar la recomendación.

# &#x20;   Registrar quién realizó el cambio: atleta, entrenador o IA.

# 

# No permitas que una recomendación automática ignore dolor, mareos, síntomas de alarma o restricciones declaradas. Si existe dolor agudo, síntomas neurológicos, pérdida de fuerza inusual u otros signos de riesgo, detén la recomendación y deriva a un profesional.

# 4\. Entrenamiento en vivo

# Mejora el modo actual para incluir:

# 

# &#x20;   Vista clara del ejercicio actual.

# &#x20;   Progreso de la sesión.

# &#x20;   Progreso de series.

# &#x20;   Historial de la última sesión.

# &#x20;   Mejor marca anterior.

# &#x20;   Carga sugerida.

# &#x20;   Rango objetivo.

# &#x20;   RPE o RIR objetivo.

# &#x20;   Tempo.

# &#x20;   Vídeo o animación.

# &#x20;   Instrucciones técnicas.

# &#x20;   Errores técnicos frecuentes.

# &#x20;   Sustituciones rápidas.

# &#x20;   Registro de dolor o incomodidad.

# &#x20;   Registro de esfuerzo.

# &#x20;   Registro de notas.

# &#x20;   Pausa y reanudación.

# &#x20;   Recuperación de sesión interrumpida.

# &#x20;   Modo offline con sincronización posterior.

# &#x20;   Cronómetro de descanso configurable.

# &#x20;   Sonidos y vibración opcionales.

# &#x20;   Avance automático opcional.

# &#x20;   Series de calentamiento.

# &#x20;   Series efectivas.

# &#x20;   Series fallidas.

# &#x20;   Repeticiones forzadas o asistidas.

# &#x20;   Registro de spotter o asistencia.

# &#x20;   Finalización parcial.

# &#x20;   Cancelación con motivo.

# &#x20;   Resumen final.

# &#x20;   Recomendación para la próxima sesión.

# &#x20;   Compartir resumen con el entrenador.

# 

# La sesión debe guardarse automáticamente para evitar pérdida de datos.

# 5\. Biblioteca de ejercicios

# Conserva la biblioteca actual, pero mejora:

# 

# &#x20;   Traducción y normalización de nombres.

# &#x20;   Búsqueda por nombre, músculo, patrón de movimiento, equipamiento y dificultad.

# &#x20;   Filtros por objetivo.

# &#x20;   Filtros por limitación corporal.

# &#x20;   Filtros por unilateral/bilateral.

# &#x20;   Filtros por cadena cinética.

# &#x20;   Filtros por rango de movimiento.

# &#x20;   Favoritos.

# &#x20;   Ejercicios usados recientemente.

# &#x20;   Ejercicios recomendados.

# &#x20;   Ejercicios propios del entrenador.

# &#x20;   Vídeos propios.

# &#x20;   Instrucciones en varios idiomas.

# &#x20;   Variantes y progresiones.

# &#x20;   Regresiones.

# &#x20;   Sustituciones equivalentes.

# &#x20;   Músculos primarios y secundarios.

# &#x20;   Nivel técnico.

# &#x20;   Contraindicaciones o precauciones.

# &#x20;   Etiqueta de validación del contenido.

# &#x20;   Reporte de contenido incorrecto.

# &#x20;   Creación de ejercicios personalizados.

# &#x20;   Versionado de ejercicios.

# &#x20;   Diferenciación entre ejercicio, variante y movimiento.

# &#x20;   Soporte para vídeos, GIFs e imágenes optimizadas.

# 

# Evita depender exclusivamente de un dataset externo sin control de calidad, licencia, metadatos normalizados ni revisión del contenido.

# 6\. Seguimiento y progreso

# Amplía las métricas para incluir:

# 

# &#x20;   Volumen total.

# &#x20;   Volumen por grupo muscular.

# &#x20;   Intensidad relativa.

# &#x20;   Tonelaje.

# &#x20;   Repeticiones efectivas.

# &#x20;   Series por músculo.

# &#x20;   Frecuencia.

# &#x20;   Adherencia.

# &#x20;   Asistencia.

# &#x20;   Tiempo bajo tensión.

# &#x20;   RPE promedio.

# &#x20;   RIR promedio.

# &#x20;   Peso corporal.

# &#x20;   Medidas.

# &#x20;   Fotos de progreso.

# &#x20;   Récords personales.

# &#x20;   Estimación de 1RM.

# &#x20;   Tendencias.

# &#x20;   Comparación entre ciclos.

# &#x20;   Rendimiento por ejercicio.

# &#x20;   Carga interna.

# &#x20;   Carga externa.

# &#x20;   Fatiga percibida.

# &#x20;   Sueño.

# &#x20;   Estrés.

# &#x20;   Energía.

# &#x20;   Dolor.

# &#x20;   Consistencia semanal y mensual.

# 

# Crea dashboards diferenciados para atleta y entrenador. El atleta debe ver información clara y motivadora. El entrenador debe ver alertas, adherencia, estancamientos, riesgos, clientes inactivos y evolución de cada persona.

# Incluye exportación CSV/PDF y reportes compartibles.

# 7\. Nutrición y hábitos

# Añade un módulo opcional, claramente separado de la atención clínica, con:

# 

# &#x20;   Registro de comidas.

# &#x20;   Registro de calorías y macronutrientes.

# &#x20;   Objetivos de proteína, carbohidratos y grasas.

# &#x20;   Agua.

# &#x20;   Sueño.

# &#x20;   Pasos.

# &#x20;   Hábitos personalizados.

# &#x20;   Check-ins periódicos.

# &#x20;   Fotos de comidas opcionales.

# &#x20;   Registro mediante código de barras si existe integración.

# &#x20;   Plantillas de comidas.

# &#x20;   Recetas.

# &#x20;   Lista de compras.

# &#x20;   Preferencias alimentarias.

# &#x20;   Alergias declaradas.

# &#x20;   Dietas vegetarianas, veganas u otras preferencias.

# &#x20;   Seguimiento de cumplimiento.

# &#x20;   Comentarios del entrenador.

# &#x20;   Avisos de que no sustituye asesoramiento médico o dietético.

# 

# La IA puede sugerir estructuras, pero no debe hacer diagnóstico, prescribir tratamientos ni presentarse como nutricionista clínico.

# 8\. Comunicación y adherencia

# Añade:

# 

# &#x20;   Mensajería uno a uno.

# &#x20;   Mensajería grupal.

# &#x20;   Comentarios dentro de cada entrenamiento.

# &#x20;   Notas privadas del entrenador.

# &#x20;   Mensajes programados.

# &#x20;   Recordatorios.

# &#x20;   Check-ins automáticos.

# &#x20;   Reacciones.

# &#x20;   Celebración de logros.

# &#x20;   Grupos y comunidades.

# &#x20;   Retos.

# &#x20;   Rachas.

# &#x20;   Insignias.

# &#x20;   Rankings opcionales.

# &#x20;   Notificaciones in-app.

# &#x20;   Email.

# &#x20;   Push notifications.

# &#x20;   Integración futura con SMS.

# &#x20;   Videollamadas o integración con videoconferencia.

# &#x20;   Centro de notificaciones.

# &#x20;   Preferencias de privacidad.

# &#x20;   Silenciar conversaciones.

# &#x20;   Reportar contenido.

# &#x20;   Moderación básica.

# 

# La gamificación debe ser opcional y nunca debe avergonzar a un usuario por faltar a una sesión o no cumplir un objetivo.

# 9\. Portal del entrenador

# Crea un panel profesional con:

# 

# &#x20;   Lista de clientes.

# &#x20;   Búsqueda y filtros.

# &#x20;   Estado de cada cliente.

# &#x20;   Próxima sesión.

# &#x20;   Último entrenamiento.

# &#x20;   Adherencia.

# &#x20;   Riesgo de abandono.

# &#x20;   Dolor reportado.

# &#x20;   Fatiga elevada.

# &#x20;   Mensajes pendientes.

# &#x20;   Rutinas pendientes de revisión.

# &#x20;   Check-ins pendientes.

# &#x20;   Clientes inactivos.

# &#x20;   Creación y edición masiva.

# &#x20;   Plantillas.

# &#x20;   Programas reutilizables.

# &#x20;   Asignación individual o grupal.

# &#x20;   Comentarios privados.

# &#x20;   Historial del cliente.

# &#x20;   Comparación entre ciclos.

# &#x20;   Exportación de información.

# &#x20;   Gestión de asistentes y permisos.

# &#x20;   Registro de actividad del equipo.

# 

# 10\. Portal del gimnasio y multi-sede

# Añade una capa B2B para:

# 

# &#x20;   Crear gimnasios.

# &#x20;   Crear sedes.

# &#x20;   Invitar entrenadores.

# &#x20;   Crear departamentos o equipos.

# &#x20;   Crear grupos de clientes.

# &#x20;   Definir roles y permisos.

# &#x20;   Gestionar membresías.

# &#x20;   Gestionar paquetes y sesiones.

# &#x20;   Gestionar asistencia.

# &#x20;   Gestionar reservas.

# &#x20;   Gestionar clases.

# &#x20;   Gestionar listas de espera.

# &#x20;   Gestionar capacidad.

# &#x20;   Gestionar prospectos.

# &#x20;   Gestionar referidos.

# &#x20;   Gestionar promociones.

# &#x20;   Gestionar pagos.

# &#x20;   Gestionar reportes.

# &#x20;   Gestionar branding.

# &#x20;   Configurar una app con marca propia en el futuro.

# &#x20;   Ver métricas de negocio.

# &#x20;   Controlar acceso por sede.

# &#x20;   Consultar retención y churn.

# &#x20;   Configurar políticas de privacidad.

# &#x20;   Ver auditoría de actividad.

# 

# No mezcles el producto de gestión del gimnasio con el modo atleta. Deben ser experiencias distintas, aunque compartan datos y componentes.

# 11\. Pagos y monetización

# Prepara una arquitectura para:

# 

# &#x20;   Membresías.

# &#x20;   Suscripciones.

# &#x20;   Paquetes de entrenamiento.

# &#x20;   Sesiones individuales.

# &#x20;   Programas digitales.

# &#x20;   Cupones.

# &#x20;   Pruebas gratuitas.

# &#x20;   Renovaciones.

# &#x20;   Facturas.

# &#x20;   Recibos.

# &#x20;   Pagos fallidos.

# &#x20;   Reintentos.

# &#x20;   Reembolsos.

# &#x20;   Impuestos.

# &#x20;   Divisas.

# &#x20;   Comisiones.

# &#x20;   Webhooks.

# &#x20;   Historial de transacciones.

# &#x20;   Permisos financieros.

# &#x20;   Integración futura con Stripe u otro procesador.

# 

# No almacenes información sensible de tarjetas directamente. Si no hay un proveedor real conectado, crea una capa mock documentada y deja el código preparado para una integración segura.

# 12\. Integraciones

# Diseña adaptadores desacoplados para:

# 

# &#x20;   Apple Health.

# &#x20;   Google Health Connect.

# &#x20;   Garmin.

# &#x20;   Fitbit.

# &#x20;   WHOOP.

# &#x20;   Oura.

# &#x20;   Withings.

# &#x20;   MyFitnessPal.

# &#x20;   Google Calendar.

# &#x20;   Apple Calendar.

# &#x20;   Outlook.

# &#x20;   Stripe.

# &#x20;   Zapier.

# &#x20;   Webhooks.

# &#x20;   Google Analytics o analítica propia.

# &#x20;   Herramientas de email.

# &#x20;   Videoconferencia.

# &#x20;   Control de acceso del gimnasio.

# 

# No afirmes que una integración existe hasta verificarla. Muestra claramente si está conectada, pendiente, simulada o desactivada.

# Fase 4: Innovaciones prioritarias

# Implementa primero las innovaciones con mayor valor diferencial y menor riesgo:

# A. Coach IA transparente

# El Coach IA debe:

# 

# &#x20;   Responder preguntas sobre técnica, descanso, sustituciones y programación.

# &#x20;   Explicar sus recomendaciones.

# &#x20;   Mostrar las fuentes o reglas utilizadas cuando sea posible.

# &#x20;   Diferenciar hechos, estimaciones y sugerencias.

# &#x20;   Pedir aclaraciones cuando faltan datos.

# &#x20;   No inventar información.

# &#x20;   No diagnosticar.

# &#x20;   No prometer resultados.

# &#x20;   No modificar una rutina crítica sin consentimiento.

# &#x20;   Recordar el contexto del atleta.

# &#x20;   Respetar restricciones y preferencias.

# &#x20;   Permitir escalar la conversación al entrenador humano.

# &#x20;   Guardar un historial de recomendaciones.

# &#x20;   Permitir marcar una respuesta como incorrecta.

# &#x20;   Mostrar una advertencia cuando el riesgo sea médico o alto.

# 

# B. Constructor de rutinas asistido por IA

# Permite describir:

# 

# &#x20;   Objetivo.

# &#x20;   Nivel.

# &#x20;   Días.

# &#x20;   Duración.

# &#x20;   Equipamiento.

# &#x20;   Preferencias.

# &#x20;   Limitaciones.

# &#x20;   Ejercicios excluidos.

# &#x20;   Fase de entrenamiento.

# &#x20;   Intensidad.

# &#x20;   Prioridades musculares.

# 

# La IA debe producir una propuesta editable con:

# 

# &#x20;   Días.

# &#x20;   Ejercicios.

# &#x20;   Series.

# &#x20;   Repeticiones.

# &#x20;   Cargas o método de estimación.

# &#x20;   Descansos.

# &#x20;   Tempo.

# &#x20;   Calentamiento.

# &#x20;   Cooldown.

# &#x20;   Justificación.

# &#x20;   Alertas de seguridad.

# &#x20;   Alternativas.

# &#x20;   Supuestos utilizados.

# 

# C. Planificación adaptativa

# Crea un sistema que detecte:

# 

# &#x20;   Estancamiento.

# &#x20;   Bajo cumplimiento.

# &#x20;   Fatiga elevada.

# &#x20;   Exceso de dolor.

# &#x20;   Progresión demasiado rápida.

# &#x20;   Sesiones repetidamente omitidas.

# &#x20;   Disponibilidad reducida.

# &#x20;   Equipamiento temporalmente no disponible.

# &#x20;   Necesidad de descarga.

# &#x20;   Riesgo de abandono.

# 

# Debe generar recomendaciones editables y no cambios silenciosos.

# D. Retención inteligente

# Implementa un sistema de señales de riesgo basado en:

# 

# &#x20;   Menor frecuencia de asistencia.

# &#x20;   Menos entrenamientos completados.

# &#x20;   Menor interacción.

# &#x20;   Pagos pendientes.

# &#x20;   Peor estado de ánimo.

# &#x20;   Dolor recurrente.

# &#x20;   Falta de progreso.

# &#x20;   Mensajes sin respuesta.

# 

# Muestra las señales al entrenador con acciones recomendadas como:

# 

# &#x20;   Enviar mensaje.

# &#x20;   Ajustar la rutina.

# &#x20;   Programar revisión.

# &#x20;   Ofrecer una sesión de recuperación.

# &#x20;   Revisar objetivo.

# &#x20;   Contactar al cliente.

# 

# No etiquetes a una persona de forma definitiva como “en riesgo”; utiliza lenguaje probabilístico y explicable.

# E. Marketplace o biblioteca de programas

# Prepara una arquitectura futura para:

# 

# &#x20;   Programas creados por entrenadores.

# &#x20;   Plantillas públicas o privadas.

# &#x20;   Versiones gratuitas y de pago.

# &#x20;   Categorías.

# &#x20;   Valoraciones.

# &#x20;   Reseñas.

# &#x20;   Licencias.

# &#x20;   Duplicación controlada.

# &#x20;   Protección de contenido.

# &#x20;   Seguimiento de ventas.

# &#x20;   Programa de afiliados.

# 

# No implementes pagos de marketplace si no existe infraestructura segura, pero deja el modelo de datos y los puntos de integración preparados.

# F. Gamificación responsable

# Añade opcionalmente:

# 

# &#x20;   Rachas.

# &#x20;   Insignias.

# &#x20;   Récords.

# &#x20;   Retos.

# &#x20;   Objetivos semanales.

# &#x20;   Celebraciones.

# &#x20;   Progreso personal.

# &#x20;   Rankings privados o grupales.

# 

# Nunca conviertas el ranking en el centro del producto ni expongas datos de salud sin consentimiento.

# G. Análisis de movimiento

# Si vas a implementar IA de vídeo o análisis de técnica:

# 

# &#x20;   Comienza con una experiencia experimental claramente etiquetada.

# &#x20;   Solicita consentimiento explícito para usar cámara o vídeo.

# &#x20;   No afirmes que detecta lesiones.

# &#x20;   No afirmes precisión clínica.

# &#x20;   Permite revisión humana.

# &#x20;   Explica limitaciones.

# &#x20;   Protege vídeos y elimina datos bajo solicitud.

# &#x20;   Implementa primero análisis de señales simples y observables.

# &#x20;   No generes recomendaciones peligrosas por una detección incierta.

# 

# Fase 5: Seguridad, privacidad y cumplimiento

# Implementa como mínimo:

# 

# &#x20;   Protección de rutas.

# &#x20;   Autorización por rol y tenant.

# &#x20;   Validación server-side.

# &#x20;   Protección contra acceso cruzado entre gimnasios.

# &#x20;   Sanitización de entradas.

# &#x20;   Protección contra XSS, CSRF y abuso de endpoints.

# &#x20;   Rate limiting para IA y autenticación.

# &#x20;   Gestión segura de secretos.

# &#x20;   No exponer claves en el frontend.

# &#x20;   Logs sin datos sensibles.

# &#x20;   Consentimiento para datos de salud.

# &#x20;   Política de privacidad.

# &#x20;   Términos de uso.

# &#x20;   Avisos sobre IA.

# &#x20;   Avisos sobre nutrición.

# &#x20;   Avisos sobre ejercicio y lesiones.

# &#x20;   Eliminación y exportación de datos.

# &#x20;   Historial de cambios.

# &#x20;   Cifrado en tránsito.

# &#x20;   Cifrado de datos sensibles cuando corresponda.

# &#x20;   Retención configurable.

# &#x20;   Backups.

# &#x20;   Manejo seguro de archivos y vídeos.

# 

# Trata peso, medidas, lesiones, dolor, sueño, salud y rendimiento como datos sensibles. Diseña con privacidad desde el inicio.

# Fase 6: UX y diseño

# Conserva la identidad visual actual, pero mejora:

# 

# &#x20;   Jerarquía de información.

# &#x20;   Claridad de los estados.

# &#x20;   Feedback de acciones.

# &#x20;   Skeleton loaders.

# &#x20;   Mensajes de error.

# &#x20;   Empty states.

# &#x20;   Confirmaciones.

# &#x20;   Navegación móvil.

# &#x20;   Botones táctiles.

# &#x20;   Contraste.

# &#x20;   Tipografía.

# &#x20;   Accesibilidad.

# &#x20;   Consistencia de componentes.

# &#x20;   Reducción de desplazamiento innecesario.

# &#x20;   Uso correcto de modales.

# &#x20;   Filtros fáciles de borrar.

# &#x20;   Recuperación tras errores.

# &#x20;   Flujo de primer uso.

# &#x20;   Diferenciación entre atleta, entrenador y administrador.

# 

# Crea un dashboard inicial que muestre de forma inmediata:

# 

# &#x20;   Próximo entrenamiento.

# &#x20;   Progreso semanal.

# &#x20;   Último logro.

# &#x20;   Alertas importantes.

# &#x20;   Estado de recuperación.

# &#x20;   Mensaje del entrenador.

# &#x20;   Acción recomendada.

# 

# Fase 7: Calidad y pruebas

# Antes de considerar terminada cada funcionalidad:

# 

# &#x20;   Añade pruebas unitarias.

# &#x20;   Añade pruebas de integración.

# &#x20;   Añade pruebas end-to-end.

# &#x20;   Prueba creación de cuenta.

# &#x20;   Prueba login y logout.

# &#x20;   Prueba recuperación de contraseña.

# &#x20;   Prueba aislamiento de tenants.

# &#x20;   Prueba permisos por rol.

# &#x20;   Prueba creación y asignación de rutinas.

# &#x20;   Prueba registro de series.

# &#x20;   Prueba interrupción y recuperación de sesión.

# &#x20;   Prueba adaptación de carga.

# &#x20;   Prueba dolor y restricciones.

# &#x20;   Prueba biblioteca y filtros.

# &#x20;   Prueba notificaciones.

# &#x20;   Prueba persistencia.

# &#x20;   Prueba exportación.

# &#x20;   Prueba eliminación de cuenta.

# &#x20;   Prueba responsive.

# &#x20;   Prueba accesibilidad.

# &#x20;   Prueba errores de red.

# &#x20;   Prueba estados vacíos.

# &#x20;   Prueba datos corruptos.

# &#x20;   Prueba límites y validaciones.

# &#x20;   Prueba seguridad básica.

# &#x20;   Prueba rendimiento con muchos ejercicios, clientes y sesiones.

# 

# No marques una funcionalidad como completa si únicamente funciona con el usuario demo.

# Priorización de implementación

# Trabaja en este orden:

# Prioridad P0: fundamentos

# 

# &#x20;   Auditoría técnica.

# &#x20;   Persistencia real.

# &#x20;   Autenticación.

# &#x20;   Roles.

# &#x20;   Separación de datos demo y reales.

# &#x20;   Modelo de datos.

# &#x20;   CRUD de atletas, entrenadores, rutinas y sesiones.

# &#x20;   Registro fiable de entrenamientos.

# &#x20;   Seguridad.

# &#x20;   Responsive.

# &#x20;   Manejo de errores.

# &#x20;   Pruebas básicas.

# 

# Prioridad P1: producto competitivo

# 

# &#x20;   Portal del entrenador.

# &#x20;   Generador de rutinas editable.

# &#x20;   Programación por fases.

# &#x20;   Sustituciones de ejercicios.

# &#x20;   Progresión basada en RPE/RIR.

# &#x20;   Historial completo.

# &#x20;   Dashboards de atleta y entrenador.

# &#x20;   Comunicación.

# &#x20;   Check-ins.

# &#x20;   Notificaciones.

# &#x20;   Hábitos.

# &#x20;   Nutrición básica.

# &#x20;   Exportación.

# &#x20;   Grupos y asignación masiva.

# 

# Prioridad P2: diferenciación

# 

# &#x20;   Coach IA transparente.

# &#x20;   Constructor de rutinas con IA.

# &#x20;   Adaptación inteligente.

# &#x20;   Detección de estancamiento.

# &#x20;   Alertas de fatiga y adherencia.

# &#x20;   Retención explicable.

# &#x20;   Gamificación responsable.

# &#x20;   Integración con wearables.

# &#x20;   Integración con calendario.

# &#x20;   Branding del gimnasio.

# &#x20;   Multi-sede.

# 

# Prioridad P3: expansión

# 

# &#x20;   Pagos.

# &#x20;   Membresías.

# &#x20;   Reservas.

# &#x20;   Control de acceso.

# &#x20;   Marketplace.

# &#x20;   App white-label.

# &#x20;   Análisis de movimiento.

# &#x20;   IA de nutrición.

# &#x20;   Analítica avanzada.

# &#x20;   Integraciones comerciales.

# 

# Entregables obligatorios

# Al finalizar, entrega:

# 

# &#x20;   Aplicación funcional, no únicamente mockups.

# &#x20;   Código limpio, modular y mantenible.

# &#x20;   Modelo de datos documentado.

# &#x20;   Variables de entorno documentadas.

# &#x20;   Migraciones.

# &#x20;   Datos seed claramente separados de producción.

# &#x20;   Documentación de arquitectura.

# &#x20;   Matriz de funcionalidades completadas, parciales y pendientes.

# &#x20;   Lista de funcionalidades verificadas manualmente.

# &#x20;   Resultados de pruebas.

# &#x20;   Lista de riesgos técnicos.

# &#x20;   Lista de dependencias externas.

# &#x20;   Guía de instalación y despliegue.

# &#x20;   Explicación de cómo activar o desactivar funcionalidades experimentales.

# &#x20;   Registro de decisiones importantes.

# &#x20;   Criterios de aceptación cumplidos por cada fase.

# 

# Reglas de ejecución

# 

# &#x20;   No borres funcionalidades existentes sin reemplazarlas por una experiencia mejor.

# &#x20;   No rompas el modo demo.

# &#x20;   Conserva una ruta demo aislada para presentaciones.

# &#x20;   No uses datos falsos en producción.

# &#x20;   No escondas errores detrás de interfaces bonitas.

# &#x20;   No implementes IA como texto decorativo.

# &#x20;   No permitas que la IA cambie datos críticos sin autorización.

# &#x20;   No presentes funciones experimentales como capacidades médicas.

# &#x20;   No uses credenciales reales dentro del código.

# &#x20;   No expongas secretos.

# &#x20;   No dependas de valores hardcodeados cuando deben proceder de la base de datos.

# &#x20;   No marques integraciones como activas si no están conectadas.

# &#x20;   Si una capacidad no puede implementarse todavía, crea una interfaz clara, documenta la limitación y deja una abstracción lista para conectarla.

# &#x20;   Prioriza primero la fiabilidad, la seguridad y la persistencia; después añade IA y efectos avanzados.

# &#x20;   Mantén la experiencia rápida y sencilla para el atleta.

# &#x20;   Mantén la experiencia potente y eficiente para el entrenador.

# &#x20;   Mide el éxito por el flujo completo y no por el número de botones.

# 

# Comienza por la auditoría exhaustiva del código y de la aplicación desplegada. Después crea un plan técnico priorizado, implementa las fases P0 y P1 de forma completa, valida todo con pruebas y continúa con P2 y P3 siempre que la arquitectura y el tiempo lo permitan. No te detengas en recomendaciones generales: ejecuta los cambios, verifica que funcionan y deja la solución preparada para evolucionar como una plataforma profesional de entrenamiento para gimnasios.



# Informe comparativo profundo de plataformas para rutinas, coaching y gestión fitness

## Resumen ejecutivo

Este informe sintetiza la evidencia disponible sobre diez plataformas de software para entrenamiento, coaching y gestión de negocios fitness: ABC Trainerize, TrueCoach, My PT Hub, FitSW, Exercise.com, Virtuagym, TrainHeroic, Wodify, Hexfit y Gymdesk. El resultado principal es que el mercado comparte un núcleo funcional relativamente estable: **programar entrenamientos, entregar rutinas, registrar resultados, comunicarse con clientes y administrar una parte del negocio**. Por tanto, la existencia aislada de una biblioteca de ejercicios, mensajería, métricas o pagos no constituye por sí sola una innovación.

Las diferencias más útiles aparecen en el **modelo operativo al que cada plataforma da prioridad**. ABC Trainerize, My PT Hub, FitSW y Virtuagym intentan cubrir de manera amplia el coaching remoto o híbrido, con nutrición, hábitos, engagement, pagos y, en algunos casos, aplicaciones con marca propia. TrueCoach se concentra más en el flujo del entrenador personal y la entrega de programas. TrainHeroic está especialmente orientada a fuerza, rendimiento, equipos y venta de programación mediante marketplace. Wodify, Exercise.com y Gymdesk priorizan la operación de gimnasios, estudios, membresías, clases y retención; Wodify añade una capa específica de rendimiento y analítica de clientes. Hexfit se distingue por un expediente de seguimiento 360° para profesionales de fitness y salud, con integración de datos de actividad y extensibilidad.

La **diferenciación relativa más clara** no es una función universalmente superior, sino la combinación de funciones dentro de un flujo vertical. TrainHeroic integra programación de rendimiento, equipos, rankings y marketplace. Gymdesk adapta la lógica de progreso a promociones y cinturones de artes marciales. Wodify conecta operaciones de gimnasio, rendimiento, pagos y retención, con Ask Wodify y capacidades predictivas declaradas. Exercise.com y ABC Trainerize ofrecen una propuesta fuerte para marcas, multi-sede y operación integral. Hexfit pone mayor énfasis en expedientes, evaluaciones, datos corporales y wearables.

Las funciones de inteligencia artificial merecen una lectura prudente. AI Workout Builder, Smart Meal Planner, Check-Ins AI, IA de análisis de movimiento, MAX AI Coach y Ask Wodify son capacidades declaradas por los proveedores, pero la evidencia entregada no incluye pruebas comparativas, validación clínica ni mediciones independientes de precisión. Deben considerarse **asistencia editable** y no sustitutos del criterio profesional.

La nutrición está distribuida de forma desigual. ABC Trainerize, My PT Hub, Virtuagym y Hexfit presentan los módulos más amplios entre las plataformas estudiadas; TrueCoach y FitSW ofrecen seguimiento, planes o métricas con distinto alcance; TrainHeroic la trata de forma limitada; y en Wodify y Gymdesk no se verificó un módulo nativo completo de planificación o diario alimentario. En ningún caso debe inferirse asesoramiento médico o nutrición clínica regulada.

La recomendación no es elegir una plataforma “mejor” en abstracto. La selección debe partir del tipo de negocio, el peso real de la programación frente a la gestión de membresías, la profundidad nutricional requerida, la necesidad de una app de marca, el país de operación, el volumen de clientes y el presupuesto total de add-ons, pagos, SMS, migración y soporte. Los precios, límites, integraciones y capacidades cambian por plan, región, fecha y tipo de cuenta; deben validarse en una demostración y en una oferta contractual vigente.

## 1\. Alcance y criterios de análisis

### 1.1 Alcance

La unidad de análisis es la plataforma como producto de software, no una aplicación individual, un procesador de pagos o una integración aislada. La síntesis usa exclusivamente los resultados y las URL proporcionados en la investigación. Las páginas oficiales se utilizaron para describir posicionamiento, funciones, planes y disponibilidad declarada. Se incorporaron fuentes independientes —PTPioneer, Capterra, Software Advice, G2, Trustpilot, Google Play, App Store y Host Merchant Services— únicamente como contraste de percepción, cobertura o limitaciones.

El conjunto no constituye una comparación competitiva exhaustiva del mercado ni una prueba práctica. No se realizaron pruebas de compra, uso, rendimiento, seguridad, exportación, sincronización, entrega de pagos o exactitud de la IA. Las cifras de usuarios, clientes, países, vídeos, alimentos, puntuaciones y afirmaciones como “#1”, “mejor” o “única” se trataron como declaraciones del proveedor o señales de reseñas, no como hechos auditados.

### 1.2 Criterios de clasificación

Se usaron cuatro distinciones para evitar confundir amplitud con innovación:

1. **Funcionalidad común.** Capacidad encontrada como parte del núcleo o del flujo típico en varias plataformas: por ejemplo, crear rutinas, asignarlas, registrar resultados, enviar mensajes o gestionar cobros.
2. **Diferencial verificable o declarado.** Capacidad explícitamente documentada que aporta una orientación distinta o una integración de flujo relevante, sin afirmar que sea exclusiva ni superior a toda alternativa.
3. **Innovación relativa.** Diferenciación frente al conjunto analizado, no una evaluación de novedad tecnológica, patente o superioridad comercial. El nivel “alto” significa que la capacidad es especialmente distintiva dentro de esta muestra; no significa que esté probada como mejor.
4. **Evidencia.** “Oficial” indica documentación o marketing del proveedor. “Independiente” indica reseñas, fichas de terceros o tiendas de aplicaciones. La evidencia independiente ayuda a identificar experiencia percibida y riesgos, pero no reemplaza una auditoría funcional.

### 1.3 Criterios de lectura de precios y acceso

Los importes incluidos son los visibles en las fuentes entregadas, no una cotización actual garantizada. Se expresan en dólares estadounidenses cuando la fuente lo hace. Un precio bajo de entrada puede ocultar límites de clientes, funciones bloqueadas, add-ons de nutrición, vídeo, pagos, IA, app de marca, SMS, ubicaciones, hardware o procesamiento financiero. En consecuencia, el coste relevante es el **coste total del flujo crítico**, no solo la tarifa base.

## 2\. Tabla comparativa de las diez plataformas

|Plataforma|Posicionamiento y usuario objetivo|Núcleo común verificado|Diferenciales relativos|Acceso, precio o condición relevante|Evidencia principal|
|-|-|-|-|-|-|
|**ABC Trainerize**|Coaching más allá del gimnasio para entrenadores independientes, coaches online e híbridos, estudios, gimnasios, clubes, franquicias y negocios multi-sede.|Programación, seguimiento, hábitos, nutrición, mensajería, agenda, reservas, ventas y pagos.|AI Workout Builder, Smart Meal Planner, mensajes de voz y vídeo, gamificación, wearables, Custom Branded App y capacidades Studio/Enterprise.|Basic gratuito para 1 cliente; Grow mostrado a 9 USD/mes para 2; Pro 5 desde 23 USD/mes hasta 200; Studio Plus mostrado a 248 USD/mes para 500–1.000+ clientes. Nutrición avanzada, Business, vídeo, Stripe y app de marca pueden ser add-ons.|[1](https://www.trainerize.com/) [2](https://www.trainerize.com/features/) [3](https://www.trainerize.com/integrations/) [4](https://www.trainerize.com/pricing/) [6](https://www.ptpioneer.com/personal-training/tools/trainerize-review/) [7](https://www.trainerize.com/features/business/) [8](https://www.trainerize.com/features/stripe-payments/)|
|**TrueCoach**|Plataforma para entrenadores personales que entrega programación, seguimiento y comunicación a clientes virtuales, híbridos o presenciales.|Constructor drag-and-drop, plantillas, biblioteca de vídeos, logging, cumplimiento, mensajería, nutrición básica o documental y facturación.|Perfiles públicos, riesgo de pérdida de cumplimiento, Zapier, wearables, vídeos propios y pagos Stripe declarados como incluidos, con disponibilidad regional.|Capterra muestra 25,99 USD/mes hasta 5 clientes, 63,99 USD/20 y 128,99 USD/50; importes no confirmados por la página oficial y sujetos a cambio. Pagos declarados para EE. UU., Reino Unido, Canadá y Australia.|[9](https://truecoach.co/) [10](https://truecoach.co/features/) [12](https://truecoach.co/features/personal-trainer-billing-software/) [13](https://truecoach.co/blog/truecoach-and-zapier-the-ultimate-fitness-tech-integration/) [14](https://www.capterra.com/p/155784/truecoach/) [16](https://truecoach.co/features/wearables/) [17](https://truecoach.co/features/program-workout-builder/) [18](https://truecoach.co/features/client-management-communication-tools/)|
|**My PT Hub**|Sistema “all-in-one” para entrenadores presenciales, online e híbridos, coaches de nutrición y wellness, CrossFit/HYROX y pequeños estudios.|Programación, nutrición, seguimiento, chat, reservas, clases, pagos, ventas, onboarding, grupos y administración.|AI workout builder, Check-Ins AI, base alimentaria y barcode scanner, app personalizada/white-label, clases en vivo y stack de operación de principio a fin.|La fuente muestra Starter con 3 clientes y Premium con límites amplios; otra vista muestra 25 USD/mes, 59 USD/mes y 215 USD/mes según plan, pero hay promociones, anualidad y add-ons.|[19](https://www.mypthub.net/) [20](https://www.mypthub.net/features/) [21](https://www.mypthub.net/pricing/) [23](https://www.mypthub.net/features/custom-branded-fitness-app/) [24](https://www.mypthub.net/features/white-label/) [25](https://www.mypthub.net/ai-personal-training-app/) [27](https://www.ptpioneer.com/personal-training/tools/my-pthub-review/)|
|**FitSW**|Plataforma cloud para profesionales del fitness, coaches de nutrición, estudios, gimnasios y equipos, con uso web, iOS y Android.|Constructor y asignación de rutinas, métricas, gráficos, nutrición, mensajería, citas, documentos, pagos y clases remotas.|IA declarada de análisis de movimiento, compra→alta de cliente→entrega automática, planes multidía, streaming hasta 200 participantes y agenda multiplataforma.|El plan gratuito excluye pagos, perfiles FindTrainGain y clases en vivo. Las funciones de IA, streaming, integraciones y gimnasio dependen de plan, plataforma y fecha.|[29](https://www.fitsw.com/) [30](https://www.fitsw.com/features/) [31](https://www.fitsw.com/faq/) [32](https://apps.apple.com/us/app/fitsw-for-personal-trainers/id1184011053) [33](https://www.softwareadvice.com/fitness/fitsw-profile/reviews/) [34](https://www.fitsw.com/blog/google-fit-and-apple-healthkit-integration/) [35](https://www.fitsw.com/blog/inbody-integration-with-fitsw-progress-graphs/)|
|**Exercise.com**|Plataforma B2B para gimnasios, estudios, entrenadores, negocios online, equipos y operadores multiubicación.|Operación de miembros, programación, seguimiento, CRM, marketing, reservas, pagos, membresías y entrega online.|Apps iOS/Android de marca, white-label, migración “done-for-you”, integración vertical y PCI Level 1 declarado.|No publica tarifa estándar; pide cotización. Software Advice muestra “desde 239 USD/mes”, cifra que debe confirmarse por configuración, volumen y fecha.|[37](https://www.exercise.com/) [38](https://www.exercise.com/platform/pricing/) [39](https://www.exercise.com/platform/custom-branded-apps/) [40](https://www.exercise.com/platform/payments/) [41](https://www.exercise.com/platform/workout/) [42](https://www.exercise.com/platform/online/) [43](https://www.exercise.com/platform/marketing/) [47](https://www.g2.com/products/exercise/reviews) [48](https://www.softwareadvice.com/corporate-wellness/exercise-com-profile/)|
|**Virtuagym**|SaaS “all-in-one” de gestión, coaching y engagement para gimnasios, estudios, entrenadores, clubes, cadenas y wellness corporativo.|Membresías, cobros, reservas, rutinas, seguimiento, comunidad, nutrición, app y analítica.|Retention Planner y customer health score, MAX AI Coach/AI workout builder, app blanca, PRO+, biblioteca 3D y algoritmo nutricional declarado.|Precios oficiales no verificables de forma robusta. Software Advice muestra desde 29 USD/año, cifra posiblemente incompleta o desactualizada; solicitar cotización y módulos.|[49](https://business.virtuagym.com/) [50](https://business.virtuagym.com/gym-software/) [51](https://business.virtuagym.com/training-plan-software/) [52](https://business.virtuagym.com/nutrition-software/) [53](https://business.virtuagym.com/engagement-software/) [54](https://business.virtuagym.com/payment-software/) [55](https://business.virtuagym.com/software-integrations/) [57](https://www.softwareadvice.com/membership-management/virtuagym-profile/) [58](https://www.g2.com/products/virtuagym/reviews)|
|**TrainHeroic**|Plataforma de fuerza y acondicionamiento para coaches, equipos, atletas remotos y presenciales, con Marketplace de programas.|Programación, registro de rendimiento, dashboard, comunicación, roster, equipos, vídeos y seguimiento de cumplimiento.|Marketplace, venta de programación, PRs, rankings, leaderboard, Master Calendar y flujo coach-atleta. Nutrición y facturación 1:1 son limitadas.|Prueba de coach de 14 días sin tarjeta. El cobro integrado corresponde al Marketplace; los clientes 1:1 invitados se facturan fuera de la plataforma.|[59](https://www.trainheroic.com/) [60](https://www.trainheroic.com/coach/) [61](https://support.trainheroic.com/hc/en-us/articles/18156689314701-Does-TrainHeroic-support-integrations-with-other-apps) [62](https://support.trainheroic.com/hc/en-us/articles/18156516234509-How-can-I-track-nutrition-in-TrainHeroic) [63](https://support.trainheroic.com/hc/en-us/articles/18156629990797-Can-I-bill-my-personal-training-clients-through-TrainHeroic) [64](https://support.trainheroic.com/hc/en-us/articles/18170981905677-How-do-I-message-my-coach-and-teammates) [65](https://www.ptpioneer.com/personal-training/tools/train-heroic-review/) [66](https://marketplace.trainheroic.com/)|
|**Wodify**|Gestión integral de gimnasios y estudios, especialmente fitness funcional, CrossFit, artes marciales, HIIT, yoga, Pilates y entrenamiento personal.|Clases, membresías, reservas, check-in, CRM, pagos, comunicación, marketing y reporting.|Wodify Perform, PRs y leaderboard, Ask Wodify, retención predictiva declarada, app de marca y ecosistema de integraciones.|Perform, branded app, acceso 24/7, heart-rate tracking, Marketplace y otras capacidades pueden ser add-ons. Instant Payouts se indica para negocios elegibles de EE. UU.|[67](https://www.wodify.com/) [68](https://www.wodify.com/products) [69](https://www.wodify.com/products/performance-tracking) [70](https://www.wodify.com/products/payments) [71](https://www.wodify.com/products/ai-solutions-for-gyms-and-fitness) [72](https://www.wodify.com/integrations) [73](https://www.wodify.com/integrations/hsn-healthy-steps-nutrition) [74](https://apps.apple.com/us/app/wodify/id1563729830) [75](https://hostmerchantservices.com/articles/wodify-review/)|
|**Hexfit**|Seguimiento 360° para profesionales de fitness y salud: entrenadores, coaches, kinesiólogos, fisioterapeutas, nutricionistas y gimnasios.|Programación, expediente, evaluaciones, progreso, nutrición, comunicación, citas, pagos y formularios.|Autoplay y señales sonoras, wearables, integración Xplor Active, API abierta y Zapier; orientación de expediente más clínica/de seguimiento que una app de rutinas simple.|Tarifas actuales, comisiones y cobertura regional no quedaron verificadas. La API tiene límite publicado de 500 llamadas mensuales y el soporte técnico se reserva a Studio o Institutional.|[76](https://www.myhexfit.com/en/) [77](https://www.myhexfit.com/en/personal-trainer-app/) [78](https://www.myhexfit.com/en/features/mobile-app/) [79](https://www.myhexfit.com/en/academy/integration-xplor-deciplus-resamania/) [80](https://help.myhexfit.com/en/articles/15182241-using-the-hexfit-api-external-developer-guide) [81](https://help.myhexfit.com/en/articles/4238108-connection-with-zapier) [82](https://play.google.com/store/apps/details?id=com.myhexfit.app&hl=en_US) [83](https://www.capterra.com/p/150393/Hexfit/) [84](https://www.softwareadvice.com/personal-trainer/hexfit-profile/)|
|**Gymdesk**|Gestión de gimnasios, escuelas y estudios de membresía, con especial adecuación a artes marciales y negocios pequeños o medianos.|Membresías, pagos, asistencia, reservas, waivers, portal, marketing, CRM, reportes y acceso.|Criterios de promoción por sesiones, días, edad o habilidades; progreso hacia el siguiente cinturón; conexión entre impago, check-in y acceso; todos los planes incluyen la plataforma completa.|Planes por miembros activos; prueba de 30 días. Gymdesk Payments se indica solo para EE. UU.; SMS, hardware y algunas funciones tienen costes propios. No se verificó rutinas ni nutrición nativas completas.|[85](https://gymdesk.com/) [86](https://gymdesk.com/pricing) [87](https://gymdesk.com/features/billing) [88](https://gymdesk.com/features/integrations) [89](https://gymdesk.com/features/gymdesk-payments) [90](https://docs.gymdesk.com/en/help/docs/payment-processing) [91](https://www.softwareadvice.com/fitness/martial-arts-on-rails-profile/) [92](https://gymdesk.com/features/payment-processors)|

## 3\. Inventario agrupado de funcionalidades

### 3.1 Programación y entrega de rutinas

La programación es el punto de mayor convergencia. ABC Trainerize, TrueCoach, My PT Hub, FitSW, Exercise.com, Virtuagym, TrainHeroic, Wodify mediante Wodify Perform y Hexfit documentan la creación, asignación y seguimiento de planes. Gymdesk no presenta en las páginas consultadas una función nativa claramente documentada de prescripción de rutinas, aunque una ficha de terceros menciona categorías como “fitness plan” sin describir su comportamiento.

|Capacidad|Situación en la muestra|Plataformas con evidencia destacada|Distinción analítica|
|-|-|-|-|
|Crear entrenamientos personalizados|Común en la mayoría|ABC Trainerize, TrueCoach, My PT Hub, FitSW, Exercise.com, Virtuagym, TrainHeroic, Hexfit|Es una capacidad base; no implica programación avanzada.|
|Plantillas, duplicación y programas multisemana|Común|TrueCoach, My PT Hub, FitSW, Virtuagym, TrainHeroic, Hexfit|Acelera la operación, pero es una ventaja de productividad común.|
|Circuitos, superseries, AMRAP, fuerza y descansos|Común con profundidad variable|TrueCoach, FitSW, TrainHeroic y Wodify Perform|La especialización en rendimiento es más clara en TrainHeroic y Wodify.|
|Biblioteca de ejercicios y vídeos|Común|ABC Trainerize, TrueCoach, My PT Hub, FitSW, Virtuagym, Hexfit|Las cifras de vídeos/ejercicios no son comparables: las páginas oficiales de TrueCoach, My PT Hub y Virtuagym muestran números diferentes según página o fecha.|
|Vídeos propios o privados|Común/diferencial operativo|TrueCoach, My PT Hub, FitSW, Exercise.com|Diferencia de entrega y branding, no de categoría funcional.|
|Programación asistida por IA|Diferencial emergente|ABC Trainerize, My PT Hub, Virtuagym|Genera un borrador o ayuda a ajustar; requiere revisión profesional.|
|Programación orientada a equipos, PRs y porcentajes|Diferencial vertical|TrainHeroic y Wodify Perform|Es especialmente relevante para fuerza, CrossFit y rendimiento.|
|Prescripción nativa verificada|No confirmada|Gymdesk|No debe inferirse a partir de categorías de software de terceros.|

ABC Trainerize documenta un **AI Workout Builder** que genera un borrador editable a partir de objetivos y preferencias; la revisión del volumen, la progresión y las semanas de descarga queda en manos del coach [2](https://www.trainerize.com/features/) [6](https://www.ptpioneer.com/personal-training/tools/trainerize-review/). My PT Hub y Virtuagym describen capacidades de IA similares, pero no aportan una metodología ni comparación de resultados [25](https://www.mypthub.net/ai-personal-training-app/) [49](https://business.virtuagym.com/).

### 3.2 Bibliotecas, contenido y reutilización

La biblioteca de ejercicios aparece en casi todas las plataformas de coaching. Incluye demostraciones en vídeo, imágenes, GIFs, instrucciones y, en varios casos, la posibilidad de cargar contenido propio. El número anunciado no debe usarse como ranking: TrueCoach presenta cifras diferentes de vídeos entre páginas; My PT Hub declara 8.000+ vídeos y otras fuentes mencionan otra magnitud; Virtuagym anuncia 6.000+ ejercicios 3D; ABC Trainerize muestra cifras distintas entre su página de inicio y la de funcionalidades [2](https://www.trainerize.com/features/) [9](https://truecoach.co/) [10](https://truecoach.co/features/) [19](https://www.mypthub.net/) [49](https://business.virtuagym.com/) [51](https://business.virtuagym.com/training-plan-software/).

Las diferencias útiles son de **control de contenido** y **modelo de distribución**. ABC Trainerize ofrece control HQ/franquicia en niveles superiores. Exercise.com y My PT Hub ofrecen apps con marca propia o white-label. TrainHeroic convierte programas reutilizables en productos del Marketplace. Gymdesk no aporta evidencia equivalente de una biblioteca de rutinas. Por ello, una evaluación práctica debería comprobar si el contenido puede editarse, versionarse, ocultarse, migrarse y asignarse en bloque.

### 3.3 Seguimiento, cumplimiento y progreso

Todas las plataformas de coaching estudiadas, excepto Gymdesk en el alcance específicamente documentado, presentan alguna forma de registro de sesiones, métricas o asistencia. El denominador común incluye historial de entrenamiento, metas, cumplimiento, peso o medidas y visualización mediante dashboard o gráficos. La profundidad varía:

* **ABC Trainerize** combina entrenamientos, nutrición, hábitos y wearables en el perfil del cliente, y añade rachas, insignias, hitos, desafíos y WOD grupales [2](https://www.trainerize.com/features/) [3](https://www.trainerize.com/integrations/).
* **TrueCoach** registra repeticiones, peso, frecuencia cardiaca, fotos, medidas, hábitos y cumplimiento en ventanas de 7, 30 y 90 días [10](https://truecoach.co/features/) [18](https://truecoach.co/features/client-management-communication-tools/).
* **My PT Hub** ofrece métricas corporales, rendimiento, fotos, hábitos, compliance y check-ins [20](https://www.mypthub.net/features/).
* **FitSW** genera gráficos y tablas de peso, composición, fuerza, fotos, tareas y objetivos [30](https://www.fitsw.com/features/) [32](https://apps.apple.com/us/app/fitsw-for-personal-trainers/id1184011053).
* **Exercise.com** combina workouts con evaluaciones, check-ins, informes, KPI y gestión del ciclo de vida del miembro [37](https://www.exercise.com/) [41](https://www.exercise.com/platform/workout/) [47](https://www.g2.com/products/exercise/reviews).
* **Virtuagym** integra objetivos, asistencia, actividad, evaluaciones, métricas y engagement [50](https://business.virtuagym.com/gym-software/) [53](https://business.virtuagym.com/engagement-software/).
* **TrainHeroic** se centra en historial de rendimiento, PRs, cumplimiento, rankings, leaderboard y feedback técnico [59](https://www.trainheroic.com/) [60](https://www.trainheroic.com/coach/) [65](https://www.ptpioneer.com/personal-training/tools/train-heroic-review/).
* **Wodify** añade resultados, porcentajes, pesos, tiempos, PRs y leaderboard en el flujo de Wodify Perform [69](https://www.wodify.com/products/performance-tracking) [74](https://apps.apple.com/us/app/wodify/id1563729830).
* **Hexfit** prioriza expediente, evaluaciones físicas, composición corporal, capacidad aeróbica, objetivos, gráficas y fotos [76](https://www.myhexfit.com/en/) [77](https://www.myhexfit.com/en/personal-trainer-app/) [83](https://www.capterra.com/p/150393/Hexfit/).
* **Gymdesk** documenta asistencia, check-in, retención e ingresos; no se verificó un sistema equivalente de registro de workouts [85](https://gymdesk.com/) [87](https://gymdesk.com/features/billing).

La capacidad de seguimiento más distintiva en la muestra es la conexión entre **datos y acción operativa**. Wodify declara modelos de riesgo de cancelación y automatización de re-engagement; Virtuagym presenta customer health score y Retention Planner; TrueCoach declara evaluación automatizada de riesgo de pérdida de cumplimiento; y Gymdesk conecta estado de pago, notificaciones, check-in y acceso [18](https://truecoach.co/features/client-management-communication-tools/) [53](https://business.virtuagym.com/engagement-software/) [71](https://www.wodify.com/products/ai-solutions-for-gyms-and-fitness) [87](https://gymdesk.com/features/billing). Ninguna de estas afirmaciones debe interpretarse como validación estadística independiente.

### 3.4 Comunicación, comunidad y engagement

La mensajería individual y grupal, las notificaciones y los recordatorios son comunes en las plataformas orientadas a coaching. El alcance más frecuente incluye comentarios asociados a la rutina, fotos, vídeos, documentos, GIFs y formularios. Los productos de gestión de gimnasios añaden email, SMS, CRM, campañas y automatizaciones de leads.

ABC Trainerize se diferencia por mensajes de voz y videollamadas 1:1 o grupales, aunque el vídeo puede requerir un add-on [2](https://www.trainerize.com/features/) [7](https://www.trainerize.com/features/business/). My PT Hub combina chat, broadcasts, check-ins automatizados, comunidad, grupos y mensajería programada [20](https://www.mypthub.net/features/) [25](https://www.mypthub.net/ai-personal-training-app/). FitSW ofrece mensajes contextuales vinculados a entrenamientos, comidas, tareas, progreso, pagos y citas [32](https://apps.apple.com/us/app/fitsw-for-personal-trainers/id1184011053). TrainHeroic limita el chat directo del coach a atletas con programación individualizada; en equipos se usa principalmente el canal grupal [61](https://support.trainheroic.com/hc/en-us/articles/18156689314701-Does-TrainHeroic-support-integrations-with-other-apps) [64](https://support.trainheroic.com/hc/en-us/articles/18170981905677-How-do-I-message-my-coach-and-teammates). Wodify integra comunicación de clase, comunidad, comentarios, celebraciones y journeys de marketing [68](https://www.wodify.com/products) [74](https://apps.apple.com/us/app/wodify/id1563729830). Gymdesk enfatiza email, SMS, recordatorios, CRM y automatización de prospectos más que una relación coach-atleta multimedia [85](https://gymdesk.com/) [88](https://gymdesk.com/features/integrations).

La gamificación aparece en ABC Trainerize, Virtuagym, TrainHeroic y Wodify mediante rachas, insignias, retos, rankings, leaderboards o hitos. Es un mecanismo de engagement relativamente común; la diferencia está en si se conecta con resultados de entrenamiento, asistencia, retención o comunidad.

### 3.5 Nutrición

La nutrición es el eje con mayor variabilidad y mayor riesgo de sobreinterpretación. La tabla siguiente separa el nivel funcional observado de cualquier conclusión clínica.

|Nivel observado|Plataformas|Funciones documentadas|Límite importante|
|-|-|-|-|
|**Suite amplia**|ABC Trainerize, My PT Hub, Virtuagym, Hexfit|Planes, alimentos, calorías/macros, hábitos, registros y, según el caso, recetas, listas de compra, código de barras o análisis dietético.|No equivale a nutrición clínica o asesoramiento médico. La disponibilidad puede ser add-on o depender del plan.|
|**Seguimiento y planes con alcance intermedio**|TrueCoach, FitSW|TrueCoach admite documentos, calorías/macros, métricas e integración MyFitnessPal; FitSW ofrece planes, macros, alimentos, agua y cumplimiento.|Confirmar quién crea la recomendación, qué base alimentaria existe y la cobertura legal en cada jurisdicción.|
|**Alcance limitado o dependiente de terceros**|TrainHeroic, Exercise.com|TrainHeroic permite métricas personalizadas para proteína, carbohidratos, calorías e hidratación y sincronización de macros/calorías en Athlete Pro; Exercise.com documenta metas de macros y datos nutricionales conectados.|No se verificó un módulo completo de prescripción de dietas o base alimentaria equivalente.|
|**No verificado como módulo nativo completo**|Wodify, Gymdesk|Wodify documenta integración HSN Mentoring; Gymdesk no muestra en las páginas revisadas nutrición o rutina nativa detallada.|No presentar la integración HSN ni una categoría de software como un sistema nutricional interno.|

ABC Trainerize documenta registro de comidas por foto, código de barras o búsqueda, Smart Meal Planner, recetas y listas de compra; la planificación avanzada se separa por plan o add-on [2](https://www.trainerize.com/features/) [4](https://www.trainerize.com/pricing/). My PT Hub ofrece base de alimentos, recetas, macros, planes y escáner de código de barras, pero una reseña advierte que el registro puede ser poco intuitivo [19](https://www.mypthub.net/) [27](https://www.ptpioneer.com/personal-training/tools/my-pthub-review/). Virtuagym anuncia 9 millones de productos y recomendaciones apoyadas en datos de peso, altura, sueño y actividad; la afirmación de desarrollo con una institución académica no sustituye una publicación o validación independiente [52](https://business.virtuagym.com/nutrition-software/). Hexfit combina planes, diario, análisis nutricional y MyFitnessPal [76](https://www.myhexfit.com/en/) [83](https://www.capterra.com/p/150393/Hexfit/).

TrainHeroic declara expresamente que no fue diseñado específicamente para nutrición y que el coach puede crear ejercicios personalizados para anotar métricas [62](https://support.trainheroic.com/hc/en-us/articles/18156516234509-How-can-I-track-nutrition-in-TrainHeroic). Wodify presenta HSN como integración de terceros para lanzar servicios de nutrición, no como prueba de un módulo nativo general [73](https://www.wodify.com/integrations/hsn-healthy-steps-nutrition). Exercise.com solo permite concluir que existen metas de macros y conexiones de datos, no una plataforma clínica [37](https://www.exercise.com/) [44](https://www.exercise.com/support/topics/business-connected-apps/).

### 3.6 Pagos, CRM, ventas y administración

Los pagos y la administración distinguen dos familias de productos. Las plataformas de coaching tienden a resolver facturación del entrenador, venta de paquetes y entrega de productos. Las plataformas de gimnasio resuelven membresías, contratos, facturación recurrente, acceso, POS, asistencia y retención.

|Área|Capacidades comunes|Diferenciales o restricciones observadas|
|-|-|-|
|Cobros|Pagos únicos o recurrentes, paquetes, sesiones, membresías o productos digitales|TrueCoach declara pagos incluidos pero regionales; ABC separa Stripe y Business como add-ons; TrainHeroic integra Marketplace, no billing 1:1 universal.|
|CRM y captación|Formularios, leads, onboarding, recordatorios, perfiles y automatizaciones|Exercise.com y Wodify presentan CRM/marketing integrados; My PT Hub y FitSW conectan compra, alta y entrega; Gymdesk destaca lead management y referidos.|
|Operación de membresías|Contratos, waivers, reservas, clases, listas de espera, asistencia|Wodify, Exercise.com, Virtuagym y Gymdesk tienen la cobertura más clara; ABC y My PT Hub la ofrecen más orientada al coach/estudio.|
|Acceso y control físico|Check-in, kiosco, acceso por estado de membresía|Gymdesk relaciona pagos, check-in y puerta; Wodify ofrece Kiosk+ y check-in; no es un rasgo general de las plataformas de coaching.|
|Venta de programación|Productos, membresías, Marketplace o planes digitales|TrainHeroic Marketplace, My PT Hub, FitSW y Exercise.com convierten contenido en oferta comercial.|

ABC Trainerize permite vender membresías, paquetes, sesiones y productos digitales, pero su página de precios separa Business y Stripe Integrated Payments [4](https://www.trainerize.com/pricing/) [7](https://www.trainerize.com/features/business/) [8](https://www.trainerize.com/features/stripe-payments/). TrueCoach declara pagos recurrentes y únicos impulsados por Stripe, con disponibilidad en cuatro países; Capterra recoge percepciones de funciones regionales o limitadas, por lo que deben verificarse moneda, impuestos, reembolsos y prorrateos [12](https://truecoach.co/features/personal-trainer-billing-software/) [14](https://www.capterra.com/p/155784/truecoach/). My PT Hub afirma pagos desde 190+ países y Apple Pay, pero la evidencia independiente recomienda confirmar métodos y condiciones [19](https://www.mypthub.net/) [27](https://www.ptpioneer.com/personal-training/tools/my-pthub-review/).

Exercise.com declara procesamiento PCI Level 1 y ofrece membresías, paquetes, upsells, productos y sesiones; el coste y el alcance de la migración “done-for-you” requieren contrato [40](https://www.exercise.com/platform/payments/) [43](https://www.exercise.com/platform/marketing/). Virtuagym documenta tarjetas, PayPal, GoCardless, BACS y SEPA según país y proveedor [54](https://business.virtuagym.com/payment-software/). Wodify Payments usa Stripe, ofrece facturación recurrente y transferencias de QuickBooks; Instant Payouts y Wodify Capital dependen de elegibilidad y mercado [70](https://www.wodify.com/products/payments). Gymdesk integra pagos con tarjeta, ACH y presencial, pero Gymdesk Payments aparece limitado a EE. UU. [89](https://gymdesk.com/features/gymdesk-payments) [90](https://docs.gymdesk.com/en/help/docs/payment-processing).

### 3.7 Integraciones y extensibilidad

Las integraciones son un diferencial de ecosistema, pero una lista de conectores no demuestra sincronización bidireccional, disponibilidad universal ni calidad de datos. La matriz siguiente resume el alcance documentado.

|Tipo de integración|Plataformas con evidencia|Observación|
|-|-|-|
|Wearables y salud|ABC Trainerize, TrueCoach, My PT Hub, Virtuagym, FitSW, Exercise.com, Hexfit|Apple Health, Health Connect, Apple Watch, Garmin, Fitbit, WHOOP, OURA, Polar, Strava, InBody u otros según producto. Los campos y sentidos de sincronización varían.|
|Nutrición|ABC Trainerize, TrueCoach, My PT Hub, Hexfit|MyFitnessPal aparece como conector relevante; no se debe suponer que todo dato se sincroniza igual en iOS y Android.|
|Calendarios|ABC Trainerize, FitSW, My PT Hub, Hexfit, Wodify, Gymdesk|Google Calendar, iCal, Outlook o calendarios externos aparecen con distinto nivel de confirmación.|
|Pagos|ABC Trainerize, TrueCoach, My PT Hub, Exercise.com, Virtuagym, Wodify, Hexfit, Gymdesk|Stripe es frecuente; también aparecen Square, GoCardless, Authorize.net y otros. País y métodos soportados son críticos.|
|Automatización no-code|TrueCoach, FitSW, Exercise.com, Virtuagym, Hexfit, Gymdesk|Zapier aparece en varias plataformas, con límites, acciones y planes no siempre publicados.|
|Gestión de gimnasios|ABC Trainerize, Hexfit, Wodify, Virtuagym|ABC conecta Glofox, Ignite y Mindbody; Hexfit documenta Xplor/Deciplus/Resamania; Wodify y Virtuagym tienen ecosistemas propios.|
|API/webhooks|ABC Trainerize, Exercise.com, Virtuagym, Hexfit; Software Advice lista API para Gymdesk|La investigación no verificó un catálogo homogéneo de endpoints, SLA, límites o exportación.|

ABC Trainerize presenta uno de los ecosistemas más amplios, con wearables, MyFitnessPal, Stripe, Google Calendar, YouTube, software de gimnasio y Zapier [3](https://www.trainerize.com/integrations/). TrueCoach documenta MyFitnessPal, Apple Health, Garmin, WHOOP, OURA y Zapier, pero no detalla todas las acciones [13](https://truecoach.co/blog/truecoach-and-zapier-the-ultimate-fitness-tech-integration/) [15](https://help.truecoach.co/en/articles/4174118-myfitnesspal-integration) [16](https://truecoach.co/features/wearables/). My PT Hub expone integraciones de calendarios, wearables y Zapier; una reseña de Trustpilot reporta problemas de sincronización como experiencia individual, no como defecto universal [26](https://www.mypthub.net/product-blog/zapier-integration/) [28](https://www.trustpilot.com/review/www.mypthub.net).

FitSW publica integraciones con Apple Health, Google Fit, InBody y calendarios [32](https://apps.apple.com/us/app/fitsw-for-personal-trainers/id1184011053) [34](https://www.fitsw.com/blog/google-fit-and-apple-healthkit-integration/) [35](https://www.fitsw.com/blog/inbody-integration-with-fitsw-progress-graphs/) [36](https://www.fitsw.com/blog/personal-trainer-schedule-management/). Exercise.com documenta Zapier, Intercom, QuickBooks, ClassPass, Vimeo, API y webhooks, mientras que G2 lista Google Analytics; no hay un inventario único y completo por plan [44](https://www.exercise.com/support/topics/business-connected-apps/) [45](https://www.exercise.com/support/connect-wearables/) [46](https://www.exercise.com/support/create-a-webhook/) [47](https://www.g2.com/products/exercise/reviews). Hexfit combina wearables, MyFitnessPal, calendarios, Zapier, API y Xplor; su API tiene límites de llamadas y requisitos de plan [79](https://www.myhexfit.com/en/academy/integration-xplor-deciplus-resamania/) [80](https://help.myhexfit.com/en/articles/15182241-using-the-hexfit-api-external-developer-guide) [81](https://help.myhexfit.com/en/articles/4238108-connection-with-zapier).

### 3.8 Analítica, automatización y retención

La analítica básica —historial, cumplimiento, asistencia, progreso, ingresos o reportes— es común. Los diferenciales aparecen cuando el sistema transforma datos en una acción recomendada o automática:

* **ABC Trainerize** combina el perfil holístico de ejercicio, nutrición, hábitos y wearables con desafíos y engagement [2](https://www.trainerize.com/features/) [3](https://www.trainerize.com/integrations/).
* **TrueCoach** ofrece dashboard, tasas de cumplimiento y evaluación de riesgo de pérdida de cumplimiento [10](https://truecoach.co/features/) [18](https://truecoach.co/features/client-management-communication-tools/).
* **My PT Hub** añade check-ins automatizados, compliance y Check-Ins AI, cuya promesa de reducir administración es marketing [20](https://www.mypthub.net/features/) [25](https://www.mypthub.net/ai-personal-training-app/).
* **Virtuagym** presenta Retention Planner y customer health score; no publica metodología ni precisión [53](https://business.virtuagym.com/engagement-software/).
* **Wodify** declara Ask Wodify, que responde preguntas en lenguaje natural sobre operaciones, retención e ingresos, y una capa de retención predictiva [69](https://www.wodify.com/products/performance-tracking) [71](https://www.wodify.com/products/ai-solutions-for-gyms-and-fitness).
* **Gymdesk** automatiza reintentos de pago, avisos, recargos, suspensión de check-in o corte de acceso [87](https://gymdesk.com/features/billing).

Estas funciones tienen distinto objeto. Una IA generativa ayuda a redactar o producir un borrador; un score de salud ordena señales; una automatización de cobro ejecuta una regla determinista. No deben agruparse como si fueran la misma tecnología ni como evidencia de que la plataforma puede tomar decisiones profesionales sin supervisión.

## 4\. Matriz de innovaciones y nivel relativo

El nivel de la matriz es relativo a las diez plataformas analizadas. **Alto** identifica un eje especialmente distintivo en esta muestra; **medio** identifica una diferenciación útil pero ya presente en varias plataformas; **emergente** indica una capacidad nueva o promocionada cuya evidencia independiente es débil; **vertical** indica profundidad específica para un tipo de negocio. La columna “fuerza de evidencia” separa documentación oficial de validación independiente.

|Innovación o diferencial|Plataformas|Nivel relativo|Por qué es relevante|Fuerza de evidencia y caveat|
|-|-|-|-|-|
|**Marketplace de programas y equipos**|TrainHeroic|**Alto / vertical**|Convierte la programación en canal de descubrimiento y venta global, además de gestionar equipos y 1:1.|Documentado oficialmente y contrastado por PTPioneer; no prueba que sea el Marketplace más rentable ni más grande [59](https://www.trainheroic.com/) [65](https://www.ptpioneer.com/personal-training/tools/train-heroic-review/) [66](https://marketplace.trainheroic.com/).|
|**Rendimiento, PRs, porcentajes, rankings y feedback**|TrainHeroic, Wodify Perform|**Alto / vertical**|Conecta registro de resultados y comunidad con coaching de fuerza o fitness funcional.|Documentación oficial y fichas de app; la profundidad operativa depende del plan/add-on [60](https://www.trainheroic.com/coach/) [69](https://www.wodify.com/products/performance-tracking) [74](https://apps.apple.com/us/app/wodify/id1563729830).|
|**Promoción y cinturones**|Gymdesk|**Alto / vertical**|Modela criterios de ascenso por sesiones, días, edad o habilidades, con visibilidad del siguiente nivel.|Evidencia oficial; específico de artes marciales y no extrapolable a otros negocios [85](https://gymdesk.com/) [87](https://gymdesk.com/features/billing).|
|**IA conversacional sobre operación**|Wodify|**Emergente / medio-alto**|Ask Wodify traduce preguntas sobre ingresos, retención y tendencias en respuestas y acciones sugeridas.|Marketing oficial; sin metodología, benchmark, exactitud ni auditoría independiente [71](https://www.wodify.com/products/ai-solutions-for-gyms-and-fitness).|
|**IA de workout o nutrición**|ABC Trainerize, My PT Hub, Virtuagym|**Emergente / medio**|Acelera creación de borradores de rutinas, meal plans o recomendaciones.|Documentación del proveedor; requiere revisión profesional y no prueba eficacia [2](https://www.trainerize.com/features/) [25](https://www.mypthub.net/ai-personal-training-app/) [49](https://business.virtuagym.com/) [52](https://business.virtuagym.com/nutrition-software/).|
|**IA de análisis de movimiento**|FitSW|**Emergente / alto declarado**|Pretende puntuar técnica para coaching remoto usando métricas evaluadas por profesionales.|Solo se verificó la declaración de marketing; no se halló validación clínica independiente [30](https://www.fitsw.com/features/).|
|**Check-ins, riesgo de abandono y re-engagement**|TrueCoach, My PT Hub, Virtuagym, Wodify|**Medio-alto**|Convierte cumplimiento, asistencia o señales de uso en acciones de retención.|Funciones documentadas; precisión de los modelos y tasa de reducción de churn no verificada [18](https://truecoach.co/features/client-management-communication-tools/) [25](https://www.mypthub.net/ai-personal-training-app/) [53](https://business.virtuagym.com/engagement-software/) [71](https://www.wodify.com/products/ai-solutions-for-gyms-and-fitness).|
|**App de marca y white-label**|ABC Trainerize, My PT Hub, Exercise.com, Virtuagym|**Medio-alto / empresarial**|Permite que el cliente use la experiencia bajo la marca del negocio y puede apoyar multi-sede.|Documentación oficial; suele ser add-on, nivel superior, coste extra y sujeto a requisitos de tiendas [7](https://www.trainerize.com/features/business/) [23](https://www.mypthub.net/features/custom-branded-fitness-app/) [24](https://www.mypthub.net/features/white-label/) [39](https://www.exercise.com/platform/custom-branded-apps/) [49](https://business.virtuagym.com/).|
|**Integración vertical de coaching y back-office**|ABC Trainerize, My PT Hub, Exercise.com, Virtuagym, Wodify|**Medio**|Reduce cambios entre programación, nutrición, CRM, reservas, pagos y comunidad.|Es una diferenciación de flujo, no exclusividad tecnológica; fuentes mayoritariamente promocionales [1](https://www.trainerize.com/) [19](https://www.mypthub.net/) [37](https://www.exercise.com/) [49](https://business.virtuagym.com/) [68](https://www.wodify.com/products).|
|**Expediente 360° y datos de wearables**|Hexfit|**Medio-alto / salud-fitness**|Integra evaluaciones, objetivos, nutrición, comunicación, wearables y API en una vista de cliente.|Capacidades oficiales, app y fuentes de terceros; seguridad y adecuación sanitaria requieren revisión contractual [76](https://www.myhexfit.com/en/) [79](https://www.myhexfit.com/en/academy/integration-xplor-deciplus-resamania/) [80](https://help.myhexfit.com/en/articles/15182241-using-the-hexfit-api-external-developer-guide) [82](https://play.google.com/store/apps/details?id=com.myhexfit.app&hl=en_US) [83](https://www.capterra.com/p/150393/Hexfit/).|
|**Automatización compra→cliente→entrega**|FitSW, My PT Hub, Exercise.com|**Medio**|Une venta digital, onboarding y entrega de contenido sin intervención manual en cada paso.|Declaraciones oficiales; deben probarse impuestos, reembolsos, permisos y casos de excepción [30](https://www.fitsw.com/features/) [37](https://www.exercise.com/) [40](https://www.exercise.com/platform/payments/).|
|**Nutrición integrada amplia**|ABC Trainerize, My PT Hub, Virtuagym, Hexfit|**Medio**|Reduce la necesidad de una aplicación nutricional separada para el coaching general.|Amplitud documentada, pero no equivale a asesoramiento clínico ni prueba de precisión de bases de alimentos [2](https://www.trainerize.com/features/) [19](https://www.mypthub.net/) [52](https://business.virtuagym.com/nutrition-software/) [76](https://www.myhexfit.com/en/).|

La matriz sugiere tres conclusiones. Primero, la innovación más defendible suele ser **vertical**: TrainHeroic para fuerza/equipos, Gymdesk para artes marciales y Wodify Perform para resultados en gimnasios. Segundo, la IA es un campo **emergente pero de evidencia débil**: la presencia de una función no permite concluir precisión, seguridad o ahorro. Tercero, la app blanca y la integración de back-office son importantes para escalar, pero representan principalmente **empaquetado, distribución y operación**, no necesariamente una innovación técnica exclusiva.

## 5\. Patrones por tipo de negocio

### 5.1 Entrenador independiente con pocos clientes

La prioridad suele ser construir rutinas rápidamente, registrar cumplimiento, enviar mensajes y cobrar sin montar una infraestructura compleja. TrueCoach ofrece un flujo relativamente enfocado en programación, vídeos, métricas y comunicación. ABC Trainerize permite comenzar con Basic y escalar hacia nutrición, hábitos, wearables y pagos. FitSW ofrece un enfoque multiplataforma con agenda, nutrición y documentos. My PT Hub es más amplio, pero su mayor número de módulos y add-ons puede añadir complejidad.

Gymdesk puede ser adecuado si el negocio funciona como membresía o escuela, pero no es la opción documentada más clara para prescripción de rutinas. TrainHeroic tiene sentido cuando el coach vende programas de rendimiento o gestiona atletas, no cuando necesita un CRM completo y facturación 1:1 dentro del mismo producto.

### 5.2 Coach online o híbrido con nutrición y hábitos

ABC Trainerize, My PT Hub, Virtuagym y Hexfit son las candidatas con evidencia más amplia de nutrición, hábitos y datos de actividad. ABC aporta la combinación de hábitos, wearables, gamificación y comunicación rica. My PT Hub ofrece una capa comercial y nutricional amplia, con app de marca y Check-Ins AI. Virtuagym combina nutrición con gestión de membresías y retención. Hexfit se orienta a expedientes, evaluaciones y seguimiento 360°.

La decisión debe depender de la profundidad real necesaria. Si el coach solo necesita macros y cumplimiento, TrueCoach o FitSW pueden ser suficientes. Si necesita prescripción alimentaria clínica, ninguna conclusión de esta investigación autoriza a tratar estas plataformas como sustitutos de sistemas clínicos o de las obligaciones profesionales locales.

### 5.3 Coach de fuerza, CrossFit, rendimiento o equipo

TrainHeroic es el caso de uso más específico: programación por categorías de atletas, roster, PRs, rankings, feedback de vídeo y Marketplace. Wodify Perform es más apropiado cuando, además del rendimiento, el negocio necesita gestionar clases, membresías, pagos, check-in y retención. TrueCoach puede servir a un coach de fuerza con operación más sencilla, pero no ofrece la misma evidencia de Marketplace o enfoque de equipo.

La elección debe comprobar el modelo de cobro. TrainHeroic integra el Marketplace, pero los clientes 1:1 invitados se facturan fuera de la plataforma [63](https://support.trainheroic.com/hc/en-us/articles/18156629990797-Can-I-bill-my-personal-training-clients-through-TrainHeroic).

### 5.4 Gimnasio, estudio o negocio de clases con membresías

Gymdesk, Wodify, Exercise.com y Virtuagym son las opciones que presentan la evidencia más clara de membresías, reservas, asistencia, pagos y operación de instalaciones. Gymdesk destaca por su modelo de precio por miembros activos, por incluir la plataforma completa en los planes y por la lógica de promociones de artes marciales. Wodify añade un enfoque fuerte en fitness funcional, CRM, pagos, retención y rendimiento. Exercise.com ofrece una propuesta B2B amplia con apps de marca, marketing y migración. Virtuagym combina gestión, coaching, comunidad, nutrición y retención.

La prueba decisiva no es la cantidad de módulos, sino el ciclo diario: alta del prospecto, firma del waiver, cobro, reserva, lista de espera, check-in, impago, comunicación, renovación, reporte y exportación contable. Ese ciclo debe probarse con datos ficticios antes de firmar.

### 5.5 Academia de artes marciales

Gymdesk presenta el diferencial más específico porque modela promociones, habilidades y progreso hacia cinturones. Wodify también contempla artes marciales y puede ser más apropiado cuando la prioridad es CRM, pagos, marketing y clases con performance. Exercise.com y Virtuagym pueden cubrir la operación general, pero la investigación no verificó un flujo de cinturones equivalente.

### 5.6 Organización multi-sede, franquicia o marca propia

ABC Trainerize, Exercise.com, Virtuagym y My PT Hub presentan evidencia de apps de marca o white-label y capacidades de administración de equipos. ABC añade HQ/franquicia, roles, permisos, API, SSO y analítica en niveles Studio/Enterprise. Exercise.com enfatiza aplicaciones personalizadas, migración y operación vertical. Virtuagym ofrece app de marca, PRO+ y gestión de membresías; My PT Hub permite app personalizada y white-label con costes adicionales.

En este segmento hay que verificar específicamente la separación entre sedes, propiedad del contenido, permisos, consolidación de informes, control de precios, publicación en App Store/Google Play, SLA, soporte de onboarding y exportación en caso de terminación.

### 5.7 Profesional que necesita expediente, datos corporales o wearables

Hexfit es la opción más claramente orientada a un expediente de seguimiento con evaluaciones, composición corporal, capacidad aeróbica, nutrición, wearables, API y Xplor. ABC Trainerize y Virtuagym también agregan datos de actividad y progreso, pero con una propuesta más amplia de coaching y negocio. TrueCoach ofrece wearables y métricas, aunque con un flujo más centrado en entrenadores personales.

Para cualquier uso que incluya información de salud, el criterio no debe ser solo la presencia de una integración. Hay que revisar DPA, RGPD u obligaciones locales, subencargados, retención, borrado, control de acceso, exportación y mecanismos de consentimiento.

## 6\. Recomendaciones de selección y contratación

### 6.1 Elegir por flujo de negocio, no por lista de funciones

Antes de comparar precios, el comprador debe dibujar el flujo mínimo que quiere digitalizar. Como mínimo, debe incluir captación, alta, consentimiento, evaluación inicial, asignación de programa, registro de sesión, check-in, comunicación, cobro, renovación, ausencia, impago, cancelación y exportación. Una plataforma que enumera muchos módulos puede no resolver bien el flujo específico que genera el ingreso.

### 6.2 Crear una matriz de requisitos ponderada

Se recomienda ponderar cada criterio según su impacto económico y operativo. Un ejemplo de ponderación para un coach híbrido sería 25 % programación y entrega, 20 % seguimiento y engagement, 15 % nutrición, 15 % pagos/CRM, 10 % integraciones, 10 % app y marca y 5 % soporte. Un gimnasio de membresías debería aumentar pagos, asistencia, reservas, acceso y reporting. Un equipo de rendimiento debería aumentar programación por categorías, PRs, rankings, feedback y roster.

La matriz debe registrar cuatro estados: **incluido**, **add-on**, **limitado por plan o región** y **no verificado**. No se debe calificar como disponible una función solo porque aparezca en una página de marketing general.

### 6.3 Validar el coste total de propiedad

La cotización debe separar tarifa base, número de clientes o miembros, ubicaciones, app de marca, nutrición avanzada, vídeo, IA, pagos, SMS, integraciones, Zapier, hardware, migración, soporte, impuestos, comisiones, permanencia y cancelación. Deben pedirse ejemplos de factura para un escenario pequeño y otro de crecimiento.

También conviene confirmar las condiciones de procesamiento: país y moneda, Apple Pay, ACH o SEPA, reembolsos, chargebacks, prorrateos, pagos fallidos, payout, retención de tokens, exportación de transacciones y conciliación contable. Esto es especialmente importante en TrueCoach, ABC Trainerize, My PT Hub, Exercise.com, Wodify y Gymdesk, donde la cobertura financiera depende del país, proveedor o nivel de cuenta [8](https://www.trainerize.com/features/stripe-payments/) [12](https://truecoach.co/features/personal-trainer-billing-software/) [40](https://www.exercise.com/platform/payments/) [54](https://business.virtuagym.com/payment-software/) [70](https://www.wodify.com/products/payments) [89](https://gymdesk.com/features/gymdesk-payments).

### 6.4 Exigir una prueba práctica con datos ficticios

La demostración debe incluir al menos un entrenador, un cliente presencial, un cliente remoto, un grupo, una sesión cancelada, un pago fallido, una modificación de rutina, una foto de progreso, una sincronización de wearable y una exportación. En nutrición se debe probar la creación de un plan, el registro de una comida, el cálculo de macros y la corrección de errores. En IA se debe observar cómo se revisa, edita, explica y audita la salida.

La prueba debe medir tiempo de ejecución, número de pantallas, permisos requeridos, comportamiento sin conexión, sincronización, calidad del soporte, accesibilidad móvil y facilidad para recuperar datos. Una lista de funciones no sustituye a esta prueba.

### 6.5 Validar datos, seguridad y cumplimiento

Para plataformas que manejan salud, peso, fotos, nutrición, frecuencia cardiaca o información financiera, la contratación debe incluir una revisión de seguridad y privacidad. Se deben solicitar DPA, lista de subencargados, regiones de alojamiento, cifrado, retención, borrado, control de roles, registro de accesos, respuesta a incidentes, exportación, portabilidad y terminación.

PCI Level 1 del proveedor de pagos no significa que todo el cumplimiento del negocio quede resuelto. Tampoco una app con wearables implica que el dato sea clínicamente válido. La responsabilidad profesional, el consentimiento y la normativa local siguen aplicando.

### 6.6 Tratar la IA como copiloto supervisado

AI Workout Builder, Smart Meal Planner, Check-Ins AI, MAX AI Coach, Ask Wodify y la IA de movimiento deben evaluarse como asistentes. El contrato y el procedimiento interno deben indicar qué decisiones requieren revisión humana, cómo se registran las modificaciones, qué datos se usan para generar una salida y cómo se corrige una recomendación incorrecta.

No se debe usar una afirmación de “ahorro de administración”, “personalización” o “análisis de forma” como evidencia de eficacia. La prueba debe incluir casos normales, casos extremos, restricciones, progresiones, descarga, lesiones y datos incompletos.

## 7\. Recomendación orientativa por escenario

|Escenario prioritario|Shortlist inicial razonable|Motivo de la shortlist|Verificación indispensable|
|-|-|-|-|
|Entrenador independiente o híbrido|TrueCoach, ABC Trainerize, FitSW, My PT Hub|Flujo de rutinas, seguimiento, mensajería y cobro con distinto nivel de amplitud.|Precio por cliente, pagos regionales, plantillas, exportación y facilidad de uso.|
|Coaching con nutrición, hábitos y wearables|ABC Trainerize, My PT Hub, Virtuagym, Hexfit|Mayor amplitud documentada en planes, métricas, hábitos y datos externos.|Profundidad nutricional, base alimentaria, legalidad profesional, sync y add-ons.|
|Fuerza, rendimiento o equipos|TrainHeroic; Wodify Perform si también se necesita gestión de gimnasio|Marketplace, PRs, rankings, equipos y seguimiento de rendimiento.|Billing 1:1, roster, categorías, feedback, límites del add-on y reporting.|
|Gimnasio con clases, membresías y pagos|Gymdesk, Wodify, Exercise.com, Virtuagym|Mejor evidencia de reservas, asistencia, CRM, pagos y operación de instalación.|Lista de espera, acceso físico, impagos, POS, contabilidad, multi-sede y migración.|
|Academia de artes marciales|Gymdesk; Wodify como alternativa de operación más amplia|Promociones y cinturones en Gymdesk; operación y retención en Wodify.|Reglas de promoción, familias, pagos, attendance, acceso y reportes.|
|Marca propia o multi-sede|ABC Trainerize, Exercise.com, Virtuagym, My PT Hub|App de marca, white-label y gestión de equipos o sedes.|Coste de publicación, propiedad de datos, permisos HQ, soporte y SLA.|
|Expediente y seguimiento 360°|Hexfit; ABC Trainerize o Virtuagym como alternativas más amplias|Evaluaciones, expediente, wearables, nutrición y extensibilidad.|DPA, seguridad, API, exportación, límites y requisitos sanitarios.|

Esta tabla es un punto de partida para una demostración, no un ranking. La plataforma recomendada puede cambiar si el criterio dominante es país, presupuesto, integración contable, soporte, migración, facilidad de uso o cumplimiento.

## 8\. Limitaciones y cautelas de interpretación

1. **Alcance de la investigación.** La investigación se limitó a las plataformas y fuentes entregadas. No es una comparación competitiva completa ni una prueba práctica del producto.
2. **Lenguaje promocional.** Las páginas oficiales son la fuente principal y usan lenguaje de marketing. Las cifras de usuarios, clientes, países, vídeos, alimentos, “#1”, “mejor”, “única” o ahorro de tiempo no fueron verificadas independientemente.
3. **Planes y regiones.** La disponibilidad depende del plan, add-ons, región y tipo de cuenta. Pagos Stripe, nutrición avanzada, vídeo, Business, app de marca, integraciones de gestión de gimnasios y capacidades empresariales no son universales.
4. **Precios dinámicos.** Los importes visibles pueden ser promocionales, anuales, antiguos, regionales o incompletos. Debe solicitarse una cotización escrita con límites, comisiones, impuestos y condiciones de cancelación.
5. **Cifras inconsistentes.** Las propias páginas de TrueCoach, My PT Hub, ABC Trainerize, Virtuagym y otros proveedores muestran cifras distintas según página o fecha. Se han tratado como órdenes de magnitud, no como métricas estables.
6. **Historia de actualizaciones.** La página de actualizaciones de ABC Trainerize no expuso en el contenido recuperado un historial detallado; no se atribuyeron fechas ni novedades concretas como hechos adicionales [5](https://www.trainerize.com/updates/).
7. **Fuentes independientes.** PTPioneer, Capterra, Software Advice, G2, Trustpilot, tiendas de aplicaciones y Host Merchant Services aportan percepción, reseñas o fichas de terceros. Algunas pueden incluir datos del proveedor, comisiones de referencia, reseñas incentivadas o experiencias individuales. No son auditorías funcionales.
8. **Integraciones.** Que una plataforma liste un conector no garantiza sincronización bidireccional, los mismos campos, disponibilidad en iOS y Android, límites de API o cobertura internacional. La afirmación de sincronización con Outlook de una fuente independiente no se presenta como integración oficial confirmada para ABC Trainerize, donde se verificó explícitamente Google Calendar.
9. **Nutrición y salud.** Las funciones de nutrición, bienestar y wearables no equivalen a asesoramiento médico, nutrición clínica ni validación de datos biométricos. La cualificación del coach y la jurisdicción determinan el alcance permitido.
10. **IA.** No se verificaron precisión, sesgo, seguridad, explicabilidad, rendimiento ni validación clínica de las capacidades de IA. El usuario debe exigir revisión humana y documentación de tratamiento de datos.
11. **Información incompleta.** No se verificaron de forma exhaustiva API pública, exportación, retención, propiedad de datos, SLA, soporte, límites de Zapier, comisiones, reconciliación contable ni cobertura real de todos los wearables.
12. **Ausencia de coste total comparable.** La muestra combina precios públicos, desde precios, planes con límites, add-ons y cotizaciones. No es válido ordenar las diez plataformas por precio sin un escenario homogéneo de usuarios, sedes, pagos, marca e integraciones.

## Conclusión

Las diez plataformas compiten sobre un núcleo funcional compartido, pero no sirven exactamente al mismo tipo de negocio. La decisión más robusta consiste en identificar primero el centro de gravedad operativo: coaching 1:1, programación de rendimiento, nutrición y hábitos, gestión de membresías, operación multi-sede, marca propia o expediente de salud-fitness.

Para coaching general y remoto, ABC Trainerize, TrueCoach, My PT Hub y FitSW ofrecen rutas razonables con distintos niveles de amplitud. Para una operación de gimnasio o estudio, Gymdesk, Wodify, Exercise.com y Virtuagym presentan la cobertura más clara de membresías, cobros, asistencia, reservas y CRM. Para fuerza y equipos, TrainHeroic aporta la especialización más evidente, mientras que Wodify Perform combina rendimiento con la operación de un gimnasio. Para seguimiento 360° de profesionales de fitness y salud, Hexfit tiene el diferencial de expediente, wearables y extensibilidad.

La conclusión no es que una plataforma gane a todas las demás. Es que el **encaje de flujo, la transparencia de costes, la cobertura regional, la portabilidad de datos y la capacidad de prueba práctica** deben pesar más que los superlativos de marketing o el número bruto de funciones.

## References

