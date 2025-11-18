from django.db import models
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from socios.models.usuario import Usuario


class Disciplina(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Disciplina"
        verbose_name_plural = "Disciplinas"
        ordering = ['nombre']


class Categoria(models.Model):
    SEXO_CHOICES = [
        ("masculino", "Masculino"),
        ("femenino", "Femenino"),
        ("mixto", "Mixto"),
    ]

    disciplina = models.ForeignKey(Disciplina, on_delete=models.CASCADE)
    nombre_categoria = models.CharField(max_length=100)
    edad_minima = models.IntegerField()
    edad_maxima = models.IntegerField()
    sexo = models.CharField(max_length=20, choices=SEXO_CHOICES)

    def __str__(self):
        return f"{self.nombre_categoria} - {self.disciplina.nombre}"

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ['disciplina', 'edad_minima']

class HorarioEntrenamiento(models.Model):
    """
    Define un horario RECURRENTE para una categoría.
    Ej: "Sub-15 entrena todos los martes de 18:00 a 20:00 en la Cancha 2".
    """
    DIA_SEMANA_CHOICES = [
        (0, "Lunes"),
        (1, "Martes"),
        (2, "Miércoles"),
        (3, "Jueves"),
        (4, "Viernes"),
        (5, "Sábado"),
        (6, "Domingo"),
    ]

    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name="horarios")
    dia_semana = models.IntegerField(choices=DIA_SEMANA_CHOICES)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    lugar = models.CharField(max_length=255, help_text="Ej: Cancha 2, Gimnasio Principal")
    activo = models.BooleanField(default=True, help_text="Desmarcar si el horario ya no es vigente")

    class Meta:
        verbose_name = "Horario de Entrenamiento"
        verbose_name_plural = "Horarios de Entrenamiento"
        ordering = ['categoria', 'dia_semana', 'hora_inicio']

    def __str__(self):
        return f"{self.categoria} - {self.get_dia_semana_display()} a las {self.hora_inicio.strftime('%H:%M')}"
    
class SesionEntrenamiento(models.Model):
    """
    Representa UNA instancia específica de un entrenamiento en una fecha concreta.
    Ej: "La sesión del martes 19/11/2025 para la Sub-15".
    """
    ESTADO_CHOICES = [
        ('programada', 'Programada'),
        ('completada', 'Completada'),
        ('cancelada', 'Cancelada'),
    ]

    horario = models.ForeignKey(HorarioEntrenamiento, on_delete=models.SET_NULL, null=True, blank=True, related_name="sesiones")
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name="sesiones") # Mantenemos la categoría por si el horario se borra
    fecha = models.DateField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='programada')
    notas = models.TextField(blank=True, null=True, help_text="Notas para esta sesión específica (ej: 'Entrenamiento bajo lluvia')")

    class Meta:
        verbose_name = "Sesión de Entrenamiento"
        verbose_name_plural = "Sesiones de Entrenamiento"
        unique_together = ('categoria', 'fecha') # No puede haber dos sesiones para el mismo equipo el mismo día
        ordering = ['-fecha']

    def __str__(self):
        return f"Sesión de {self.categoria} - {self.fecha.strftime('%d/%m/%Y')}"

class CategoriaEntrenador(models.Model):
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    entrenador = models.ForeignKey('Usuario', on_delete=models.CASCADE)
    es_principal = models.BooleanField(default=False)

    class Meta:
        unique_together = ("categoria", "entrenador")
        verbose_name = "Entrenador de Categoría"
        verbose_name_plural = "Entrenadores de Categorías"

    def __str__(self):
        principal = " (Principal)" if self.es_principal else ""
        return f"{self.entrenador} - {self.categoria}{principal}"
