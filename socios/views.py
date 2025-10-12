from django.shortcuts import render
from rest_framework import viewsets
from .models import Usuario, Rol, SocioInfo, NivelSocio, UsuarioRol, Cuota
from .serializer import UsuarioSerializer, EventoSerializer, RolSerializer, RegisterSerializer, SocioInfoSerializer, NivelSocioSerializer
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .permissions import RolePermission
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from django.utils import timezone

class LoginView(APIView):
    permission_classes = [AllowAny]  # Permitir acceso a todos

    def post(self, request):
        email = request.data.get("email")
        contrasena = request.data.get("contrasena")

        if not email or not contrasena:
            return Response({"error": "Email y contraseña requeridos"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            usuario = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return Response({"error": "Email no registrado"}, status=status.HTTP_400_BAD_REQUEST)

        if usuario.contrasena != contrasena:
            return Response({"error": "Contraseña incorrecta"}, status=status.HTTP_400_BAD_REQUEST)

        roles = list(usuario.roles.values_list('nombre', flat=True))

        payload = {
            "id": usuario.id,
            "email": usuario.email,
            "roles": roles,
            "exp": datetime.utcnow() + timedelta(hours=2),
        }

        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        return Response({
            "token": token, 
            "usuario": {
                "id": usuario.id,
                "nombre": usuario.nombre, 
                "apellido": usuario.apellido, 
                "email": usuario.email,
                "nro_documento": usuario.nro_documento,
                "fecha_nacimiento": usuario.fecha_nacimiento, # Django devuelve objetos Date, asegúrate de que se serialice bien
                "sexo": usuario.sexo,
                "foto_url": usuario.foto_url,
                "qr_token": usuario.qr_token, # Importante para la credencial
                "roles": roles,
            }
        })

class RegisterView(APIView):
    permission_classes = [AllowAny]  # Permitir acceso a todos
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Usuario registrado correctamente."}, status=status.HTTP_201_CREATED)
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [RolePermission]
    required_roles = ['admin']  # Solo usuarios con rol 'admin' pueden acceder
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def hacerse_socio(self, request, pk=None):
        usuario = self.get_object()
        #Verificar si ya es socio
        if SocioInfo.objects.filter(usuario=usuario).exists():
            return Response({"error": "El usuario ya es socio."}, status=status.HTTP_400_BAD_REQUEST)
        
        #1. Obtener el rol 'socio'
        try:
            rol_socio = Rol.objects.get(nombre='socio')
        except Rol.DoesNotExist:
            return Response({"error": "El rol 'socio' no existe."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        #2. Obtener el nivel socio más bajo
        try:
            nivel_inicial = NivelSocio.objects.get(nivel=1)
        except NivelSocio.DoesNotExist:
            return Response({"error": "El nivel socio inicial no está definido."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        #3. Crear SocioInfo
        socio_info = SocioInfo.objects.create(
            usuario=usuario,
            cuota_al_dia=False, #Hasta que pague la primera cuota
            nivel_socio=nivel_inicial
        )
        #4. Asociar el rol 'socio' al usuario
        UsuarioRol.objects.create(usuario=usuario, rol=rol_socio)
        #5. Crear la primera cuota (suponiendo que es mensual y vence en 30 días)
        monto_base = 15000.00
        descuento = nivel_inicial.descuento
        monto_final = monto_base * (1 - descuento / 100)
        periodo = datetime.now().strftime("%Y-%m")
        vencimiento = timezone.now() + timedelta(days=30)

        Cuota.objects.create(
            usuario=usuario,
            categoria=None,  # Esta es cuota de socio, no de evento o categoria
            periodo=periodo,
            monto=monto_final,
            vencimiento=vencimiento.date(),  # Solo la parte de la fecha
            descuento_aplicado=descuento
        )

        return Response({
            "message": "El usuario ahora es socio.",
            "socio_info": SocioInfoSerializer(socio_info).data,
            "cuota_generada": True
        }, status=status.HTTP_201_CREATED)


class RolesViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer

class EventoViewSet(viewsets.ModelViewSet):
    from .models import Evento
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer

class NivelSocioViewSet(viewsets.ModelViewSet):
    queryset = NivelSocio.objects.all()
    serializer_class = NivelSocioSerializer
    permission_classes = [AllowAny]  # Permitir acceso a todos

class SocioInfoViewSet(viewsets.ModelViewSet):
    queryset = SocioInfo.objects.all()
    serializer_class = SocioInfoSerializer