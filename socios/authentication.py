# socios/authentication.py
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
import jwt
from .models import Usuario

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        print(f"🔍 Header recibido: {auth_header}")
        
        if not auth_header:
            print("⚠️ No hay header")
            return None
        
        try:
            parts = auth_header.split()
            
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                print(f"❌ Formato inválido: {parts}")
                return None
            
            token = parts[1]
            print(f"🔑 Token extraído: {token[:20]}...")
            
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                print(f"✅ Payload decodificado: {payload}")
            
            except jwt.ExpiredSignatureError:
                print("❌ Token expirado. Tratando como anónimo.")
                return None 
            
            except jwt.DecodeError as e:
                print(f"❌ Error decodificando: {e}. Tratando como anónimo.")
                return None 
            
            try:
                usuario = Usuario.objects.get(id=payload['id'])
                print(f"✅ Usuario encontrado: {usuario.email}")
            except Usuario.DoesNotExist:
                print(f"❌ Usuario del token no existe: {payload['id']}")
                raise AuthenticationFailed('Usuario no encontrado')
            
            return (usuario, token)
            
        except AuthenticationFailed:
            raise
        except Exception as e:
            print(f"❌ Error inesperado: {e}")
            raise AuthenticationFailed(f'Error de autenticación: {str(e)}')
    
    def authenticate_header(self, request):
        return 'Bearer'