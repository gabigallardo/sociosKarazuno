from rest_framework import serializers
from socios.models import Rol

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = '__all__'