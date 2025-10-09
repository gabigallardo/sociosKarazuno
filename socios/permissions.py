# socios/permissions.py
from rest_framework.permissions import BasePermission

class RolePermission(BasePermission):
    """
    Permiso personalizado basado en roles del usuario autenticado.
    El usuario ya fue autenticado por JWTAuthentication, así que
    request.user ya está disponible con sus roles.
    """
    
    def has_permission(self, request, view):
        # Verificar que el usuario existe (fue autenticado por JWTAuthentication)
        if not request.user:
            return False
        
        # Obtener los roles requeridos de la vista
        required_roles = getattr(view, 'required_roles', [])
        
        # Si no hay roles requeridos, permitir acceso
        if not required_roles:
            return True
        
        # Obtener los roles del usuario desde la base de datos
        try:
            user_roles = list(request.user.roles.values_list('nombre', flat=True))
        except AttributeError:
            # Si el usuario no tiene el atributo roles, denegar acceso
            return False
        
        # Verificar si el usuario tiene al menos uno de los roles requeridos
        return any(role in user_roles for role in required_roles)