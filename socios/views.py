from django.shortcuts import render
from rest_framework import viewsets
from .models import Usuario, Rol, NivelSocio, UsuarioRol, SocioInfo, Disciplina
from .serializer import UsuarioSerializer
from .serializer import RolSerializer

# Create your views here.
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class RolesViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
     