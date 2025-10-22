from django.urls import path, include
from rest_framework import routers
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)


from socios.views import (
    LoginView, RegisterView, UsuarioViewSet, RolesViewSet,
    EventoViewSet, NivelSocioViewSet, SocioInfoViewSet,
    DisciplinaViewSet, CategoriaViewSet, CuotaViewSet
)

router = routers.DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, 'usuarios')
router.register(r'roles', RolesViewSet, 'roles')
router.register(r'eventos', EventoViewSet, 'eventos')
router.register(r'niveles-socio', NivelSocioViewSet, 'niveles-socio')
router.register(r'socios-info', SocioInfoViewSet, 'socios-info')
router.register(r'disciplinas', DisciplinaViewSet, 'disciplinas')
router.register(r'categorias', CategoriaViewSet, 'categorias')
router.register(r'cuotas', CuotaViewSet, 'cuotas')


urlpatterns = [
    path('api/v1/', include(router.urls)),

    # Endpoint que genera el esquema OpenAPI en JSON
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),

    # Documentación interactiva con Swagger
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Documentación alternativa con Redoc
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    # Endpoint para login
    path("login/", LoginView.as_view(), name="login"),
        # Endpoint para registro
    path("register/", RegisterView.as_view(), name="register"),

]