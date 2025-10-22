from rest_framework import viewsets

from socios.models import Rol
from socios.serializers import RolSerializer
from socios.permissions import RolePermission


class RolesViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de roles"""
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    permission_classes = [RolePermission]
    required_roles = ['admin']