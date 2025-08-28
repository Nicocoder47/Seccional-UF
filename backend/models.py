from datetime import datetime
from backend.database import db  # ✅ IMPORT CORREGIDO

class Afiliado(db.Model):
    __tablename__ = "afiliados"

    id = db.Column(db.Integer, primary_key=True)
    dni = db.Column(db.String(10), unique=True, nullable=False, index=True)
    nombre = db.Column(db.String(120), nullable=False)
    apellido = db.Column(db.String(120), nullable=False)
    sector = db.Column(db.String(120))
    domicilio = db.Column(db.String(200))
    telefono = db.Column(db.String(30))
    email = db.Column(db.String(160))
    legajo = db.Column(db.String(40))
    fecha_nacimiento = db.Column(db.Date)
    fecha_ingreso = db.Column(db.Date)
    activo = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "dni": self.dni,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "sector": self.sector,
            "domicilio": self.domicilio,
            "telefono": self.telefono,
            "email": self.email,
            "legajo": self.legajo,
            "fecha_nacimiento": self.fecha_nacimiento.isoformat() if self.fecha_nacimiento else None,
            "fecha_ingreso": self.fecha_ingreso.isoformat() if self.fecha_ingreso else None,
            "activo": self.activo,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
