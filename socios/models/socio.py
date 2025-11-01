from django.db import models
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from socios.models.usuario import Usuario
    from socios.models.disciplina import Disciplina, Categoria

class NivelSocio(models.Model):
    nivel = models.IntegerField(unique=True)
    descuento = models.IntegerField()
    descripcion = models.CharField(max_length=255, blank=True, null=True)
    beneficios = models.TextField(blank=True, null=True)
    requisitos = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Nivel {self.nivel}"
    
    class Meta:
        verbose_name = "Nivel de Socio"
        verbose_name_plural = "Niveles de Socios"
        ordering = ["nivel"]

class SocioInfo(models.Model):
    usuario = models.OneToOneField(
        'Usuario', 
        on_delete=models.CASCADE, 
        primary_key=True, 
        related_name='socioinfo'
    )    
    nivel_socio = models.ForeignKey(
        NivelSocio, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    disciplina = models.ForeignKey(
        'Disciplina', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='socios'
    )
    categoria = models.ForeignKey(
        'Categoria', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='socios'
    )
    estado = models.CharField(
        max_length=20, 
        choices=[
            ('activo', 'Activo'),
            ('inactivo', 'Inactivo'),
        ], 
        default='activo',
        help_text='Estado de la membresía del socio'
    )
    fecha_inactivacion = models.DateTimeField(
        null=True, 
        blank=True,
        help_text='Fecha en que el socio pasó a estado inactivo'
    )
    razon_inactivacion = models.TextField(
        blank=True, 
        null=True,
        help_text='Motivo de la inactivación (ej: falta de pago, baja voluntaria)'
    )

    def __str__(self):
        return f"Socio: {self.usuario} ({self.estado})"

    class Meta:
        verbose_name = "Información de Socio"
        verbose_name_plural = "Información de Socios"


class GrupoFamiliar(models.Model):
    nombre = models.CharField(max_length=100, blank=True, null=True)
    responsable = models.ForeignKey(
        'Usuario', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )

    def __str__(self):
        return self.nombre if self.nombre else f"Grupo {self.id}"

    class Meta:
        verbose_name = "Grupo Familiar"
        verbose_name_plural = "Grupos Familiares"


class GrupoFamiliarIntegrante(models.Model):
    grupo_familiar = models.ForeignKey(GrupoFamiliar, on_delete=models.CASCADE)
    usuario = models.ForeignKey('Usuario', on_delete=models.CASCADE)

    class Meta:
        unique_together = ("grupo_familiar", "usuario")
        verbose_name = "Integrante de Grupo Familiar"
        verbose_name_plural = "Integrantes de Grupos Familiares"

    def __str__(self):
        return f"{self.usuario} en {self.grupo_familiar}"
