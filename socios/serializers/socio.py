from rest_framework import serializers
from socios.models import SocioInfo, NivelSocio

class NivelSocioSerializer(serializers.ModelSerializer):
    class Meta:
        model = NivelSocio
        fields = '__all__'

class SocioInfoSerializer(serializers.ModelSerializer):
    # Campo anidado para mostrar info completa del nivel
    nivel_socio_info = NivelSocioSerializer(source='nivel_socio', read_only=True)
    
    class Meta:
        model = SocioInfo
        fields = [
            'usuario',
            'cuota_al_dia',
            'nivel_socio',
            'nivel_socio_info',
            'disciplina',
            'categoria',
            'estado',
            'fecha_inactivacion',
            'razon_inactivacion'
        ]
        read_only_fields = ['fecha_inactivacion']