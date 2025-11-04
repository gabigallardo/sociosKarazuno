# socios/views/usuario.py

from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from socios.models import Usuario, UsuarioRol, Rol, NivelSocio, SocioInfo, Cuota, Pago
from socios.serializers import UsuarioSerializer, SocioInfoSerializer, CuotaSerializer
from socios.permissions import RolePermission


class UsuarioViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de usuarios"""
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    def get_permissions(self):
        # 👇 SOLUCIÓN DEL CONFLICTO 1: Usamos la lista que incluye 'me'
        if self.action in ['list', 'actualizar_perfil_deportivo', 'hacerse_socio', 'me']:
            permission_classes = [IsAuthenticated]
        elif self.action in ['inactivar_socio', 'activar_socio']:
            permission_classes = [RolePermission]
            self.required_roles = ['admin', 'dirigente', 'profesor']
        else:
            permission_classes = [RolePermission]
            self.required_roles = ['admin']
        return [permission() for permission in permission_classes]

    # ... (Todo el código del otro programador se mantiene intacto aquí) ...
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def hacerse_socio(self, request, pk=None):
        # ... (código sin cambios)
        """Convertir un usuario en socio o reactivar socio inactivo SIN generar cuota."""
        usuario = self.get_object()

        # Verificar si ya tiene el rol socio
        if UsuarioRol.objects.filter(usuario=usuario, rol__nombre='socio').exists():
            try:
                socio_info = usuario.socioinfo
                if socio_info.estado == 'inactivo':
                    # Verificar si tiene cuotas sin pagar para bloquear la reactivación
                    cuotas_pendientes = Cuota.objects.filter(usuario=usuario).exclude(
                        id__in=Pago.objects.filter(estado='completado').values_list('cuota_id', flat=True)
                    )
                    
                    if cuotas_pendientes.exists():
                        deuda_total = sum(c.monto for c in cuotas_pendientes)
                        # Serializamos las cuotas pendientes para incluirlas en la respuesta
                        serializer = CuotaSerializer(cuotas_pendientes, many=True)
                        
                        return Response({
                            "error": "No puedes reactivarte como socio. Tienes cuotas pendientes de pago.",
                            "deuda_total": float(deuda_total),
                            "cuotas_pendientes": serializer.data 
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Si no hay deuda, simplemente reactivar
                    socio_info.estado = 'activo'
                    socio_info.fecha_inactivacion = None
                    socio_info.razon_inactivacion = None
                    socio_info.save()
                                        
                    return Response({
                        "message": "Socio reactivado exitosamente.",
                        "socio_info": SocioInfoSerializer(socio_info).data,
                    }, status=status.HTTP_200_OK)
                else:
                    return Response(
                        {"error": "El usuario ya es socio activo."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except SocioInfo.DoesNotExist:
                pass # Continuar para crearlo si no existe

        try:
            rol_socio = Rol.objects.get(nombre='socio')
            nivel_inicial = NivelSocio.objects.get(nivel=1)
        except (Rol.DoesNotExist, NivelSocio.DoesNotExist):
            return Response(
                {"error": "Configuración inicial de roles o niveles no encontrada."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Obtener o crear SocioInfo
        socio_info, created = SocioInfo.objects.get_or_create(
            usuario=usuario,
            defaults={
                'nivel_socio': nivel_inicial,
                'estado': 'activo'
            }
        )

        if not created:
            socio_info.nivel_socio = nivel_inicial
            socio_info.disciplina = None
            socio_info.categoria = None
            socio_info.estado = 'activo'
            socio_info.fecha_inactivacion = None
            socio_info.razon_inactivacion = None
            socio_info.save()

        UsuarioRol.objects.create(usuario=usuario, rol=rol_socio)

        return Response({
            "message": "El usuario ahora es socio.",
            "socio_info": SocioInfoSerializer(socio_info).data,
        }, status=status.HTTP_201_CREATED)


    @action(detail=True, methods=['post'], permission_classes=[RolePermission], url_path='inactivar-socio')
    def inactivar_socio(self, request, pk=None):
        # ... (código sin cambios)
        """
        Endpoint para inactivar un socio por falta de pago o baja voluntaria.
        Solo accesible por admin/dirigente.
        """
        usuario = self.get_object()
        
        try:
            socio_info = usuario.socioinfo
        except SocioInfo.DoesNotExist:
            return Response(
                {"error": "El usuario no es un socio."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if socio_info.estado == 'inactivo':
            return Response(
                {"error": "El socio ya está inactivo."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        razon = request.data.get('razon', 'Falta de pago')
        
        socio_info.estado = 'inactivo'
        socio_info.fecha_inactivacion = timezone.now()
        socio_info.razon_inactivacion = razon
        socio_info.save()
        
        return Response({
            "message": "Socio inactivado exitosamente.",
            "socio_info": SocioInfoSerializer(socio_info).data
        }, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=['put'],
        permission_classes=[IsAuthenticated],
        url_path='me/actualizar-perfil-deportivo'
    )
    def actualizar_perfil_deportivo(self, request):
        # ... (código sin cambios)
        """Actualizar disciplina y categoría del socio autenticado"""
        usuario = request.user

        try:
            socio_info = usuario.socioinfo
        except SocioInfo.DoesNotExist:
            return Response(
                {"error": "El usuario no es un socio activo."},
                status=status.HTTP_400_BAD_REQUEST
            )

        disciplina_id = request.data.get('disciplina_id')
        categoria_id = request.data.get('categoria_id')

        socio_info.disciplina_id = disciplina_id
        socio_info.categoria_id = categoria_id
        socio_info.save()

        return Response(
            SocioInfoSerializer(socio_info).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], permission_classes=[RolePermission], url_path='activar-socio')
    def activar_socio(self, request, pk=None):
        # ... (código sin cambios)
        """
        Endpoint para activar un socio inactivo.
        Responsabilidades:
        ✅ Registrar pagos de cuotas pendientes
        ✅ Cambiar estado a activo
        """
        usuario = self.get_object()
        try:
            socio_info = usuario.socioinfo
        except SocioInfo.DoesNotExist:
            return Response({"error": "El usuario no es un socio."}, status=status.HTTP_400_BAD_REQUEST)
        
        if socio_info.estado == 'activo':
            return Response({"error": "El socio ya está activo."}, status=status.HTTP_400_BAD_REQUEST)
        
        medio_pago = request.data.get('medio_pago')
        if not medio_pago:
            return Response({"error": "Debe especificar el medio de pago."}, status=status.HTTP_400_BAD_REQUEST)
        
        comprobante = request.data.get('comprobante')
        
        try:
            with transaction.atomic():
                cuotas_pendientes = Cuota.objects.filter(usuario=usuario).exclude(
                    id__in=Pago.objects.filter(estado='completado').values_list('cuota_id', flat=True)
                )
                pagos_creados = []
                if cuotas_pendientes.exists():
                    for cuota in cuotas_pendientes:
                        pago = Pago.objects.create(
                            cuota=cuota, monto=cuota.monto, estado='completado',
                            medio_pago=medio_pago, comprobante=comprobante, fecha=timezone.now()
                        )
                        pagos_creados.append(pago)
                
                socio_info.estado = 'activo'
                socio_info.fecha_inactivacion = None
                socio_info.razon_inactivacion = None
                socio_info.save()
            
            return Response({
                "message": "Socio activado exitosamente.",
                "pagos_registrados": len(pagos_creados),
                "deuda_cancelada": len(pagos_creados) > 0,
                "socio_info": SocioInfoSerializer(socio_info).data,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Error al procesar activación: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # 👇 SOLUCIÓN DEL CONFLICTO 2: Mantenemos tu nuevo método 'me'
    @action(
        detail=False, 
        methods=['get'], 
        permission_classes=[IsAuthenticated], 
        url_path='me'
    )
    def me(self, request):
        """
        Devuelve los datos completos del usuario autenticado.
        Este es el endpoint ideal para que el frontend refresque la información del usuario
        y no tenga que usar el endpoint de login.
        """
        usuario = request.user
        serializer = self.get_serializer(usuario)
        return Response(serializer.data, status=status.HTTP_200_OK)
    