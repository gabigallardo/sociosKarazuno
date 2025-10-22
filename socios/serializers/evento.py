from rest_framework import serializers
from socios.models import Evento, Usuario, Disciplina, Categoria
from .usuario import UsuarioSerializer
from .disciplina import DisciplinaSerializer, CategoriaSerializer


class EventoSerializer(serializers.ModelSerializer):
    # Campos de lectura (nested serializers)
    organizador = UsuarioSerializer(read_only=True)
    disciplina = DisciplinaSerializer(read_only=True)
    categoria = CategoriaSerializer(read_only=True)
    pago_inscripcion_a = UsuarioSerializer(read_only=True)
    pago_transporte_a = UsuarioSerializer(read_only=True)
    pago_hospedaje_a = UsuarioSerializer(read_only=True)
    pago_comida_a = UsuarioSerializer(read_only=True)
    profesores_a_cargo = UsuarioSerializer(many=True, read_only=True)

    # Campos de escritura (IDs)
    organizador_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        source='organizador',
        write_only=True
    )
    disciplina_id = serializers.PrimaryKeyRelatedField(
        queryset=Disciplina.objects.all(),
        source='disciplina',
        write_only=True,
        allow_null=True,
        required=False
    )
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(),
        source='categoria',
        write_only=True,
        allow_null=True,
        required=False
    )
    pago_inscripcion_a_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        source='pago_inscripcion_a',
        write_only=True,
        allow_null=True,
        required=False
    )
    pago_transporte_a_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        source='pago_transporte_a',
        write_only=True,
        allow_null=True,
        required=False
    )
    pago_hospedaje_a_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        source='pago_hospedaje_a',
        write_only=True,
        allow_null=True,
        required=False
    )
    pago_comida_a_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        source='pago_comida_a',
        write_only=True,
        allow_null=True,
        required=False
    )
    profesores_a_cargo_ids = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        source='profesores_a_cargo',
        many=True,
        write_only=True,
        required=False
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