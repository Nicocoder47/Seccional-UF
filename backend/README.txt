Backend Seccional UF (Flask + MySQL)
-----------------------------------
Pasos:
1) cd backend
2) python -m venv .venv
3) (PowerShell) . .venv\Scripts\Activate.ps1
4) pip install -r requirements.txt
5) Ajusta .env (credenciales DB)
6) python app.py

Probar:
- http://localhost:5000/api/health
- http://localhost:5000/api/afiliados/

Seed:
- python seed.py
