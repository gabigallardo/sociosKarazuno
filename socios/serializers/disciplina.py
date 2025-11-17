from rest_framework import serializers
from socios.models import Disciplina, Categoria, Usuario, HorarioEntrenamiento

class UsuarioSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'apellido', 'email']

class DisciplinaSerializer(serializers.ModelSerializer):


    entrenadores = UsuarioSimpleSerializer(many=True, read_only=True)

    class Meta:
        model = Disciplina
        fields = '__all__'

class CategoriaSerializer(serializers.ModelSerializer):
    disciplina_nombre = serializers.CharField(
        source='disciplina.nombre',
        read_only=True
    )
    disciplina = serializers.PrimaryKeyRelatedField(
        queryset=Disciplina.objects.all()
    )

    class Meta:
        model = Categoria
        fields = [
            'id', 'disciplina', 'disciplina_nombre', 'nombre_categoria',
            'edad_minima', 'edad_maxima', 'sexo'
        ]

class HorarioEntrenamientoSerializer(serializers.ModelSerializer):
    # Campos para mostrar nombres legibles en el frontend
    disciplina_nombre = serializers.CharField(source='categoria.disciplina.nombre', read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre_categoria', read_only=True)

    class Meta:
        model = HorarioEntrenamiento
        fields = '__all__'
