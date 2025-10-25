from django.db import models
from typing import TYPE_CHECKING

from .usuario import Usuario
from .disciplina import Disciplina, Categoria



class Evento(models.Model):
    TIPO_CHOICES = [
        ("torneo", "Torneo"),
        ("partido", "Partido"),
        ("viaje", "Viaje"),
        ("otro", "Otro"),
    ]

    VISIBILITY_CHOICES = [
        ('ALL', 'Todos los socios'),
        ('DISCIPLINE', 'Solo socios del mismo deporte'),
        ('CATEGORY', 'Solo socios de la misma categoría'),
    ]

    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)
    titulo = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    lugar = models.CharField(max_length=255)
    organizador = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='eventos_organizados')
    requisito_pago = models.BooleanField(default=False)
    costo = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    creado = models.DateTimeField(auto_now_add=True)
    publicado = models.BooleanField(default=True)

    # Costos adicionales
    costo_hospedaje = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Costo del hospedaje (si aplica)"
    )
    costo_viaje = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Costo del viaje/transporte (si aplica)"
    )
    costo_comida = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Costo estimado de comida (si aplica)"
    )

    pago_inscripcion_a = models.ForeignKey(
        Usuario, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='eventos_pago_inscripcion' 
    )
    pago_transporte_a = models.ForeignKey(
        Usuario, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='eventos_pago_transporte' 
    )
    pago_hospedaje_a = models.ForeignKey(
        Usuario, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='eventos_pago_hospedaje' 
    )
    pago_comida_a = models.ForeignKey(
        Usuario, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='eventos_pago_comida' 
    )

    profesores_a_cargo = models.ManyToManyField(
        Usuario, blank=True,
        related_name='eventos_a_cargo' 
    )

    disciplina = models.ForeignKey(
        Disciplina, on_delete=models.SET_NULL, null=True, blank=True
    )
    categoria = models.ForeignKey(
        Categoria, on_delete=models.SET_NULL, null=True, blank=True
    )
    visibilidad = models.CharField(
        max_length=20, choices=VISIBILITY_CHOICES, default='ALL'
    )

    def __str__(self):
        return f"{self.titulo} - {self.fecha_inicio.strftime('%d/%m/%Y')}"

    class Meta:
        verbose_name = "Evento"
        verbose_name_plural = "Eventos"
        ordering = ['-fecha_inicio']


class CalendarItem(models.Model):
    usuario = models.ForeignKey(
        Usuario, on_delete=models.SET_NULL, null=True, blank=True
    )
    evento = models.ForeignKey(Evento, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    start = models.DateTimeField()
    end = models.DateTimeField()
    recordatorio_min = models.IntegerField(blank=True, null=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(recordatorio_min__gte=0) | models.Q(recordatorio_min__isnull=True), # Allow null
                name="recordatorio_no_negativo"
            )
        ]
        verbose_name = "Item de Calendario"
        verbose_name_plural = "Items de Calendario"

    def __str__(self):
        return f"{self.titulo} - {self.start.strftime('%d/%m/%Y')}"


class AsistenciaEntrenamiento(models.Model):
    usuario = models.ForeignKey(
        Usuario, on_delete=models.CASCADE, related_name="asistencias"
    )
    fecha = models.DateField()
    presente = models.BooleanField()
    registrado_por = models.ForeignKey(
        Usuario, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="asistencias_registradas"
    )
    nota = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Asistencia a Entrenamiento"
        verbose_name_plural = "Asistencias a Entrenamientos"
        ordering = ['-fecha']

    def __str__(self):
        estado = "Presente" if self.presente else "Ausente"
        user_display = str(self.usuario) if self.usuario else 'Usuario desconocido'
        return f"{user_display} - {self.fecha} ({estado})"