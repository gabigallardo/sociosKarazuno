from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from socios.models import Disciplina, Categoria
from socios.serializers import DisciplinaSerializer, CategoriaSerializer
from socios.permissions import RolePermission


class DisciplinaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de disciplinas"""
    queryset = Disciplina.objects.all()
    serializer_class = DisciplinaSerializer

    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [RolePermission]
            self.required_roles = ['admin', 'dirigente', 'profesor']
        return [permission() for permission in permission_classes]


class CategoriaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de categorías"""
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [RolePermission]
            self.required_roles = ['admin', 'dirigente', 'profesor']
        return [permission() for permission in permission_classes]