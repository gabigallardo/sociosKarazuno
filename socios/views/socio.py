from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny

from socios.models import SocioInfo, NivelSocio
from socios.serializers import SocioInfoSerializer, NivelSocioSerializer


class SocioInfoViewSet(viewsets.ModelViewSet):
    """ViewSet para información de socios"""
    queryset = SocioInfo.objects.all()
    serializer_class = SocioInfoSerializer
    permission_classes = [IsAuthenticated]


class NivelSocioViewSet(viewsets.ModelViewSet):
    """ViewSet para niveles de socio"""
    queryset = NivelSocio.objects.all()
    serializer_class = NivelSocioSerializer
    permission_classes = [AllowAny]