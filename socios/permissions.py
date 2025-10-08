from rest_framework.permissions import BasePermission
import  jwt
from django.conf import settings

class RolePermission(BasePermission):
    def has_permission(self, request, view):
        # Revisamos si la view definió roles requeridos
        required_roles = getattr(view, 'required_roles', [])
        if not required_roles:
            return True  # Si no hay roles requeridos, permitimos el acceso
        
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return False
        
        try:
            token = auth_header.split(' ')[1] # Formato "Bearer <token>"
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_roles = payload.get('roles', [])
            # Verifica si el usuario tiene al menos un rol requerido
            required_roles = getattr(view, 'required_roles', [])
            if not required_roles:
                return True
            
            return any(role in user_roles for role in required_roles)
        except (IndexError, jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return False