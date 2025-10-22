from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from socios.models import Cuota
from socios.serializers import CuotaSerializer
from socios.permissions import RolePermission


class CuotaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de cuotas"""
    queryset = Cuota.objects.all()
    serializer_class = CuotaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filtrar cuotas por usuario autenticado"""
        return Cuota.objects.filter(
            usuario=self.request.user
        ).order_by('-periodo')

    def get_permissions(self):
        """Solo admins pueden crear/modificar/eliminar cuotas"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [RolePermission]
            self.required_roles = ['admin']
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]