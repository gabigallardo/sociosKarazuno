from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import date, timedelta
from django.db import transaction
from django.db.models import Q

from socios.models import Disciplina, Categoria, HorarioEntrenamiento, SesionEntrenamiento, AsistenciaEntrenamiento, SocioInfo
from socios.serializers import DisciplinaSerializer, CategoriaSerializer, HorarioEntrenamientoSerializer, SesionEntrenamientoSerializer, AsistenciaEntrenamientoSerializer
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
    
class SesionEntrenamientoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar las sesiones de entrenamiento (instancias concretas).
    """
    queryset = SesionEntrenamiento.objects.select_related('horario', 'categoria').all()
    serializer_class = SesionEntrenamientoSerializer
    permission_classes = [RolePermission]
    required_roles = ['admin', 'dirigente', 'profesor']

    def get_queryset(self):
        """
        Filtra las sesiones.
        """
        queryset = super().get_queryset()
        categoria_id = self.request.query_params.get('categoria', None)

        # Si hay filtro de categoría, lo aplicamos siempre
        if categoria_id:
            queryset = queryset.filter(categoria_id=categoria_id)

        # Solo devolvemos 'none' si estamos LISTANDO (action='list') y no hay filtro.
        # Para acciones de detalle (retrieve, hoja_asistencia, etc.), permitimos buscar en todo.
        if self.action == 'list' and not categoria_id:
            return queryset.none()

        return queryset.order_by('fecha')
    
    @action(detail=True, methods=['get'], url_path='hoja-asistencia')
    def hoja_asistencia(self, request, pk=None):
        sesion = self.get_object()
        categoria = sesion.categoria

        # 1. Traer todos los socios activos
        socios_categoria = SocioInfo.objects.filter(
            categoria=categoria, 
            estado='activo'
        ).select_related('usuario')

        # 2. Traer asistencias YA registradas
        asistencias_existentes = AsistenciaEntrenamiento.objects.filter(sesion=sesion)
        
        # Usamos ENTEROS para el mapa (más seguro y rápido)
        mapa_asistencias = {a.usuario_id: a for a in asistencias_existentes}
        
        # DEBUG
        # print(f"DEBUG: IDs (int) en mapa: {list(mapa_asistencias.keys())}")

        data = []
        for socio_info in socios_categoria:
            # ID como entero
            user_id = socio_info.pk 
            
            asistencia = mapa_asistencias.get(user_id)
            
            estado_final = asistencia.estado if asistencia else 'ausente'
            
            # DEBUG: Ver qué estado tiene realmente el objeto si existe
            # if asistencia:
            #     print(f" - Socio {user_id} encontrado. Estado en DB: '{asistencia.estado}'")

            data.append({
                "usuario_id": user_id,
                "nombre_completo": f"{socio_info.usuario.nombre} {socio_info.usuario.apellido}",
                "foto_url": socio_info.usuario.foto_url,
                "estado": estado_final,
                "nota": asistencia.nota if asistencia else ""
            })
        
        data.sort(key=lambda x: x['nombre_completo'])
        return Response(data)

    @action(detail=True, methods=['post'], url_path='registrar-asistencia')
    def registrar_asistencia(self, request, pk=None):
        sesion = self.get_object()
        datos_asistencias = request.data.get('asistencias', [])
        registrador = request.user

        print(f"DEBUG: Recibidos {len(datos_asistencias)} registros para guardar.")

        try:
            with transaction.atomic():
                for item in datos_asistencias:
                    usuario_id = item.get('usuario_id')
                    nuevo_estado = item.get('estado')
                    nota = item.get('nota', '')

                    # DEBUG: Ver qué estamos a punto de guardar
                    # print(f" -> Guardando ID {usuario_id}: Estado '{nuevo_estado}'")

                    AsistenciaEntrenamiento.objects.update_or_create(
                        sesion=sesion,
                        usuario_id=usuario_id,
                        defaults={
                            'estado': nuevo_estado,
                            'registrado_por': registrador,
                            'nota': nota,
                        }
                    )

            return Response({"message": "Asistencia guardada."}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"ERROR CRÍTICO al guardar: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    @action(detail=False, methods=['get'], url_path='mis-sesiones', permission_classes=[IsAuthenticated])
    def mis_sesiones(self, request):
        """
        Devuelve las sesiones de entrenamiento relevantes para el usuario actual:
        - Si es Socio: Las sesiones de su categoría asignada.
        - Si es Profesor: Las sesiones de todas las categorías que tiene a cargo.
        """
        user = request.user
        queryset = self.get_queryset() # Empieza con el queryset base

        # 1. Lógica para Profesores
        categorias_profesor_ids = []
        if hasattr(user, 'categorias_a_cargo'):
             categorias_profesor_ids = user.categorias_a_cargo.values_list('id', flat=True)
        
        # 2. Lógica para Socios
        categoria_socio_id = None
        try:
            if hasattr(user, 'socioinfo') and user.socioinfo.categoria:
                categoria_socio_id = user.socioinfo.categoria.id
        except SocioInfo.DoesNotExist:
            pass

        # 3. Filtrar
        # Si es admin/dirigente ve todo (opcional, aquí restringimos para no saturar el calendario)
        # Aquí combinamos: O es mi categoría de socio, O es una de mis categorías de profe
        filtro = Q(pk__isnull=True) # Filtro base vacío (falso)
        
        if categoria_socio_id:
            filtro = filtro | Q(categoria_id=categoria_socio_id)
        
        if categorias_profesor_ids:
            filtro = filtro | Q(categoria_id__in=categorias_profesor_ids)

        # Si no tiene categoría ni es profe, devolvemos lista vacía
        if not categoria_socio_id and not categorias_profesor_ids:
             return Response([])

        sesiones = SesionEntrenamiento.objects.filter(filtro).select_related('horario', 'categoria', 'categoria__disciplina')
        
        serializer = self.get_serializer(sesiones, many=True)
        return Response(serializer.data)