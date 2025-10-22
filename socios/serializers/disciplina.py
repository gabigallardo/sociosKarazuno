from rest_framework import serializers
from socios.models import Disciplina, Categoria


class DisciplinaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disciplina
        fields = '__all__'


class CategoriaSerializer(serializers.ModelSerializer):
    disciplina_nombre = serializers.CharField(
        source='disciplina.nombre',
        read_only=True
    )

    class Meta:
        model = Categoria
        fields = [
            'id', 'disciplina', 'disciplina_nombre', 'nombre_categoria',
            'edad_minima', 'edad_maxima', 'sexo'
        ]