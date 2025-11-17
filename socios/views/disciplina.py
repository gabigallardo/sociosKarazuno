from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from socios.models import Disciplina, Categoria, HorarioEntrenamiento
from socios.serializers import DisciplinaSerializer, CategoriaSerializer, HorarioEntrenamientoSerializer
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
    
class HorarioEntrenamientoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar los horarios de entrenamiento recurrentes de las categorías.
    """
    queryset = HorarioEntrenamiento.objects.select_related('categoria', 'categoria__disciplina').all()
    serializer_class = HorarioEntrenamientoSerializer
    permission_classes = [RolePermission]
    required_roles = ['admin', 'dirigente', 'profesor']

    def get_queryset(self):
        """
        Filtra los horarios por categoría si se provee el parámetro en la URL.
        Ej: /api/v1/horarios/?categoria=5
        """
        queryset = super().get_queryset()
        categoria_id = self.request.query_params.get('categoria', None)
        if categoria_id:
            return queryset.filter(categoria_id=categoria_id)
        return queryset
