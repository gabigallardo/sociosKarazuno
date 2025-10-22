from rest_framework import serializers
from socios.models import SocioInfo, NivelSocio

class NivelSocioSerializer(serializers.ModelSerializer):
    class Meta:
        model = NivelSocio
        fields = '__all__'

class SocioInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocioInfo
        fields = '__all__'