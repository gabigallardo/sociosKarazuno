from django.shortcuts import render
from rest_framework import viewsets
from .models import Usuario, Rol, NivelSocio, UsuarioRol, SocioInfo, Disciplina
from .serializer import UsuarioSerializer

# Create your views here.
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
     