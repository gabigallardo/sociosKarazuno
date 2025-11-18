from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import date, timedelta
from django.db import transaction

from socios.models import Disciplina, Categoria, HorarioEntrenamiento, SesionEntrenamiento
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
    
    @action(detail=True, methods=['post'], url_path='generar-sesiones')
    def generar_sesiones(self, request, pk=None):
        """
        Genera Sesiones de Entrenamiento para una categoría en un rango de fechas,
        basándose en sus Horarios de Entrenamiento activos. Evita duplicados.
        """
        categoria = self.get_object()
        
        # Validar las fechas de entrada
        try:
            fecha_inicio_str = request.data.get('fecha_inicio')
            fecha_fin_str = request.data.get('fecha_fin')
            fecha_inicio = date.fromisoformat(fecha_inicio_str)
            fecha_fin = date.fromisoformat(fecha_fin_str)
        except (ValueError, TypeError):
            return Response(
                {"error": "Formato de fecha inválido. Usa YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if fecha_inicio > fecha_fin:
            return Response(
                {"error": "La fecha de inicio no puede ser posterior a la fecha de fin."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Lógica de generación
        horarios_activos = HorarioEntrenamiento.objects.filter(categoria=categoria, activo=True)
        if not horarios_activos.exists():
            return Response(
                {"message": "No hay horarios activos para esta categoría. No se generaron sesiones."},
                status=status.HTTP_200_OK
            )

        sesiones_creadas_count = 0
        try:
            with transaction.atomic():
                # Itera por cada día en el rango de fechas solicitado
                for i in range((fecha_fin - fecha_inicio).days + 1):
                    dia_actual = fecha_inicio + timedelta(days=i)
                    dia_semana_actual = dia_actual.weekday() # Lunes=0, Martes=1...

                    # Busca si hay un horario definido para este día de la semana
                    for horario in horarios_activos.filter(dia_semana=dia_semana_actual):
                        # Evita duplicados: ¿ya existe una sesión para este equipo en esta fecha?
                        if not SesionEntrenamiento.objects.filter(categoria=categoria, fecha=dia_actual).exists():
                            SesionEntrenamiento.objects.create(
                                horario=horario,
                                categoria=categoria,
                                fecha=dia_actual,
                                estado='programada'
                            )
                            sesiones_creadas_count += 1
            
            return Response({
                "message": f"Proceso completado. Se generaron {sesiones_creadas_count} nuevas sesiones de entrenamiento."
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": f"Ocurrió un error inesperado: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
