from rest_framework import serializers
from socios.models import Disciplina, Categoria, Usuario

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