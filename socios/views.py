from django.shortcuts import render
from rest_framework import viewsets
from .models import Usuario, Rol
from .serializer import UsuarioSerializer, EventoSerializer, RolSerializer, RegisterSerializer
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class LoginView(APIView):
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

        payload = {
            "id": usuario.id,
            "email": usuario.email,
            "exp": datetime.utcnow() + timedelta(hours=2),
        }

        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        return Response({"token": token, "usuario": {"nombre": usuario.nombre, "apellido": usuario.apellido, "email": usuario.email}})


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Usuario registrado correctamente."}, status=status.HTTP_201_CREATED)
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer


class RolesViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer

class EventoViewSet(viewsets.ModelViewSet):
    from .models import Evento
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer