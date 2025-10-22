from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from socios.models import Usuario, Rol

class UsuarioSerializer(serializers.ModelSerializer):
    roles = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='nombre'
    )
    roles_ids = serializers.PrimaryKeyRelatedField(
        queryset=Rol.objects.all(),
        source='roles',
        many=True,
        write_only=True
    )
    contrasena = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    class Meta:
        model = Usuario
        fields = [
            'id', 'tipo_documento', 'nro_documento', 'nombre', 'apellido',
            'email', 'contrasena', 'telefono', 'fecha_nacimiento', 'direccion',
            'sexo', 'activo', 'foto_url', 'roles', 'roles_ids', 'qr_token'
        ]

    def update(self, instance, validated_data):
        """Actualizar usuario, hasheando la contraseña si se proporciona"""
        if 'contrasena' in validated_data and validated_data['contrasena']:
            validated_data['contrasena'] = make_password(validated_data['contrasena'])
        else:
            validated_data.pop('contrasena', None)
        return super().update(instance, validated_data)


class RegisterSerializer(serializers.ModelSerializer):
    contrasena = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = (
            "tipo_documento", "nro_documento", "nombre", "apellido",
            "email", "contrasena", "telefono", "fecha_nacimiento",
            "direccion", "sexo"
        )

    def create(self, validated_data):
        """Crear usuario con contraseña hasheada"""
        validated_data['contrasena'] = make_password(validated_data['contrasena'])
        usuario = Usuario.objects.create(**validated_data)
        return usuario