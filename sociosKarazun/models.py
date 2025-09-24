from django.db import models

class Socio(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    fecha_nacimiento = models.DateField()
    esta_activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} {self.apellido}"