# socios/views/cuota.py

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

# 👇 Asegúrate de importar el modelo Pago para la lógica de filtrado
from socios.models import Cuota, Pago 
from socios.serializers import CuotaSerializer
from socios.permissions import RolePermission

class CuotaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de cuotas con filtrado manual.
    Permite filtrar por:
    - /cuotas/?usuario=<id> (solo para admins/dirigentes)
    - /cuotas/?estado=pendiente
    - /cuotas/?estado=pagada
    - /cuotas/?periodo=YYYY-MM
    """
    serializer_class = CuotaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Construye el queryset dinámicamente basado en el rol del usuario
        y los parámetros de la URL.
        """
        user = self.request.user
        
        # --- PASO 1: Establecer el queryset base según el rol ---
        
        roles_de_gestion = ['admin', 'dirigente', 'profesor']
        es_gestion = user.roles.filter(nombre__in=roles_de_gestion).exists()
        
        if es_gestion:
            # El personal de gestión puede ver todo por defecto
            queryset = Cuota.objects.all()
        else:
            # Los usuarios normales solo ven lo suyo
            queryset = Cuota.objects.filter(usuario=user)

        # --- PASO 2: Aplicar filtros desde los query params de la URL ---

        # Obtener los parámetros de la URL, por ej: /api/v1/cuotas/?usuario=15&estado=pendiente
        params = self.request.query_params

        # Filtrar por usuario (solo si el que pregunta es de gestión)
        usuario_id = params.get('usuario', None)
        if es_gestion and usuario_id:
            try:
                queryset = queryset.filter(usuario_id=int(usuario_id))
            except (ValueError, TypeError):
                # Si el ID no es un número válido, no se aplica el filtro
                pass

        # Filtrar por estado de la cuota (pendiente o pagada)
        estado = params.get('estado', None)
        if estado:
            # Obtenemos los IDs de las cuotas que tienen un pago 'completado'
            pagadas_ids = Pago.objects.filter(estado='completado').values_list('cuota_id', flat=True)
            
            if estado.lower() == 'pendiente':
                # Excluimos las cuotas que ya están pagadas
                queryset = queryset.exclude(id__in=pagadas_ids)
            elif estado.lower() == 'pagada':
                # Incluimos solo las cuotas que están pagadas
                queryset = queryset.filter(id__in=pagadas_ids)

        # Filtrar por período (ej: ?periodo=2025-01)
        periodo = params.get('periodo', None)
        if periodo:
            queryset = queryset.filter(periodo=periodo)

        # --- PASO 3: Devolver el queryset final ordenado ---
        return queryset.order_by('-periodo')

    def get_permissions(self):
        """Solo admins pueden crear/modificar/eliminar cuotas"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [RolePermission]
            self.required_roles = ['admin']
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]