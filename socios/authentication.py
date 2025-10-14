# socios/authentication.py
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
import jwt
from .models import Usuario

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        print(f"🔍 Header recibido: {auth_header}")  # 👈 DEBUG
        
        if not auth_header:
            print("⚠️ No hay header")  # 👈 DEBUG
            return None
        
        try:
            parts = auth_header.split()
            
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                print(f"❌ Formato inválido: {parts}")  # 👈 DEBUG
                raise AuthenticationFailed('Formato de token inválido')
            
            token = parts[1]
            print(f"🔑 Token extraído: {token[:20]}...")  # 👈 DEBUG
            
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                print(f"✅ Payload decodificado: {payload}")  # 👈 DEBUG
            except jwt.ExpiredSignatureError:
                print("❌ Token expirado")  # 👈 DEBUG
                raise AuthenticationFailed('Token expirado')
            except jwt.DecodeError as e:
                print(f"❌ Error decodificando: {e}")  # 👈 DEBUG
                raise AuthenticationFailed('Token inválido')
            
            try:
                usuario = Usuario.objects.get(id=payload['id'])
                print(f"✅ Usuario encontrado: {usuario.email}")  # 👈 DEBUG
            except Usuario.DoesNotExist:
                print(f"❌ Usuario no existe: {payload['id']}")  # 👈 DEBUG
                raise AuthenticationFailed('Usuario no encontrado')
            
            return (usuario, token)
            
        except AuthenticationFailed:
            raise
        except Exception as e:
            print(f"❌ Error inesperado: {e}")  # 👈 DEBUG
            raise AuthenticationFailed(f'Error de autenticación: {str(e)}')
    
    def authenticate_header(self, request):
        return 'Bearer'