from rest_framework import serializers
from .models import (
    Usuario, Rol, Evento, SocioInfo, NivelSocio, 
    Disciplina, Categoria, Cuota, Pago
)
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


class DisciplinaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disciplina
        fields = '__all__'

class CategoriaSerializer(serializers.ModelSerializer):
    disciplina_nombre = serializers.CharField(source='disciplina.nombre', read_only=True)

    class Meta:
        model = Categoria
        fields = ['id', 'disciplina', 'disciplina_nombre', 'nombre_categoria', 'edad_minima', 'edad_maxima', 'sexo']



class EventoSerializer(serializers.ModelSerializer):
    organizador = UsuarioSerializer(read_only=True)
    disciplina = DisciplinaSerializer(read_only=True)
    categoria = CategoriaSerializer(read_only=True)
    
    # Agregar estos campos de lectura:
    pago_inscripcion_a = UsuarioSerializer(read_only=True)
    pago_transporte_a = UsuarioSerializer(read_only=True)
    pago_hospedaje_a = UsuarioSerializer(read_only=True)
    pago_comida_a = UsuarioSerializer(read_only=True)
    profesores_a_cargo = UsuarioSerializer(many=True, read_only=True)

    organizador_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(), source='organizador', write_only=True
    )
    disciplina_id = serializers.PrimaryKeyRelatedField(
        queryset=Disciplina.objects.all(), source='disciplina', write_only=True, allow_null=True, required=False
    )
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(), source='categoria', write_only=True, allow_null=True, required=False
    )
    
    # Agregar estos campos de escritura:
    pago_inscripcion_a_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(), source='pago_inscripcion_a', write_only=True, allow_null=True, required=False
    )
    pago_transporte_a_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(), source='pago_transporte_a', write_only=True, allow_null=True, required=False
    )
    pago_hospedaje_a_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(), source='pago_hospedaje_a', write_only=True, allow_null=True, required=False
    )
    pago_comida_a_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(), source='pago_comida_a', write_only=True, allow_null=True, required=False
    )
    profesores_a_cargo_ids = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(), source='profesores_a_cargo', many=True, write_only=True, required=False
    )

    class Meta:
        model = Evento
        fields = [
            'id', 'tipo', 'titulo', 'descripcion', 'fecha_inicio', 'fecha_fin', 
            'lugar', 'organizador', 'requisito_pago', 'costo', 'creado', 'publicado',
            'disciplina', 'categoria', 'visibilidad', 
            'organizador_id', 'disciplina_id', 'categoria_id',
            'costo_hospedaje', 'costo_viaje', 'costo_comida',
            'pago_inscripcion_a', 'pago_transporte_a', 'pago_hospedaje_a', 'pago_comida_a',
            'pago_inscripcion_a_id', 'pago_transporte_a_id', 'pago_hospedaje_a_id', 'pago_comida_a_id',
            'profesores_a_cargo', 'profesores_a_cargo_ids'
        ]



class SocioInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocioInfo
        fields = '__all__'


class NivelSocioSerializer(serializers.ModelSerializer):
    class Meta:
        model = NivelSocio
        fields = '__all__'

class CuotaSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.nombre', read_only=True)
    usuario_apellido = serializers.CharField(source='usuario.apellido', read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre_categoria', read_only=True)
    pagada = serializers.SerializerMethodField()
    
    class Meta:
        model = Cuota
        fields = ['id', 'usuario', 'usuario_nombre', 'usuario_apellido', 'categoria', 
                  'categoria_nombre', 'periodo', 'monto', 'vencimiento', 'descuento_aplicado', 'pagada']
    
    def get_pagada(self, obj):
        # Verificar si existe un pago completado para esta cuota
        return Pago.objects.filter(cuota=obj, estado='completado').exists()

