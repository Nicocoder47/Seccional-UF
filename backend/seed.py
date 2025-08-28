from dotenv import load_dotenv
from app import create_app
from database import db
from models import Afiliado

load_dotenv()
app = create_app()

with app.app_context():
    db.session.query(Afiliado).delete()
    db.session.add_all([
        Afiliado(dni="12345678", nombre="Nicolás", apellido="Pérez", sector="Sistemas", activo=True),
        Afiliado(dni="23456789", nombre="María", apellido="Gómez", sector="Administración", activo=True),
    ])
    db.session.commit()
    print("✅ Cargados afiliados de prueba.")
