from django.db import models
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from socios.models.usuario import Usuario
    from socios.models.disciplina import Categoria

class Cuota(models.Model):
    usuario = models.ForeignKey('Usuario', on_delete=models.CASCADE)
    categoria = models.ForeignKey(
        'Categoria', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    periodo = models.CharField(max_length=50)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    vencimiento = models.DateField()
    descuento_aplicado = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0.00
    )

    def __str__(self):
        return f"Cuota {self.usuario} - {self.periodo}"

    class Meta:
        verbose_name = "Cuota"
        verbose_name_plural = "Cuotas"
        ordering = ['-periodo']


class Pago(models.Model):
    ESTADO_CHOICES = [
        ("iniciado", "Iniciado"),
        ("completado", "Completado"),
        ("fallido", "Fallido"),
        ("reembolsado", "Reembolsado"),
    ]

    cuota = models.ForeignKey(Cuota, on_delete=models.CASCADE)
    medio_pago = models.CharField(max_length=50)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    moneda = models.CharField(max_length=10, default="ARS")
    referencia_externa = models.CharField(max_length=255, blank=True, null=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES)
    fecha = models.DateTimeField(auto_now_add=True)
    detalle = models.JSONField(blank=True, null=True)
    comprobante = models.CharField(max_length=255, blank=True, null=True, help_text="Referencia o número de comprobante del pago")

    def __str__(self):
        return f"Pago {self.cuota} - {self.estado}"

    class Meta:
        verbose_name = "Pago"
        verbose_name_plural = "Pagos"
        ordering = ['-fecha']
