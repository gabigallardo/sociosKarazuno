# socios/tests/test_socios.py

from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.utils import timezone
from datetime import timedelta, datetime
import jwt
from django.conf import settings
from django.contrib.auth.hashers import make_password
from django_crud_api.settings import VALOR_CUOTA_BASE
from socios.models import (
    Usuario, Rol, UsuarioRol, NivelSocio, SocioInfo, 
    Cuota, Pago, Disciplina, Categoria
)


class SocioSistemaTestCase(APITestCase):
    """Tests completos para el sistema de socios con estados activo/inactivo"""
    
    def setUp(self):
        """Configuración inicial para todos los tests"""
        self.client = APIClient()
        
        self.rol_socio, _ = Rol.objects.get_or_create(nombre='socio', defaults={'descripcion': 'Socio del club'})
        self.rol_admin, _ = Rol.objects.get_or_create(nombre='admin', defaults={'descripcion': 'Administrador'})
        self.rol_dirigente, _ = Rol.objects.get_or_create(nombre='dirigente', defaults={'descripcion': 'Dirigente'})
        
        self.nivel_1, _ = NivelSocio.objects.get_or_create(nivel=1, defaults={'descuento': 0, 'descripcion': 'Nivel inicial'})
        self.nivel_2, _ = NivelSocio.objects.get_or_create(nivel=2, defaults={'descuento': 10, 'descripcion': 'Nivel intermedio'})
        
        self.usuario = Usuario.objects.create(email='socio@test.com', nombre='Juan', apellido='Pérez', nro_documento='12345678', contrasena=make_password('password123'))
        self.admin = Usuario.objects.create(email='admin@test.com', nombre='Admin', apellido='Test', nro_documento='87654321', contrasena=make_password('admin123'))
        UsuarioRol.objects.create(usuario=self.admin, rol=self.rol_admin)
        self.dirigente = Usuario.objects.create(email='dirigente@test.com', nombre='Dirigente', apellido='Test', nro_documento='55555555', contrasena=make_password('dirigente123'))
        UsuarioRol.objects.create(usuario=self.dirigente, rol=self.rol_dirigente)
    
    def _generar_token(self, usuario):
        payload = {'id': usuario.id, 'email': usuario.email, 'exp': datetime.utcnow() + timedelta(hours=24)}
        return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    
    def _autenticar_cliente(self, usuario):
        token = self._generar_token(usuario)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    # ==================== TESTS DE HACERSE SOCIO ====================
    
    def test_hacerse_socio_exitoso(self):
        self._autenticar_cliente(self.usuario)
        response = self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/hacerse_socio/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        socio_info = SocioInfo.objects.get(usuario=self.usuario)
        self.assertEqual(socio_info.estado, 'activo')
        self.assertFalse(Cuota.objects.filter(usuario=self.usuario).exists())
    
    def test_hacerse_socio_duplicado(self):
        self._autenticar_cliente(self.usuario)
        self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/hacerse_socio/')
        response = self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/hacerse_socio/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    # ==================== TESTS DE INACTIVACIÓN ====================
    
    def test_inactivar_socio_por_admin(self):
        UsuarioRol.objects.create(usuario=self.usuario, rol=self.rol_socio)
        SocioInfo.objects.create(usuario=self.usuario, nivel_socio=self.nivel_1, estado='activo')
        self._autenticar_cliente(self.admin)
        response = self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/inactivar-socio/', {'razon': 'Falta de pago'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        socio_info = SocioInfo.objects.get(usuario=self.usuario)
        self.assertEqual(socio_info.estado, 'inactivo')
        self.assertTrue(response.data['socio_info']['cuota_al_dia'])
    
    def test_inactivar_socio_por_dirigente(self):
        """Test: Dirigente puede inactivar un socio"""
        # Crear socio
        UsuarioRol.objects.create(usuario=self.usuario, rol=self.rol_socio)
        SocioInfo.objects.create(
            usuario=self.usuario,
            nivel_socio=self.nivel_1,
            estado='activo'
        )
        
        # Autenticar como dirigente
        self._autenticar_cliente(self.dirigente)
        
        response = self.client.post(
            f'/socios/api/v1/usuarios/{self.usuario.id}/inactivar-socio/',
            {'razon': 'Baja voluntaria'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_inactivar_socio_no_autorizado(self):
        """Test: Usuario normal no puede inactivar socios"""
        UsuarioRol.objects.create(usuario=self.usuario, rol=self.rol_socio)
        SocioInfo.objects.create(usuario=self.usuario, nivel_socio=self.nivel_1, estado='activo')
        otro_usuario = Usuario.objects.create(email='otro@test.com', nro_documento='11111111', contrasena=make_password('password123'))
        self._autenticar_cliente(otro_usuario)
        response = self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/inactivar-socio/', {'razon': 'Intento no autorizado'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_inactivar_socio_ya_inactivo(self):
        """Test: No se puede inactivar un socio ya inactivo"""
        # Crear socio inactivo
        UsuarioRol.objects.create(usuario=self.usuario, rol=self.rol_socio)
        SocioInfo.objects.create(
            usuario=self.usuario,
            nivel_socio=self.nivel_1,
            estado='inactivo'
        )
        
        self._autenticar_cliente(self.admin)
        
        response = self.client.post(
            f'/socios/api/v1/usuarios/{self.usuario.id}/inactivar-socio/',
            {'razon': 'Test'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('ya está inactivo', response.data['error'])
    
    # ==================== TESTS DE REACTIVACIÓN ====================
    
    def test_reactivar_socio_sin_deuda(self):
        UsuarioRol.objects.create(usuario=self.usuario, rol=self.rol_socio)
        SocioInfo.objects.create(usuario=self.usuario, nivel_socio=self.nivel_1, estado='inactivo')
        self._autenticar_cliente(self.usuario)
        response = self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/hacerse_socio/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        socio_info = SocioInfo.objects.get(usuario=self.usuario)
        self.assertEqual(socio_info.estado, 'activo')
        self.assertTrue(response.data['socio_info']['cuota_al_dia'])
        self.assertFalse(Cuota.objects.filter(usuario=self.usuario).exists())
    
    def test_reactivar_socio_con_deuda_bloqueado(self):
        UsuarioRol.objects.create(usuario=self.usuario, rol=self.rol_socio)
        SocioInfo.objects.create(usuario=self.usuario, nivel_socio=self.nivel_1, estado='inactivo')
        Cuota.objects.create(usuario=self.usuario, periodo='2024-09', monto=VALOR_CUOTA_BASE, vencimiento=(timezone.now() - timedelta(days=15)).date())
        self._autenticar_cliente(self.usuario)
        response = self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/hacerse_socio/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cuotas pendientes de pago', response.data['error'])
    
    def test_reactivar_socio_deuda_pagada(self):
        """Test: Socio con deuda pagada puede reactivarse"""
        # Crear socio inactivo
        UsuarioRol.objects.create(usuario=self.usuario, rol=self.rol_socio)
        SocioInfo.objects.create(
            usuario=self.usuario,
            nivel_socio=self.nivel_1,
            estado='inactivo'
        )
        
        # Crear cuota pagada
        cuota = Cuota.objects.create(
            usuario=self.usuario,
            periodo='2024-09',
            monto=VALOR_CUOTA_BASE,
            vencimiento=(timezone.now() - timedelta(days=15)).date(),
            descuento_aplicado=0
        )
        
        # Registrar pago completado
        Pago.objects.create(
            cuota=cuota,
            monto=VALOR_CUOTA_BASE,
            estado='completado',
            medio_pago='efectivo',
            fecha=timezone.now()
        )
        
        self._autenticar_cliente(self.usuario)

        response = self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/hacerse_socio/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Socio reactivado exitosamente.')
        
        # Verificar reactivación
        socio_info = SocioInfo.objects.get(usuario=self.usuario)
        self.assertEqual(socio_info.estado, 'activo')
    
    def test_reactivar_socio_con_multiples_deudas(self):
        """Test: Socio con múltiples cuotas pendientes es bloqueado"""
        # Crear socio inactivo
        UsuarioRol.objects.create(usuario=self.usuario, rol=self.rol_socio)
        SocioInfo.objects.create(
            usuario=self.usuario,
            nivel_socio=self.nivel_1,
            estado='inactivo'
        )
        
        # Crear múltiples cuotas sin pagar
        for i in range(3):
            Cuota.objects.create(
                usuario=self.usuario,
                periodo=f'2024-{9-i:02d}',
                monto=VALOR_CUOTA_BASE,
                vencimiento=(timezone.now() - timedelta(days=30*(i+1))).date(),
                descuento_aplicado=0
            )
        
        self._autenticar_cliente(self.usuario)

        response = self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/hacerse_socio/')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['deuda_total'], 45000.00)
        self.assertEqual(len(response.data['cuotas_pendientes']), 3)
    
    # ==================== TESTS DE VALIDACIÓN ====================
    
    def test_inactivar_usuario_sin_socioinfo(self):
        """Test: No se puede inactivar usuario que no es socio"""
        self._autenticar_cliente(self.admin)
        
        response = self.client.post(
            f'/socios/api/v1/usuarios/{self.usuario.id}/inactivar-socio/',
            {'razon': 'Test'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('no es un socio', response.data['error'])
    
    def test_hacerse_socio_sin_nivel_inicial(self):
        """Test: Error si no existe nivel inicial configurado"""
        # Eliminar niveles
        NivelSocio.objects.all().delete()
        
        self._autenticar_cliente(self.usuario)

        response = self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/hacerse_socio/')

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('configuración inicial', response.data['error'].lower())
    
    def test_socio_info_str_method(self):
        """Test: Método __str__ de SocioInfo muestra estado"""
        socio_info = SocioInfo.objects.create(
            usuario=self.usuario,
            nivel_socio=self.nivel_1,
            estado='activo'
        )
        
        str_repr = str(socio_info)
        # Verificar que incluye el nombre del usuario y el estado
        self.assertIn('Juan', str_repr)
        self.assertIn('Pérez', str_repr)
        self.assertIn('activo', str_repr)

    
    # ==================== TESTS DE INTEGRACIÓN ====================
    
    def test_flujo_completo_socio_lifecycle(self):
        """Test: Flujo completo del ciclo de vida de un socio"""
        self._autenticar_cliente(self.usuario)
        
        # 1. Hacerse socio
        response = self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/hacerse_socio/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        socio_info = SocioInfo.objects.get(usuario=self.usuario)
        self.assertEqual(socio_info.estado, 'activo')
        
        # 2. Admin inactiva por falta de pago
        self._autenticar_cliente(self.admin)
        response = self.client.post(
            f'/socios/api/v1/usuarios/{self.usuario.id}/inactivar-socio/',
            {'razon': 'Falta de pago'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        socio_info.refresh_from_db()
        self.assertEqual(socio_info.estado, 'inactivo')

        # Creamos la cuota que el socio "no pagó" y por la cual fue inactivado.
        Cuota.objects.create(
            usuario=self.usuario,
            periodo='2025-10',
            monto=VALOR_CUOTA_BASE,
            vencimiento=(timezone.now() - timedelta(days=30)).date()
        )
        
        # 3. Usuario intenta reactivarse con deuda
        self._autenticar_cliente(self.usuario)
        response = self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/hacerse_socio/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # 4. Admin registra pago
        cuota = Cuota.objects.get(usuario=self.usuario)
        Pago.objects.create(
            cuota=cuota,
            monto=cuota.monto,
            estado='completado',
            medio_pago='transferencia',
            fecha=timezone.now()
        )
        
        # 5. Usuario se reactiva exitosamente
        response = self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/hacerse_socio/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        socio_info.refresh_from_db()
        self.assertEqual(socio_info.estado, 'activo')
        self.assertIsNone(socio_info.fecha_inactivacion)


    def test_listar_socios_devuelve_datos_completos(self):
        """Test: El endpoint de lista devuelve información completa de socios CON disciplina"""
        # Crear disciplina y categoría
        disciplina = Disciplina.objects.create(nombre='Fútbol', descripcion='Fútbol 11')
        categoria = Categoria.objects.create(nombre_categoria='Primera', disciplina=disciplina, edad_minima=18, edad_maxima=35, sexo='masculino')
        
        # Crear socio
        UsuarioRol.objects.create(usuario=self.usuario, rol=self.rol_socio)
        SocioInfo.objects.create(
            usuario=self.usuario,
            nivel_socio=self.nivel_1,
            disciplina=disciplina,
            categoria=categoria,
            estado='activo'
        )
        
        # Autenticar como admin
        self._autenticar_cliente(self.admin)
        
        response = self.client.get('/socios/api/v1/socios-info/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
        
        # Verificar que la respuesta contiene los campos necesarios
        socio_data = response.data[0]
        self.assertIn('nombre_completo', socio_data)
        self.assertIn('email', socio_data)
        self.assertIn('nro_documento', socio_data)
        self.assertIn('telefono', socio_data)
        self.assertIn('disciplina_nombre', socio_data)
        self.assertIn('categoria_nombre', socio_data)
        self.assertIn('nivel_socio_info', socio_data)
        
        # Verificar formato y valores
        self.assertEqual(socio_data['nombre_completo'], 'Juan Pérez')
        self.assertEqual(socio_data['email'], 'socio@test.com')
        self.assertEqual(socio_data['disciplina_nombre'], 'Fútbol')
        self.assertEqual(socio_data['categoria_nombre'], 'Primera')
        self.assertIsNotNone(socio_data['nivel_socio_info'])

    def test_socio_normal_no_puede_listar_toda_la_info_de_socios(self):
        """Test: Un usuario con solo rol 'socio' no puede acceder a la lista de SocioInfo."""
        # Hacer que el usuario sea socio
        UsuarioRol.objects.create(usuario=self.usuario, rol=self.rol_socio)
        SocioInfo.objects.create(
            usuario=self.usuario,
            nivel_socio=self.nivel_1,
            estado='activo'
        )

        # Autenticar como el socio
        self._autenticar_cliente(self.usuario)

        # Intentar acceder a la lista de todos los socios
        response = self.client.get('/socios/api/v1/socios-info/')
        
        # El resultado esperado es un 403 Forbidden, ya que no tiene permisos
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_usuario_no_puede_actualizar_perfil_deportivo_de_otro(self):
        """Test: Un usuario no puede cambiar la disciplina/categoría de otro usuario."""
        # Crear dos socios
        socio1_info = SocioInfo.objects.create(usuario=self.usuario, estado='activo', nivel_socio=self.nivel_1)

        otro_usuario = Usuario.objects.create(email='otro@test.com', nombre='Otro', apellido='Usuario', nro_documento='22222222', tipo_documento='DNI', contrasena=make_password('password123'))
        socio2_info = SocioInfo.objects.create(usuario=otro_usuario, estado='activo', nivel_socio=self.nivel_1)

        disciplina = Disciplina.objects.create(nombre='Natación')
        categoria = Categoria.objects.create(nombre_categoria='Juvenil', disciplina=disciplina, edad_minima=12, edad_maxima=17, sexo='femenino')

        # Autenticar como el primer socio
        self._autenticar_cliente(self.usuario)

        # Intentar modificar el perfil del OTRO socio (esto no debería ser posible a través del endpoint 'me')
        # La prueba aquí es más conceptual: la ruta '/me/' ya previene esto.
        # Una prueba más explícita sería si tuvieras una ruta como /usuarios/{id}/actualizar-perfil-deportivo/
        # En este caso, el test confirma que la única ruta disponible es /me/.
        
        # Simulemos una llamada a una URL que NO debería existir
        response = self.client.put(
            f'/socios/api/v1/usuarios/{otro_usuario.id}/actualizar-perfil-deportivo/',
            {'disciplina_id': disciplina.id, 'categoria_id': categoria.id}
        )
        
        # Esta ruta no debería existir, resultando en un 404 Not Found
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_reactivar_socio_con_pago_pendiente_falla(self):
        """Test: Un socio inactivo con una cuota cuyo pago está pendiente NO puede reactivarse."""
        # Crear socio inactivo
        UsuarioRol.objects.create(usuario=self.usuario, rol=self.rol_socio)
        SocioInfo.objects.create(usuario=self.usuario, nivel_socio=self.nivel_1, estado='inactivo')
        
        # Crear cuota vencida
        cuota = Cuota.objects.create(
            usuario=self.usuario,
            periodo='2024-09',
            monto=VALOR_CUOTA_BASE,
            vencimiento=(timezone.now() - timedelta(days=15)).date()
        )
        
        # Registrar un pago en estado 'pendiente' para esa cuota
        Pago.objects.create(
            cuota=cuota,
            monto=VALOR_CUOTA_BASE,
            estado='pendiente',  # Estado clave de este test
            medio_pago='mercadopago'
        )
        
        self._autenticar_cliente(self.usuario)
        response = self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/hacerse_socio/')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cuotas pendientes de pago', response.data['error'])



         # ==================== TESTS DE ACTIVACIÓN POR ADMIN ====================
    
    def test_admin_puede_activar_socio_con_deuda(self):
        UsuarioRol.objects.create(usuario=self.usuario, rol=self.rol_socio)
        SocioInfo.objects.create(usuario=self.usuario, nivel_socio=self.nivel_1, estado='inactivo')
        
        # 👇 CORRECCIÓN AQUÍ: Añadido 'vencimiento'
        Cuota.objects.create(
            usuario=self.usuario, periodo='2024-09', monto=VALOR_CUOTA_BASE,
            vencimiento=(timezone.now() - timedelta(days=60)).date()
        )
        Cuota.objects.create(
            usuario=self.usuario, periodo='2024-10', monto=VALOR_CUOTA_BASE,
            vencimiento=(timezone.now() - timedelta(days=30)).date()
        )
        
        self._autenticar_cliente(self.admin)
        response = self.client.post(
            f'/socios/api/v1/usuarios/{self.usuario.id}/activar-socio/',
            {'medio_pago': 'efectivo', 'comprobante': 'Recibo #1234'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['pagos_registrados'], 2)
        
        socio_info = SocioInfo.objects.get(usuario=self.usuario)
        self.assertEqual(socio_info.estado, 'activo')
        self.assertTrue(response.data['socio_info']['cuota_al_dia'])
        self.assertEqual(Pago.objects.filter(cuota__usuario=self.usuario).count(), 2)

    def test_activar_socio_falla_sin_medio_pago(self):
        UsuarioRol.objects.create(usuario=self.usuario, rol=self.rol_socio)
        SocioInfo.objects.create(usuario=self.usuario, nivel_socio=self.nivel_1, estado='inactivo')
        
        # 👇 CORRECCIÓN AQUÍ: Añadido 'vencimiento'
        Cuota.objects.create(
            usuario=self.usuario, periodo='2024-09', monto=VALOR_CUOTA_BASE,
            vencimiento=(timezone.now() - timedelta(days=60)).date()
        )
        
        self._autenticar_cliente(self.admin)
        response = self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/activar-socio/', {})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('medio de pago', response.data['error'])
        
        socio_info = SocioInfo.objects.get(usuario=self.usuario)
        self.assertEqual(socio_info.estado, 'inactivo')
        self.assertEqual(Pago.objects.count(), 0)




# Para ejecutar los tests:
# python manage.py test socios.tests.test_socios