from django.db import models
from .usuario import Usuario

class RegistroAcceso(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20) 
    motivo = models.CharField(max_length=100, null=True, blank=True)
    datos_ingresados = models.CharField(max_length=100) 

    def __str__(self):
        return f"{self.fecha_hora} - {self.estado}"