from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Q
from datetime import datetime, time 

# Modelos
from ..models.socio import SocioInfo
from ..models.usuario import Usuario
from ..models.cuota import Cuota
from ..models.evento import Evento
from ..models.registro_acceso import RegistroAcceso

# Serializers
from ..serializers.registro_acceso import RegistroAccesoSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validar_acceso(request):
    try:
        qr_data = request.data.get('qr_data')

        if not qr_data:
            return Response({'error': 'Código vacío'}, status=status.HTTP_400_BAD_REQUEST)

        # Limpieza de datos
        qr_data_limpio = qr_data.replace("'", "-").replace('"', '-').strip()
        usuario = None

        # --- Función auxiliar para registrar en BD y responder ---
        def registrar_y_responder(estado, mensaje, motivo_bd, motivo_front, usuario_obj=None, tts=None):
            try:
                RegistroAcceso.objects.create(
                    usuario=usuario_obj,
                    estado=estado,
                    motivo=motivo_bd,
                    datos_ingresados=qr_data_limpio
                )
            except Exception as ex:
                print(f"Error guardando registro de acceso: {ex}")

            respuesta = {
                'estado': estado,
                'mensaje': mensaje,
                'socio': f"{usuario_obj.nombre} {usuario_obj.apellido}" if usuario_obj else 'Desconocido',
                'motivo': motivo_front
            }
            if tts:
                respuesta['texto_tts'] = tts
            
            return Response(respuesta)
        # ---------------------------------------------------------

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
            return registrar_y_responder(
                'denegado', 
                f'Usuario NO ENCONTRADO (Leído: {qr_data_limpio})', 
                'Usuario no encontrado', 
                'error'
            )

        nombre_completo = f"{usuario.nombre} {usuario.apellido}"

        # 2. Verificar si es Socio
        try:
            socio_info = usuario.socioinfo
        except SocioInfo.DoesNotExist:
            return registrar_y_responder(
                'denegado', 
                'NO ES SOCIO', 
                'No es socio', 
                'no_socio', 
                usuario
            )

        # 3. Verificar si está Activo
        if socio_info.estado != 'activo':
            return registrar_y_responder(
                'denegado', 
                f'Socio {socio_info.get_estado_display().upper()}', 
                'Socio inactivo', 
                'inactivo', 
                usuario
            )

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
            return registrar_y_responder(
                'denegado', 
                f'ACCESO DENEGADO: Debe {cantidad} cuota(s)', 
                'Deuda de cuotas', 
                'deuda', 
                usuario
            )

        # 5. Acceso Permitido
        mensaje_voz = f"Hola {usuario.nombre}." 
        
        try:
            inicio_rango = timezone.make_aware(datetime.combine(hoy, time.min))
            fin_rango = inicio_rango + timezone.timedelta(days=7)

            eventos_proximos = Evento.objects.filter(
                fecha_inicio__gte=inicio_rango,
                fecha_inicio__lte=fin_rango
            ).filter(
                Q(categoria__isnull=True) | 
                Q(categoria=socio_info.categoria)
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
            print(f"Error buscando eventos para TTS: {e}")

        return registrar_y_responder(
            'aprobado', 
            'BIENVENIDO', 
            'Cuota al día', 
            'ok', 
            usuario, 
            tts=mensaje_voz
        )

    except Exception as e:
        print(f"❌ Error en validación de acceso: {str(e)}")
        return Response({
            'estado': 'denegado', 
            'mensaje': f'Error del servidor: {str(e)}',
            'socio': 'Sistema'
        }, status=status.HTTP_200_OK)

# Vista para el Historial
class HistorialAccesoView(generics.ListAPIView):
    queryset = RegistroAcceso.objects.all().order_by('-fecha_hora') 
    serializer_class = RegistroAccesoSerializer
    permission_classes = [IsAuthenticated]