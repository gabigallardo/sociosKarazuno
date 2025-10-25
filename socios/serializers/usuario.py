from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from socios.models import Usuario, Rol, Disciplina

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
        write_only=True,
        required=False 
    )

    disciplinas_a_cargo = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='nombre' 
    )
    disciplinas_a_cargo_ids = serializers.PrimaryKeyRelatedField(
        queryset=Disciplina.objects.all(),
        source='disciplinas_a_cargo',
        many=True,
        write_only=True,
        required=False 
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
            'sexo', 'activo', 'foto_url', 'roles', 'roles_ids', 'qr_token',
            'disciplinas_a_cargo', 'disciplinas_a_cargo_ids'
        ]
        
    def validate_contrasena(self, value):
        """Hashea la contraseña si se proporciona."""
        if value:
            return make_password(value)
        return None 

    def create(self, validated_data):
        """Crear usuario, manejando contraseña y relaciones M2M."""
        password = validated_data.pop('contrasena', None)
        if password:
            validated_data['contrasena'] = make_password(password) 

        roles_data = validated_data.pop('roles', None)
        disciplinas_data = validated_data.pop('disciplinas_a_cargo', None) 

        usuario = Usuario.objects.create(**validated_data)

        if roles_data is not None:
            usuario.roles.set(roles_data)
        if disciplinas_data is not None:
            usuario.disciplinas_a_cargo.set(disciplinas_data)

        return usuario

    def update(self, instance, validated_data):
        """Actualizar usuario, hasheando contraseña si se proporciona y manejando M2M."""
        password = validated_data.pop('contrasena', None)
        if password:
            instance.contrasena = make_password(password)
        elif password == '': 
             pass

        roles_data = validated_data.pop('roles', None)
        disciplinas_data = validated_data.pop('disciplinas_a_cargo', None)

        instance = super().update(instance, validated_data)

        if roles_data is not None:
            instance.roles.set(roles_data)
        if disciplinas_data is not None:
            instance.disciplinas_a_cargo.set(disciplinas_data)

        instance.save() 
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    contrasena = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Usuario
        fields = (
            "tipo_documento", "nro_documento", "nombre", "apellido",
            "email", "contrasena", "telefono", "fecha_nacimiento",
            "direccion", "sexo"
        )
        extra_kwargs = {
            'email': {'required': True},
            'nombre': {'required': True},
            'apellido': {'required': True},
        }


    def create(self, validated_data):
        """Crear usuario con contraseña hasheada (sin roles/disciplinas por defecto)."""
        # Asegurar hasheo de contraseña
        validated_data['contrasena'] = make_password(validated_data['contrasena'])
        # Se crea el usuario sin roles ni disciplinas por defecto
        usuario = Usuario.objects.create(**validated_data)
        return usuario