from rest_framework import serializers
from ..models.registro_acceso import RegistroAcceso

class RegistroAccesoSerializer(serializers.ModelSerializer):
    nombre_usuario = serializers.SerializerMethodField()

    class Meta:
        model = RegistroAcceso
        fields = ['id', 'fecha_hora', 'estado', 'motivo', 'nombre_usuario', 'datos_ingresados']

    def get_nombre_usuario(self, obj):
        if obj.usuario:
            return f"{obj.usuario.nombre} {obj.usuario.apellido}"
        return "Desconocido"