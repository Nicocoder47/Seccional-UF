# Backend Seccional UF (Flask + Railway)

## Despliegue rápido en Railway

1. Sube este backend a un repositorio de GitHub.
2. Entra a https://railway.app/ y crea un nuevo proyecto desde tu repo.
3. Railway detectará automáticamente Flask por el Procfile y requirements.txt.
4. Agrega tus variables de entorno (CORS_ORIGINS, SUPABASE_URL, etc) en Railway.
5. ¡Listo! Usa la URL pública que te da Railway en tu frontend.

## Archivos importantes
- `Procfile`: indica a Railway cómo correr la app.
- `requirements.txt`: dependencias de Python.
- `.env`: variables de entorno (no subir a GitHub).
- `.gitignore`: ignora archivos sensibles y temporales.
