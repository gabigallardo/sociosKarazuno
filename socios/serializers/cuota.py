from rest_framework import serializers
from socios.models import Cuota, Pago


class CuotaSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(
        source='usuario.nombre',
        read_only=True
    )
    usuario_apellido = serializers.CharField(
        source='usuario.apellido',
        read_only=True
    )
    categoria_nombre = serializers.CharField(
        source='categoria.nombre_categoria',
        read_only=True
    )
    pagada = serializers.SerializerMethodField()

    class Meta:
        model = Cuota
        fields = [
            'id', 'usuario', 'usuario_nombre', 'usuario_apellido',
            'categoria', 'categoria_nombre', 'periodo', 'monto',
            'vencimiento', 'descuento_aplicado', 'pagada'
        ]

    def get_pagada(self, obj):
        """Verificar si existe un pago completado para esta cuota"""
        return Pago.objects.filter(cuota=obj, estado='completado').exists()