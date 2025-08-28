from flask_sqlalchemy import SQLAlchemy

# Instancia global de SQLAlchemy
db = SQLAlchemy()

# Función para construir la URI de conexión MySQL
def make_uri(host="localhost", port=3306, user="root", password="", name="seccional_db"):
    pwd = f":{password}" if password else ""
    return f"mysql+pymysql://{user}{pwd}@{host}:{port}/{name}?charset=utf8mb4"

# Inicializa la base de datos con la app Flask
def init_db(app):
    db.init_app(app)
    with app.app_context():
        # Import absoluto para que funcione con "python -m backend.app"
        from backend.models import Afiliado  # noqa: F401
        db.create_all()
