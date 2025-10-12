from django.shortcuts import render
from rest_framework import viewsets
from .models import Usuario, Rol, SocioInfo, NivelSocio, UsuarioRol, Cuota
from .serializer import UsuarioSerializer, EventoSerializer, RolSerializer, RegisterSerializer, SocioInfoSerializer, NivelSocioSerializer
import jwt
import uuid 
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
    permission_classes = [AllowAny]

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
                "fecha_nacimiento": usuario.fecha_nacimiento,
                "sexo": usuario.sexo,
                "foto_url": usuario.foto_url,
                "qr_token": usuario.qr_token,
                "roles": roles,
            }
        })

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Usuario registrado correctamente."}, status=status.HTTP_201_CREATED)
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    def get_permissions(self):
        """
        Instancia y devuelve la lista de permisos que requiere esta vista,
        permitiendo un control dinámico según la acción.
        """
        if self.action == 'hacerse_socio':
            # Para 'hacerse_socio', solo se necesita estar autenticado.
            permission_classes = [IsAuthenticated]
        else:
            role_permission = RolePermission()
            role_permission.required_roles = ['admin']
            permission_classes = [role_permission]
            
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'])
    def hacerse_socio(self, request, pk=None):
        usuario = self.get_object()
        
        if SocioInfo.objects.filter(usuario=usuario).exists():
            return Response({"error": "El usuario ya es socio."}, status=status.HTTP_400_BAD_REQUEST)
        
        if not usuario.qr_token:
            usuario.qr_token = str(uuid.uuid4())
            usuario.save()

        try:
            rol_socio = Rol.objects.get(nombre='socio')
        except Rol.DoesNotExist:
            return Response({"error": "El rol 'socio' no existe."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            nivel_inicial = NivelSocio.objects.get(nivel=1)
        except NivelSocio.DoesNotExist:
            return Response({"error": "El nivel socio inicial no está definido."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        socio_info = SocioInfo.objects.create(
            usuario=usuario,
            cuota_al_dia=False,
            nivel_socio=nivel_inicial
        )
        
        UsuarioRol.objects.create(usuario=usuario, rol=rol_socio)

        monto_base = 15000.00
        descuento = nivel_inicial.descuento
        monto_final = monto_base * (1 - descuento / 100)
        periodo = datetime.now().strftime("%Y-%m")
        vencimiento = timezone.now() + timedelta(days=30)

        Cuota.objects.create(
            usuario=usuario,
            categoria=None,
            periodo=periodo,
            monto=monto_final,
            vencimiento=vencimiento.date(),
            descuento_aplicado=descuento
        )

        return Response({
            "message": "El usuario ahora es socio.",
            "socio_info": SocioInfoSerializer(socio_info).data,
            "cuota_generada": True,
            "qr_token": usuario.qr_token 
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
    permission_classes = [AllowAny]

class SocioInfoViewSet(viewsets.ModelViewSet):
    queryset = SocioInfo.objects.all()
    serializer_class = SocioInfoSerializer