from django.shortcuts import render
from rest_framework import viewsets
from .models import Socio
from .serializer import SocioSerializer

# Create your views here.
class SocioViewSet(viewsets.ModelViewSet):
    queryset = Socio.objects.all()
    serializer_class = SocioSerializer
     