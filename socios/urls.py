from django.urls import path, include
from rest_framework import routers
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

# Importamos las vistas y ViewSets
from socios.views import (
    LoginView, RegisterView, UsuarioViewSet, RolesViewSet,
    EventoViewSet, NivelSocioViewSet, SocioInfoViewSet,
    DisciplinaViewSet, CategoriaViewSet, CuotaViewSet, 
    HorarioEntrenamientoViewSet, SesionEntrenamientoViewSet, 
)
from socios.views.acceso import validar_acceso, HistorialAccesoView

router = routers.DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, 'usuarios')
router.register(r'roles', RolesViewSet, 'roles')
router.register(r'eventos', EventoViewSet, 'eventos')
router.register(r'niveles-socio', NivelSocioViewSet, 'niveles-socio')
router.register(r'socios-info', SocioInfoViewSet, 'socios-info')
router.register(r'disciplinas', DisciplinaViewSet, 'disciplinas')
router.register(r'categorias', CategoriaViewSet, 'categorias')
router.register(r'cuotas', CuotaViewSet, 'cuotas')
router.register(r'horarios', HorarioEntrenamientoViewSet, 'horarios')
router.register(r'sesiones', SesionEntrenamientoViewSet, 'sesiones')

urlpatterns = [
    # Rutas de la API v1 (generadas por el router)
    path('api/v1/', include(router.urls)),

    # Esquema y Documentación API
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Autenticación
    path("login/", LoginView.as_view(), name="login"),
    path("register/", RegisterView.as_view(), name="register"),

    # Control de Acceso
    path('api/control-acceso/', validar_acceso, name='control_acceso'),
    path('api/control-acceso/historial/', HistorialAccesoView.as_view(), name='historial_acceso'),
]