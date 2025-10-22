from django.utils import timezone
from django.db import models
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from socios.models import Evento, SocioInfo
from socios.serializers import EventoSerializer


class EventoViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de eventos"""
    serializer_class = EventoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Obtener eventos futuros ordenados por fecha"""
        return Evento.objects.filter(
            fecha_fin__gte=timezone.now()
        ).order_by('fecha_inicio')

    @action(
        detail=False,
        methods=['get'],
        permission_classes=[IsAuthenticated],
        url_path='mis-viajes'
    )
    def mis_viajes(self, request):
        """Obtener viajes filtrados por disciplina y categoría del socio"""
        usuario = request.user

        try:
            socio_info = usuario.socioinfo
            disciplina_socio = socio_info.disciplina
            categoria_socio = socio_info.categoria
        except SocioInfo.DoesNotExist:
            return Response([], status=200)

        if not disciplina_socio:
            return Response([], status=200)

        viajes = Evento.objects.filter(
            tipo='viaje',
            disciplina=disciplina_socio,
            fecha_fin__gte=timezone.now()
        ).filter(
            models.Q(categoria__isnull=True) | models.Q(categoria=categoria_socio)
        ).order_by('fecha_inicio')

        serializer = self.get_serializer(viajes, many=True)
        return Response(serializer.data)