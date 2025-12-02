from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from socios.models import Usuario, Rol, Disciplina, Categoria
from .socio import SocioInfoSerializer

class UsuarioSerializer(serializers.ModelSerializer):
    # --- Roles ---
    roles = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field='nombre'
    )
    roles_ids = serializers.PrimaryKeyRelatedField(
        queryset=Rol.objects.all(), source='roles', many=True, required=False
    )

    # --- Disciplinas a Cargo ---
    disciplinas_a_cargo = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field='nombre'
    )
    disciplinas_a_cargo_ids = serializers.PrimaryKeyRelatedField(
        queryset=Disciplina.objects.all(), source='disciplinas_a_cargo', many=True, required=False
    )

    # --- Categorías a Cargo ---
    categorias_a_cargo = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field='nombre_categoria'
    )
    categorias_a_cargo_ids = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(), source='categorias_a_cargo', many=True, required=False
    )

    contrasena = serializers.CharField(
        write_only=True,
        required=False, # No es requerida al actualizar
        allow_blank=True # Permite que se envíe una cadena vacía
    )

    socioinfo = SocioInfoSerializer(read_only=True, allow_null=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'tipo_documento', 'nro_documento', 'nombre', 'apellido',
            'email', 'contrasena', 'telefono', 'fecha_nacimiento', 'direccion',
            'sexo', 'activo', 'foto_url', 'roles', 'roles_ids', 'qr_token',
            'disciplinas_a_cargo', 'disciplinas_a_cargo_ids', 'categorias_a_cargo',
              'categorias_a_cargo_ids', 'socioinfo', 'preferencias_gui'
        ]

    def create(self, validated_data):
        """
        Crear usuario, hasheando la contraseña y manejando relaciones M2M.
        """
        roles_data = validated_data.pop('roles', [])
        disciplinas_data = validated_data.pop('disciplinas_a_cargo', [])
        categorias_data = validated_data.pop('categorias_a_cargo', [])
        
        # Hasheamos la contraseña antes de crear el usuario
        validated_data['contrasena'] = make_password(validated_data.get('contrasena'))
        
        usuario = Usuario.objects.create(**validated_data)

        if roles_data:
            usuario.roles.set(roles_data)
        if disciplinas_data:
            usuario.disciplinas_a_cargo.set(disciplinas_data)
        if categorias_data:
            usuario.categorias_a_cargo.set(categorias_data)

        return usuario

    def update(self, instance, validated_data):
        """
        Actualizar usuario, hasheando contraseña SOLO si se proporciona una nueva,
        y manejando correctamente las relaciones M2M.
        """
        password = validated_data.pop('contrasena', None)

        if password: # Solo hashea si se proveyó una nueva contraseña
            instance.contrasena = make_password(password)
        
        roles_data = validated_data.pop('roles', None)
        disciplinas_data = validated_data.pop('disciplinas_a_cargo', None)
        categorias_data = validated_data.pop('categorias_a_cargo', None)

        instance = super().update(instance, validated_data)

        if roles_data is not None:
            instance.roles.set(roles_data)
        if disciplinas_data is not None:
            instance.disciplinas_a_cargo.set(disciplinas_data)
        if categorias_data is not None:
            instance.categorias_a_cargo.set(categorias_data)

        instance.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    contrasena = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Usuario
        fields = (
            "nombre", "apellido", "email", "contrasena"
        )
        extra_kwargs = {
            'email': {'required': True},
            'nombre': {'required': True},
            'apellido': {'required': True},
        }

    def create(self, validated_data):
        """Crear usuario con contraseña hasheada (sin roles/disciplinas por defecto)."""
        validated_data['contrasena'] = make_password(validated_data['contrasena'])
        usuario = Usuario.objects.create(**validated_data)
        return usuario