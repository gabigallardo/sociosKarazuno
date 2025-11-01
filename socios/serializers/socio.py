from rest_framework import serializers
from socios.models import SocioInfo, NivelSocio, Usuario, Cuota, Pago

class NivelSocioSerializer(serializers.ModelSerializer):
    class Meta:
        model = NivelSocio
        fields = '__all__'

class SocioInfoSerializer(serializers.ModelSerializer):
    # Campo anidado para mostrar info completa del nivel
    nivel_socio_info = NivelSocioSerializer(source='nivel_socio', read_only=True)

    # Campos del usuario relacionado
    nombre_completo = serializers.SerializerMethodField()
    email = serializers.EmailField(source='usuario.email', read_only=True)
    nro_documento = serializers.CharField(source='usuario.nro_documento', read_only=True)
    telefono = serializers.CharField(source='usuario.telefono', read_only=True)
    
    # Nombre de disciplina (en lugar de solo ID)
    disciplina_nombre = serializers.CharField(source='disciplina.nombre', read_only=True)
    categoria_nombre = serializers.CharField(source='categoria.nombre_categoria', read_only=True)

    # Declarar cuota_al_dia como un campo calculado
    cuota_al_dia = serializers.SerializerMethodField()
    
    class Meta:
        model = SocioInfo
        fields = [
            'usuario',
            'nombre_completo',
            'email',
            'nro_documento',
            'telefono',
            'cuota_al_dia',
            'nivel_socio',
            'nivel_socio_info',
            'disciplina',
            'disciplina_nombre',
            'categoria',
            'categoria_nombre',
            'estado',
            'fecha_inactivacion',
            'razon_inactivacion'
        ]
        read_only_fields = ['fecha_inactivacion']

    # Implementar el método que calcula el valor
    def get_cuota_al_dia(self, obj: SocioInfo) -> bool:
        """
        Calcula en tiempo real si el socio tiene deudas pendientes.
        'obj' es la instancia de SocioInfo que se está serializando.
        """
        # La lógica es simple: "está al día" si NO existen cuotas pendientes de pago.
        tiene_deudas = Cuota.objects.filter(usuario=obj.usuario).exclude(
            id__in=Pago.objects.filter(estado='completado').values_list('cuota_id', flat=True)
        ).exists()
        
        return not tiene_deudas
    
    def get_nombre_completo(self, obj):
        """Retorna nombre completo del usuario"""
        return f"{obj.usuario.nombre} {obj.usuario.apellido}"
    
    def get_disciplina_nombre(self, obj):
        """Retorna nombre de disciplina o None"""
        return obj.disciplina.nombre if obj.disciplina else None
    
    def get_categoria_nombre(self, obj):
        """Retorna nombre de categoría o None"""
        return obj.categoria.nombre_categoria if obj.categoria else None
