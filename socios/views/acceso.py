from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from ..models.socio import SocioInfo
from ..models.usuario import Usuario
from ..models.cuota import Cuota
from ..models.evento import Evento
from django.db.models import Q

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
        mensaje_voz = f"Hola {usuario.nombre}." # Mensaje por defecto
        
        try:
            # Buscamos eventos futuros (desde hoy)
            # Que sean Generales (sin categoria) O de la categoría del socio
            eventos_proximos = Evento.objects.filter(
                fecha_inicio__gte=hoy,
                fecha_inicio__lte=hoy + timezone.timedelta(days=7) # Solo eventos en los próximos 7 días
            ).filter(
                Q(categoria__isnull=True) |  # Evento general
                Q(categoria=socio_info.categoria) # Evento de su categoría
            ).order_by('fecha_inicio')

            evento_cercano = eventos_proximos.first()

            if evento_cercano:
                dias_es = {
                    0: "lunes", 1: "martes", 2: "miércoles", 3: "jueves", 
                    4: "viernes", 5: "sábado", 6: "domingo"
                }
                dia_semana = dias_es[evento_cercano.fecha_inicio.weekday()]
                mensaje_voz = f"Hola {usuario.nombre}. Recuerda: {evento_cercano.titulo}, el próximo {dia_semana}."

        except Exception as e:
            # Si falla la búsqueda del evento, no bloqueamos el acceso, solo ignoramos el error
            print(f"Error buscando eventos para TTS: {e}")


        return Response({
            'estado': 'aprobado',
            'mensaje': 'BIENVENIDO',
            'socio': nombre_completo,
            'texto_tts': mensaje_voz  # <--- Enviamos el texto para que el frontend lo hable
        })

    except Exception as e:
        # Logueamos el error en consola del servidor para debug
        print(f"❌ Error en validación de acceso: {str(e)}")
        return Response({
            'estado': 'denegado', 
            'mensaje': f'Error del servidor: {str(e)}',
            'socio': 'Sistema'
        }, status=status.HTTP_200_OK)