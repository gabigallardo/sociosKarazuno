from rest_framework import serializers
from .models import Usuario, Rol

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'


class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = '__all__'


class RegisterSerializer(serializers.ModelSerializer):
    contrasena = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ("tipo_documento", "nro_documento", "nombre", "apellido", "email", "contrasena", "telefono", "fecha_nacimiento", "direccion", "sexo")

    def create(self, validated_data):
        usuario = Usuario.objects.create(
            tipo_documento=validated_data.get("tipo_documento"),
            nro_documento=validated_data.get("nro_documento"),
            nombre=validated_data.get("nombre"),
            apellido=validated_data.get("apellido"),
            email=validated_data.get("email"),
            contrasena=validated_data.get("contrasena"),  # hashear después
            telefono=validated_data.get("telefono"),
            fecha_nacimiento=validated_data.get("fecha_nacimiento"),
            direccion=validated_data.get("direccion"),
            sexo=validated_data.get("sexo"),
        )
        return usuario

# Agregar un serializador para el modelo Evento
from .models import Evento
class EventoSerializer(serializers.ModelSerializer):
    # Para lectura → devuelve objeto Usuario
    organizador = UsuarioSerializer(read_only=True)
     # Para escritura → acepta un ID
    organizador_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(), source='organizador', write_only=True
    )

    class Meta:
        model = Evento
        fields = '__all__'