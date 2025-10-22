from datetime import timedelta
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from socios.models import Usuario, UsuarioRol, Rol, NivelSocio, SocioInfo, Cuota
from socios.serializers import UsuarioSerializer, SocioInfoSerializer
from socios.permissions import RolePermission


class UsuarioViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de usuarios"""
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    def get_permissions(self):
        if self.action in ['list', 'actualizar_perfil_deportivo', 'hacerse_socio']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [RolePermission]
            self.required_roles = ['admin']
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def hacerse_socio(self, request, pk=None):
        """Convertir un usuario en socio"""
        usuario = self.get_object()

        # Verificar si ya tiene el rol socio
        if UsuarioRol.objects.filter(usuario=usuario, rol__nombre='socio').exists():
            return Response(
                {"error": "El usuario ya es socio."},
                status=status.HTTP_400_BAD_REQUEST
            )

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
                'cuota_al_dia': False,
                'nivel_socio': nivel_inicial
            }
        )

        # Si no fue creado, actualizar los valores
        if not created:
            socio_info.cuota_al_dia = False
            socio_info.nivel_socio = nivel_inicial
            socio_info.disciplina = None
            socio_info.categoria = None
            socio_info.save()

        UsuarioRol.objects.create(usuario=usuario, rol=rol_socio)

        # Generar cuota
        monto_base = 15000.00
        descuento = nivel_inicial.descuento
        monto_final = monto_base * (1 - descuento / 100)
        periodo = timezone.now().strftime("%Y-%m")
        vencimiento = timezone.now() + timedelta(days=30)

        Cuota.objects.create(
            usuario=usuario,
            periodo=periodo,
            monto=monto_final,
            vencimiento=vencimiento.date(),
            descuento_aplicado=descuento
        )

        return Response({
            "message": "El usuario ahora es socio.",
            "socio_info": SocioInfoSerializer(socio_info).data,
            "cuota_generada": True
        }, status=status.HTTP_201_CREATED)

    @action(
        detail=False,
        methods=['put'],
        permission_classes=[IsAuthenticated],
        url_path='me/actualizar-perfil-deportivo'
    )
    def actualizar_perfil_deportivo(self, request):
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