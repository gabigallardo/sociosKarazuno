from django.db import models
import uuid
from django.utils import timezone


class Rol(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre


class NivelSocio(models.Model):
    nivel = models.IntegerField(unique=True)
    descuento = models.IntegerField()
    descripcion = models.CharField(max_length=255, blank=True, null=True)
    beneficios = models.TextField(blank=True, null=True)
    requisitos = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Nivel {self.nivel}"

# --- Modelos de Deportes y Categorías (MOVIDOS ARRIBA) ---

class Disciplina(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre


class Categoria(models.Model):
    SEXO_CHOICES = [
        ("masculino", "Masculino"),
        ("femenino", "Femenino"),
        ("mixto", "Mixto"),
    ]

    disciplina = models.ForeignKey(Disciplina, on_delete=models.CASCADE)
    nombre_categoria = models.CharField(max_length=100)
    edad_minima = models.IntegerField()
    edad_maxima = models.IntegerField()
    sexo = models.CharField(max_length=20, choices=SEXO_CHOICES)

    def __str__(self):
        return f"{self.nombre_categoria} - {self.disciplina.nombre}"


class Usuario(models.Model):
    SEXO_CHOICES = [
        ("masculino", "Masculino"),
        ("femenino", "Femenino"),
        ("otro", "Otro"),
    ]

    tipo_documento = models.CharField(max_length=50)
    nro_documento = models.CharField(max_length=50, unique=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    contrasena = models.CharField(max_length=255)
    telefono = models.CharField(max_length=50, blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    sexo = models.CharField(max_length=20, choices=SEXO_CHOICES, blank=True, null=True)
    foto_url = models.CharField(max_length=255, blank=True, null=True)
    qr_token = models.UUIDField(default=uuid.uuid4, unique=True)
    fecha_alta = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    roles = models.ManyToManyField("Rol", through="UsuarioRol", related_name="usuarios")

    @property
    def is_authenticated(self):
        return True
    
    @property
    def is_anonymous(self):
        return False

    def __str__(self):
        return f"{self.nombre} {self.apellido}"


class UsuarioRol(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("usuario", "rol")


class SocioInfo(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True, related_name='socioinfo')
    cuota_al_dia = models.BooleanField(default=True)
    nivel_socio = models.ForeignKey(NivelSocio, on_delete=models.SET_NULL, null=True, blank=True)
    
    disciplina = models.ForeignKey(Disciplina, on_delete=models.SET_NULL, null=True, blank=True, related_name='socios')
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True, related_name='socios')


class CategoriaEntrenador(models.Model):
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    entrenador = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    es_principal = models.BooleanField(default=False)

    class Meta:
        unique_together = ("categoria", "entrenador")


class Cuota(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True)
    periodo = models.CharField(max_length=50)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    vencimiento = models.DateField()
    descuento_aplicado = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    def __str__(self):
        return f"Cuota {self.usuario} - {self.periodo}"


class Pago(models.Model):
    ESTADO_CHOICES = [
        ("iniciado", "Iniciado"),
        ("completado", "Completado"),
        ("fallido", "Fallido"),
        ("reembolsado", "Reembolsado"),
    ]

    cuota = models.ForeignKey(Cuota, on_delete=models.CASCADE)
    medio_pago = models.CharField(max_length=50)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    moneda = models.CharField(max_length=10, default="ARS")
    referencia_externa = models.CharField(max_length=255, blank=True, null=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES)
    fecha = models.DateTimeField(auto_now_add=True)
    detalle = models.JSONField(blank=True, null=True)


class Evento(models.Model):
    TIPO_CHOICES = [
        ("torneo", "Torneo"),
        ("partido", "Partido"),
        ("viaje", "Viaje"),
        ("otro", "Otro"),
    ]
    
    VISIBILITY_CHOICES = [
        ('ALL', 'Todos los socios'),
        ('DISCIPLINE', 'Solo socios del mismo deporte'),
        ('CATEGORY', 'Solo socios de la misma categoría'),
    ]

    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)
    titulo = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    lugar = models.CharField(max_length=255)
    organizador = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    requisito_pago = models.BooleanField(default=False)
    costo = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    creado = models.DateTimeField(auto_now_add=True)
    publicado = models.BooleanField(default=True)
    
    costo_hospedaje = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Costo del hospedaje (si aplica)")
    costo_viaje = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Costo del viaje/transporte (si aplica)")
    costo_comida = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Costo estimado de comida (si aplica)")
    disciplina = models.ForeignKey(Disciplina, on_delete=models.SET_NULL, null=True, blank=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True)
    visibilidad = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='ALL')


class CalendarItem(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True)
    evento = models.ForeignKey(Evento, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    start = models.DateTimeField()
    end = models.DateTimeField()
    recordatorio_min = models.IntegerField(blank=True, null=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(recordatorio_min__gte=0),
                name="recordatorio_no_negativo"
            )
        ]


class AsistenciaEntrenamiento(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="asistencias")
    fecha = models.DateField()
    presente = models.BooleanField()
    registrado_por = models.ForeignKey(
        Usuario, on_delete=models.SET_NULL, null=True, blank=True, related_name="asistencias_registradas"
    )
    nota = models.TextField(blank=True, null=True)


class GrupoFamiliar(models.Model):
    nombre = models.CharField(max_length=100, blank=True, null=True)
    responsable = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.nombre if self.nombre else f"Grupo {self.id}"


class GrupoFamiliarIntegrante(models.Model):
    grupo_familiar = models.ForeignKey(GrupoFamiliar, on_delete=models.CASCADE)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("grupo_familiar", "usuario")