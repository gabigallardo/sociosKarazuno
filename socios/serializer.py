
from rest_framework import serializers
from .models import Usuario, Rol, Evento, SocioInfo, NivelSocio
from django.contrib.auth.hashers import make_password

class UsuarioSerializer(serializers.ModelSerializer):
    roles = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='nombre'
    )
    roles_ids = serializers.PrimaryKeyRelatedField(
        queryset=Rol.objects.all(), source='roles', many=True, write_only=True
    )

    contrasena = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'tipo_documento', 'nro_documento', 'nombre', 'apellido',
            'email', 'contrasena', 'telefono', 'fecha_nacimiento', 'direccion',
            'sexo', 'activo', 'foto_url', 'roles', 'roles_ids', 'qr_token'
        ]

    def update(self, instance, validated_data):
        if 'contrasena' in validated_data and validated_data['contrasena']:
            validated_data['contrasena'] = make_password(validated_data['contrasena'])
        else:
            validated_data.pop('contrasena', None)

        return super().update(instance, validated_data)


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
        validated_data['contrasena'] = make_password(validated_data['contrasena'])
        
        usuario = Usuario.objects.create(**validated_data)
        return usuario

class EventoSerializer(serializers.ModelSerializer):
    organizador = UsuarioSerializer(read_only=True)
    organizador_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(), source='organizador', write_only=True
    )

    class Meta:
        model = Evento
        fields = '__all__'

class SocioInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocioInfo
        fields = '__all__'

class NivelSocioSerializer(serializers.ModelSerializer):
    class Meta:
        model = NivelSocio
        fields = '__all__'