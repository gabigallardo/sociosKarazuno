from .auth import LoginView, RegisterView
from .usuario import UsuarioViewSet
from .rol import RolesViewSet
from .evento import EventoViewSet
from .socio import SocioInfoViewSet, NivelSocioViewSet
from .cuota import CuotaViewSet
from .disciplina import DisciplinaViewSet, CategoriaViewSet, HorarioEntrenamientoViewSet

__all__ = [
    'LoginView',
    'RegisterView',
    'UsuarioViewSet',
    'RolesViewSet',
    'EventoViewSet',
    'SocioInfoViewSet',
    'NivelSocioViewSet',
    'CuotaViewSet',
    'DisciplinaViewSet',
    'CategoriaViewSet',
    'HorarioEntrenamientoViewSet',
]