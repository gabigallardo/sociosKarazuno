from django.shortcuts import render
from rest_framework import viewsets
from .models import (
    Usuario, Rol, SocioInfo, NivelSocio, UsuarioRol, Cuota, Evento, 
    Disciplina, Categoria
)
from .serializer import (
    UsuarioSerializer, EventoSerializer, RolSerializer, RegisterSerializer, 
    SocioInfoSerializer, NivelSocioSerializer, DisciplinaSerializer, CategoriaSerializer, CuotaSerializer
)
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
from django.db import models
from django.contrib.auth.hashers import make_password, check_password

# --- Vistas de Autenticación ---

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
        if not check_password(contrasena, usuario.contrasena):
            return Response({"error": "Contraseña incorrecta"}, status=status.HTTP_400_BAD_REQUEST)
        roles = list(usuario.roles.values_list('nombre', flat=True))
        payload = {
            "id": usuario.id, "email": usuario.email, "roles": roles,
            "exp": datetime.utcnow() + timedelta(hours=2),
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
        return Response({
            "token": token, 
            "usuario": {
                "id": usuario.id, "nombre": usuario.nombre, "apellido": usuario.apellido, 
                "email": usuario.email, "nro_documento": usuario.nro_documento,
                "fecha_nacimiento": usuario.fecha_nacimiento, "sexo": usuario.sexo,
                "foto_url": usuario.foto_url, "qr_token": usuario.qr_token, "roles": roles,
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

# --- ViewSets de la API ---

class UsuarioViewSet(viewsets.ModelViewSet):
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
        usuario = self.get_object()
        
        # Verificar si ya tiene el rol socio (en lugar de solo SocioInfo)
        if UsuarioRol.objects.filter(usuario=usuario, rol__nombre='socio').exists():
            return Response({"error": "El usuario ya es socio."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            rol_socio = Rol.objects.get(nombre='socio')
            nivel_inicial = NivelSocio.objects.get(nivel=1)
        except (Rol.DoesNotExist, NivelSocio.DoesNotExist):
            return Response({"error": "Configuración inicial de roles o niveles no encontrada."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Obtener o crear SocioInfo (en caso de que exista de antes)
        socio_info, created = SocioInfo.objects.get_or_create(
            usuario=usuario,
            defaults={'cuota_al_dia': False, 'nivel_socio': nivel_inicial}
        )
        
        # Si no fue creado, actualizar los valores
        if not created:
            socio_info.cuota_al_dia = False
            socio_info.nivel_socio = nivel_inicial
            socio_info.disciplina = None
            socio_info.categoria = None
            socio_info.save()
        
        UsuarioRol.objects.create(usuario=usuario, rol=rol_socio)
        
        monto_base = 15000.00
        descuento = nivel_inicial.descuento
        monto_final = monto_base * (1 - descuento / 100)
        periodo = timezone.now().strftime("%Y-%m")
        vencimiento = timezone.now() + timedelta(days=30)
        Cuota.objects.create(usuario=usuario, periodo=periodo, monto=monto_final, vencimiento=vencimiento.date(), descuento_aplicado=descuento)
        
        return Response({
            "message": "El usuario ahora es socio.",
            "socio_info": SocioInfoSerializer(socio_info).data,
            "cuota_generada": True
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['put'], permission_classes=[IsAuthenticated], url_path='me/actualizar-perfil-deportivo')
    def actualizar_perfil_deportivo(self, request):
        usuario = request.user
        try:
            socio_info = usuario.socioinfo
        except SocioInfo.DoesNotExist:
            return Response({"error": "El usuario no es un socio activo."}, status=status.HTTP_400_BAD_REQUEST)
            
        disciplina_id = request.data.get('disciplina_id')
        categoria_id = request.data.get('categoria_id')
        
        socio_info.disciplina_id = disciplina_id
        socio_info.categoria_id = categoria_id
        socio_info.save()
        
        return Response(SocioInfoSerializer(socio_info).data, status=status.HTTP_200_OK)


class RolesViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    permission_classes = [RolePermission]
    required_roles = ['admin']

class EventoViewSet(viewsets.ModelViewSet):
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Evento.objects.filter(fecha_fin__gte=timezone.now()).order_by('fecha_inicio')

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='mis-viajes')
    def mis_viajes(self, request):
        usuario = request.user
        try:
            socio_info = usuario.socioinfo
            disciplina_socio = socio_info.disciplina
            categoria_socio = socio_info.categoria
        except SocioInfo.DoesNotExist:
            return Response([], status=status.HTTP_200_OK) 

        if not disciplina_socio:
            return Response([], status=status.HTTP_200_OK)
        
        viajes = Evento.objects.filter(
            tipo='viaje',
            disciplina=disciplina_socio,
            fecha_fin__gte=timezone.now()
        ).filter(
            models.Q(categoria__isnull=True) | models.Q(categoria=categoria_socio)
        ).order_by('fecha_inicio')
        
        serializer = self.get_serializer(viajes, many=True)
        return Response(serializer.data)

class NivelSocioViewSet(viewsets.ModelViewSet):
    queryset = NivelSocio.objects.all()
    serializer_class = NivelSocioSerializer
    permission_classes = [AllowAny]

class SocioInfoViewSet(viewsets.ModelViewSet):
    queryset = SocioInfo.objects.all()
    serializer_class = SocioInfoSerializer
    permission_classes = [IsAuthenticated]


class DisciplinaViewSet(viewsets.ModelViewSet):
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
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    
    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [RolePermission]
            self.required_roles = ['admin', 'dirigente', 'profesor']
        return [permission() for permission in permission_classes]
    
class CuotaViewSet(viewsets.ModelViewSet):
    queryset = Cuota.objects.all()
    serializer_class = CuotaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # SIEMPRE filtrar por usuario, no solo en list
        return Cuota.objects.filter(usuario=self.request.user).order_by('-periodo')
    
    def get_permissions(self):
        # Solo permitir lectura (GET) a usuarios normales
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Solo admins pueden crear/modificar/eliminar cuotas
            permission_classes = [RolePermission]
            self.required_roles = ['admin']
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
