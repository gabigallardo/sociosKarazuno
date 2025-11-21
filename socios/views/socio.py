from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny

from socios.models import SocioInfo, NivelSocio
from socios.serializers import SocioInfoSerializer, NivelSocioSerializer
from socios.permissions import RolePermission


class SocioInfoViewSet(viewsets.ModelViewSet):
    """ViewSet para información de socios"""
    queryset = SocioInfo.objects.all()
    serializer_class = SocioInfoSerializer
    required_roles = ['admin', 'profesor', 'dirigente']

    def get_permissions(self):
        """
        Configuración dinámica de permisos:
        - 'create' (POST): Permitido para cualquier usuario autenticado (para que puedan hacerse socios).
        - Otras acciones (GET, PUT, DELETE): Solo permitidas para roles específicos (admin, profe, dirigente).
        """
        if self.action == 'create':
            return [IsAuthenticated()]
        else:
            return [RolePermission()]

    def get_queryset(self):
        """
        Optimizar queries y permitir filtrado por disciplina y categoría.
        Ej: /socios/?disciplina=1&categoria=5
        """
        # El queryset base ya tiene la optimización de select_related
        queryset = SocioInfo.objects.select_related(
            'usuario', 'nivel_socio', 'disciplina', 'categoria'
        ).all()

        # Obtenemos los parámetros de la URL
        disciplina_id = self.request.query_params.get('disciplina', None)
        categoria_id = self.request.query_params.get('categoria', None)

        # Aplicamos los filtros si existen
        if disciplina_id:
            queryset = queryset.filter(disciplina_id=disciplina_id)
        
        if categoria_id:
            queryset = queryset.filter(categoria_id=categoria_id)

        return queryset

class NivelSocioViewSet(viewsets.ModelViewSet):
    """ViewSet para niveles de socio"""
    queryset = NivelSocio.objects.all()
    serializer_class = NivelSocioSerializer
    permission_classes = [AllowAny]