from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from ..models.socio import SocioInfo
from ..models.usuario import Usuario
from ..models.cuota import Cuota

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validar_acceso(request):
    try:
        qr_data = request.data.get('qr_data')

        if not qr_data:
            return Response({'error': 'Código vacío'}, status=status.HTTP_400_BAD_REQUEST)

        # Reemplazamos apóstrofes (') por guiones (-) por si hay error de teclado ES/US
        qr_data_limpio = qr_data.replace("'", "-").replace('"', '-').strip()

        usuario = None

        # 1. Búsqueda del usuario (QR Token, DNI o ID)
        try:
            usuario = Usuario.objects.get(qr_token=qr_data_limpio)
        except (Usuario.DoesNotExist, ValueError):
            try:
                usuario = Usuario.objects.get(nro_documento=qr_data_limpio)
            except Usuario.DoesNotExist:
                if str(qr_data_limpio).isdigit():
                    try:
                        usuario = Usuario.objects.get(id=qr_data_limpio)
                    except Usuario.DoesNotExist:
                        pass

        if not usuario:
            return Response({
                'estado': 'denegado',
                'mensaje': f'Usuario NO ENCONTRADO (Leído: {qr_data_limpio})',
                'color': 'bg-gray-800'
            })

        nombre_completo = f"{usuario.nombre} {usuario.apellido}"

        # 2. Verificar si es Socio
        try:
            socio_info = usuario.socioinfo
        except SocioInfo.DoesNotExist:
            return Response({
                'estado': 'denegado',
                'mensaje': 'NO ES SOCIO',
                'socio': nombre_completo,
                'motivo': 'no_socio'
            })

        # 3. Verificar si está Activo
        if socio_info.estado != 'activo':
            return Response({
                'estado': 'denegado',
                'mensaje': f'Socio {socio_info.get_estado_display().upper()}',
                'socio': nombre_completo,
                'motivo': 'inactivo'
            })

        # 4. Verificar Cuotas Vencidas
        hoy = timezone.now().date()
        
        cuotas_impagas = Cuota.objects.filter(
            usuario=usuario,
            vencimiento__lt=hoy
        ).exclude(
            pago__estado='completado'
        )

        if cuotas_impagas.exists():
            cantidad = cuotas_impagas.count()
            return Response({
                'estado': 'denegado',
                'mensaje': f'ACCESO DENEGADO: Debe {cantidad} cuota(s)',
                'socio': nombre_completo,
                'motivo': 'deuda'
            })

        # 5. Acceso Permitido
        return Response({
            'estado': 'aprobado',
            'mensaje': 'BIENVENIDO',
            'socio': nombre_completo
        })

    except Exception as e:
        # Logueamos el error en consola del servidor para debug
        print(f"❌ Error en validación de acceso: {str(e)}")
        return Response({
            'estado': 'denegado', 
            'mensaje': f'Error del servidor: {str(e)}',
            'socio': 'Sistema'
        }, status=status.HTTP_200_OK)