from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny

from socios.models import SocioInfo, NivelSocio
from socios.serializers import SocioInfoSerializer, NivelSocioSerializer
from socios.permissions import RolePermission


class SocioInfoViewSet(viewsets.ModelViewSet):
    """ViewSet para información de socios"""
    queryset = SocioInfo.objects.all()
    serializer_class = SocioInfoSerializer
    permission_classes = [RolePermission]
    required_roles = ['admin', 'profesor', 'dirigente']

    def get_queryset(self):
        """Optimizar queries con select_related"""
        return SocioInfo.objects.select_related(
            'usuario',
            'nivel_socio',
            'disciplina',
            'categoria'
        ).all()

class NivelSocioViewSet(viewsets.ModelViewSet):
    """ViewSet para niveles de socio"""
    queryset = NivelSocio.objects.all()
    serializer_class = NivelSocioSerializer
    permission_classes = [AllowAny]