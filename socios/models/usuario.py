from django.db import models
import uuid
from typing import TYPE_CHECKING
from .disciplina import Disciplina
from .disciplina import Categoria

# Type checking para evitar importaciones circulares
if TYPE_CHECKING:
    from socios.models.rol import Rol

class Usuario(models.Model):
    SEXO_CHOICES = [
        ("masculino", "Masculino"),
        ("femenino", "Femenino"),
        ("otro", "Otro"),
    ]

    tipo_documento = models.CharField(max_length=50, blank=True, null=True)
    nro_documento = models.CharField(max_length=50, unique=True, blank=True, null=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    contrasena = models.CharField(max_length=255)
    telefono = models.CharField(max_length=50, blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    sexo = models.CharField(max_length=20, choices=SEXO_CHOICES, blank=True, null=True)
    foto_url = models.CharField(max_length=255, blank=True, null=True)
    qr_token = models.UUIDField(default=uuid.uuid4, unique=True)
    fecha_alta = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    roles = models.ManyToManyField("Rol", through="UsuarioRol", related_name="usuarios")

    disciplinas_a_cargo = models.ManyToManyField(
        Disciplina,
        blank=True, 
        related_name='entrenadores', 
    )

    categorias_a_cargo = models.ManyToManyField(
        Categoria,
        blank=True,
        related_name='entrenadores'
    )

    @property
    def is_authenticated(self):
        # Para compatibilidad básica, pero idealmente integrar con auth de Django
        return True

    @property
    def is_anonymous(self):
        # Para compatibilidad básica
        return False

    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.email})"

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        ordering = ["apellido", "nombre"]


class UsuarioRol(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    rol = models.ForeignKey("Rol", on_delete=models.CASCADE)

    class Meta:
        unique_together = ("usuario", "rol")
        verbose_name = "Usuario Rol"
        verbose_name_plural = "Usuarios Roles"

    def __str__(self):
        try:
            rol_nombre = self.rol.nombre
        except AttributeError:
            rol_nombre = str(self.rol)
        return f"{self.usuario} - {rol_nombre}"