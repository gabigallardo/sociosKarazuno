from rest_framework.test import APITestCase
from rest_framework import status
from socios.models import Usuario
from django.contrib.auth.hashers import make_password
import jwt
from django.conf import settings
from datetime import datetime, timedelta

class LoginViewTest(APITestCase):
    
    def setUp(self):
        """
        ARRANGE: Preparar datos de prueba
        Se ejecuta ANTES de cada test
        """
        # Crear un usuario de prueba con contraseña hasheada
        self.usuario = Usuario.objects.create(
            tipo_documento='DNI',
            nro_documento='12345678',
            nombre='Juan',
            apellido='Pérez',
            email='juan@test.com',
            contrasena=make_password('password123'),  # ⚠️ IMPORTANTE: hashear
            activo=True
        )
        
        # URL del endpoint
        self.url = '/socios/login/'
        
        # Datos válidos para login
        self.valid_credentials = {
            'email': 'juan@test.com',
            'contrasena': 'password123'
        }

    """
     1. Test de login exitoso"""
    def test_login_exitoso_retorna_token_y_datos_usuario(self):
        """
        Verifica que con credenciales correctas:
        - Retorna status 200
        - Devuelve un token JWT
        - El token es válido y contiene los datos correctos
        - Retorna información del usuario
        """
        # ACT: Hacer login
        response = self.client.post(self.url, self.valid_credentials)
        
        # ASSERT: Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar que devuelve el token
        self.assertIn('token', response.data)
        self.assertIn('usuario', response.data)
        
        # Decodificar y verificar el token
        token = response.data['token']
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        
        self.assertEqual(payload['id'], self.usuario.id)
        self.assertEqual(payload['email'], self.usuario.email)
        self.assertIn('exp', payload)  # Tiene fecha de expiración
        
        # Verificar datos del usuario
        self.assertEqual(response.data['usuario']['email'], 'juan@test.com')
        self.assertEqual(response.data['usuario']['nombre'], 'Juan')

    """
    2 . Email no registrado
    """
    def test_login_falla_con_email_no_registrado(self):
        """
        Verifica que no se puede hacer login con un email que no existe
        """
        # ACT
        response = self.client.post(self.url, {
            'email': 'noexiste@test.com',
            'contrasena': 'cualquiera'
        })
        
        # ASSERT
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Email no registrado')

    """
    3. Contraseña incorrecta
    """
    def test_login_falla_con_contrasena_incorrecta(self):
        """
        Verifica que con contraseña incorrecta se rechaza el acceso
        """
        # ACT
        response = self.client.post(self.url, {
            'email': 'juan@test.com',
            'contrasena': 'contraseña_mala'
        })
        
        # ASSERT
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Contraseña incorrecta')

    """
    4. Campos faltantes
    """
    def test_login_falla_sin_email(self):
        """
        Verifica validación de campos requeridos
        """
        # ACT
        response = self.client.post(self.url, {
            'contrasena': 'password123'
            # falta email
        })
        
        # ASSERT
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    """5. Usuario inactivo
    """

    def test_login_falla_sin_contrasena(self):
        # Similar al anterior pero sin contraseña
        response = self.client.post(self.url, {
            'email': 'juan@test.com'
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    

class JWTAuthenticationTest(APITestCase):
    
    def setUp(self):
        # Crear usuario
        self.usuario = Usuario.objects.create(
            email='test@test.com',
            contrasena=make_password('pass'),
            nombre='Test',
            apellido='User',
            nro_documento='11111111',
            tipo_documento='DNI'
        )
        
        # Generar token válido
        self.token = jwt.encode(
            {
                'id': self.usuario.id,
                'email': self.usuario.email,
                'exp': datetime.utcnow() + timedelta(hours=2)
            },
            settings.SECRET_KEY,
            algorithm='HS256'
        )
        
        # URL protegida (ejemplo)
        self.protected_url = '/socios/api/v1/usuarios/'

    """1. Acceso con token válido  
    """
    
    def test_acceso_con_token_valido(self):
        """
        Verifica que con token válido se puede acceder a endpoints protegidos
        """
        # ACT: Hacer petición con token en header
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        response = self.client.get(self.protected_url)
        
        # ASSERT
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    """2. Acceso sin token
    """
    def test_acceso_denegado_sin_token(self):
        """
        Verifica que sin token no se puede acceder
        """
        # ACT: Hacer petición SIN token
        response = self.client.get(self.protected_url)
        
        # ASSERT
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    """3. Acceso con token expirado
    """
    def test_acceso_denegado_con_token_expirado(self):
        """
        Verifica que tokens expirados son rechazados
        """
        # ARRANGE: Crear token expirado
        expired_token = jwt.encode(
            {
                'id': self.usuario.id,
                'email': self.usuario.email,
                'exp': datetime.utcnow() - timedelta(hours=1)  # ⚠️ Ya expiró
            },
            settings.SECRET_KEY,
            algorithm='HS256'
        )
        
        # ACT
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {expired_token}')
        response = self.client.get(self.protected_url)
        
        # ASSERT
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    """4. Acceso con token inválido
    """
    def test_acceso_denegado_con_token_invalido(self):
        """
        Verifica que tokens malformados o con firma incorrecta son rechazados
        """
        # ACT: Token con firma incorrecta
        self.client.credentials(HTTP_AUTHORIZATION='Bearer token_falso_123')
        response = self.client.get(self.protected_url)
        
        # ASSERT
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    """5. Formato 'Bearer' incorrecto
    """
    def test_formato_bearer_incorrecto(self):
        """
        Verifica que el formato 'Bearer <token>' es requerido
        """
        # ACT: Sin la palabra 'Bearer'
        self.client.credentials(HTTP_AUTHORIZATION=self.token)
        response = self.client.get(self.protected_url)
        
        # ASSERT
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    """6. Token con usuario eliminado
    """
    def test_token_con_usuario_eliminado(self):
        """
        ¿Qué pasa si el usuario es eliminado después de generar el token?
        """
        # Generar token
        token = jwt.encode(
            {'id': self.usuario.id, 'email': self.usuario.email, 
            'exp': datetime.utcnow() + timedelta(hours=2)},
            settings.SECRET_KEY,
            algorithm='HS256'
        )
        
        # Eliminar usuario
        self.usuario.delete()
        
        # Intentar usar el token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get(self.protected_url)
        
        # Debería fallar
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)