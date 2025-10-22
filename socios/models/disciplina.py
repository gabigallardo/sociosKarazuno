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
