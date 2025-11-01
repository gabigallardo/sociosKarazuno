# socios/tests/test_socios.py

from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.utils import timezone
from datetime import timedelta, datetime
import jwt
from django.conf import settings
from django.contrib.auth.hashers import make_password

from socios.models import (
    Usuario, Rol, UsuarioRol, NivelSocio, SocioInfo, 
    Cuota, Pago, Disciplina, Categoria
)


class SocioSistemaTestCase(APITestCase):
    """Tests completos para el sistema de socios con estados activo/inactivo"""
    
    def setUp(self):
        """Configuración inicial para todos los tests"""
        self.client = APIClient()
        
        # Crear o obtener roles (evita duplicados)
        self.rol_socio, _ = Rol.objects.get_or_create(
            nombre='socio',
            defaults={'descripcion': 'Socio del club'}
        )
        self.rol_admin, _ = Rol.objects.get_or_create(
            nombre='admin',
            defaults={'descripcion': 'Administrador'}
        )
        self.rol_dirigente, _ = Rol.objects.get_or_create(
            nombre='dirigente',
            defaults={'descripcion': 'Dirigente'}
        )
        
        # Crear o obtener niveles de socio (evita duplicados)
        self.nivel_1, _ = NivelSocio.objects.get_or_create(
            nivel=1,
            defaults={
                'descuento': 0,
                'descripcion': 'Nivel inicial'
            }
        )
        self.nivel_2, _ = NivelSocio.objects.get_or_create(
            nivel=2,
            defaults={
                'descuento': 10,
                'descripcion': 'Nivel intermedio'
            }
        )
        
        # Crear usuario normal
        self.usuario = Usuario.objects.create(
            tipo_documento='DNI',
            nro_documento='12345678',
            email='socio@test.com',
            nombre='Juan',
            apellido='Pérez',
            telefono='123456789',
            activo=True,
            contrasena=make_password('password123')
        )
        
        # Crear admin
        self.admin = Usuario.objects.create(
            tipo_documento='DNI',
            nro_documento='87654321',
            email='admin@test.com',
            nombre='Admin',
            apellido='Test',
            telefono='987654321',
            activo=True,
            contrasena=make_password('admin123')
        )
        UsuarioRol.objects.create(usuario=self.admin, rol=self.rol_admin)
        
        # Crear dirigente
        self.dirigente = Usuario.objects.create(
            tipo_documento='DNI',
            nro_documento='55555555',
            email='dirigente@test.com',
            nombre='Dirigente',
            apellido='Test',
            telefono='555555555',
            activo=True,
            contrasena=make_password('dirigente123')
        )
        UsuarioRol.objects.create(usuario=self.dirigente, rol=self.rol_dirigente)
    
    def _generar_token(self, usuario):
        """Helper para generar token JWT"""
        payload = {
            'id': usuario.id,
            'email': usuario.email,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    
    def _autenticar_cliente(self, usuario):
        """Helper para autenticar el cliente API"""
        token = self._generar_token(usuario)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    # ==================== TESTS DE HACERSE SOCIO ====================
    
    def test_hacerse_socio_exitoso(self):
        """Test: Usuario se convierte en socio correctamente"""
        self._autenticar_cliente(self.usuario)
        
        response = self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/hacerse_socio/')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'El usuario ahora es socio.')
        self.assertTrue(response.data['cuota_generada'])
        
        # Verificar que se creó SocioInfo
        self.assertTrue(SocioInfo.objects.filter(usuario=self.usuario).exists())
        socio_info = SocioInfo.objects.get(usuario=self.usuario)
        self.assertEqual(socio_info.estado, 'activo')
        self.assertEqual(socio_info.nivel_socio, self.nivel_1)
        
        # Verificar que se asignó el rol
        self.assertTrue(UsuarioRol.objects.filter(usuario=self.usuario, rol=self.rol_socio).exists())
        
        # Verificar que se generó la cuota
        self.assertTrue(Cuota.objects.filter(usuario=self.usuario).exists())
        cuota = Cuota.objects.get(usuario=self.usuario)
        self.assertEqual(cuota.monto, 15000.00)
    
    def test_hacerse_socio_duplicado(self):
        """Test: No se puede hacer socio dos veces si ya está activo"""
        self._autenticar_cliente(self.usuario)
        
        # Primer intento - exitoso
        self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/hacerse_socio/')
        
        # Segundo intento - debe fallar
        response = self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/hacerse_socio/')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('ya es socio activo', response.data['error'])
    
    # ==================== TESTS DE INACTIVACIÓN ====================
    
    def test_inactivar_socio_por_admin(self):
        """Test: Admin puede inactivar un socio"""
        # Crear socio
        UsuarioRol.objects.create(usuario=self.usuario, rol=self.rol_socio)
        SocioInfo.objects.create(
            usuario=self.usuario,
            nivel_socio=self.nivel_1,
            estado='activo'
        )
        
        # Autenticar como admin
        self._autenticar_cliente(self.admin)
        
        response = self.client.post(
            f'/socios/api/v1/usuarios/{self.usuario.id}/inactivar-socio/',
            {'razon': 'Falta de pago'}
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Socio inactivado exitosamente.')
        
        # Verificar cambio de estado
        socio_info = SocioInfo.objects.get(usuario=self.usuario)
        self.assertEqual(socio_info.estado, 'inactivo')
        self.assertIsNotNone(socio_info.fecha_inactivacion)
        self.assertEqual(socio_info.razon_inactivacion, 'Falta de pago')
        self.assertFalse(socio_info.cuota_al_dia)
    
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
        # Crear socio
        UsuarioRol.objects.create(usuario=self.usuario, rol=self.rol_socio)
        SocioInfo.objects.create(
            usuario=self.usuario,
            nivel_socio=self.nivel_1,
            estado='activo'
        )
        
        # Crear otro usuario sin permisos
        otro_usuario = Usuario.objects.create(
            tipo_documento='DNI',
            nro_documento='11111111',
            email='otro@test.com',
            nombre='Otro',
            apellido='Usuario',
            telefono='111111111',
            activo=True,
            contrasena=make_password('password123')
        )
        
        self._autenticar_cliente(otro_usuario)
        
        response = self.client.post(
            f'/socios/api/v1/usuarios/{self.usuario.id}/inactivar-socio/',
            {'razon': 'Intento no autorizado'}
        )
        
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
        """Test: Socio inactivo sin deuda puede reactivarse"""
        # Crear socio inactivo
        UsuarioRol.objects.create(usuario=self.usuario, rol=self.rol_socio)
        SocioInfo.objects.create(
            usuario=self.usuario,
            nivel_socio=self.nivel_1,
            estado='inactivo',
            fecha_inactivacion=timezone.now() - timedelta(days=30)
        )
        
        self._autenticar_cliente(self.usuario)

        response = self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/hacerse_socio/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Socio reactivado exitosamente.')
        self.assertTrue(response.data['cuota_generada'])
        
        # Verificar reactivación
        socio_info = SocioInfo.objects.get(usuario=self.usuario)
        self.assertEqual(socio_info.estado, 'activo')
        self.assertIsNone(socio_info.fecha_inactivacion)
        self.assertIsNone(socio_info.razon_inactivacion)
        self.assertTrue(socio_info.cuota_al_dia)
        
        # Verificar que se generó nueva cuota
        cuotas = Cuota.objects.filter(usuario=self.usuario)
        self.assertEqual(cuotas.count(), 1)
    
    def test_reactivar_socio_con_deuda_bloqueado(self):
        """Test: Socio inactivo con deuda NO puede reactivarse"""
        # Crear socio inactivo con cuota pendiente
        UsuarioRol.objects.create(usuario=self.usuario, rol=self.rol_socio)
        SocioInfo.objects.create(
            usuario=self.usuario,
            nivel_socio=self.nivel_1,
            estado='inactivo'
        )
        
        # Crear cuota vencida sin pagar
        Cuota.objects.create(
            usuario=self.usuario,
            periodo='2024-09',
            monto=15000.00,
            vencimiento=(timezone.now() - timedelta(days=15)).date(),
            descuento_aplicado=0
        )
        
        self._autenticar_cliente(self.usuario)

        response = self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/hacerse_socio/')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cuotas pendientes de pago', response.data['error'])
        self.assertEqual(response.data['deuda_total'], 15000.00)
        self.assertEqual(len(response.data['cuotas_pendientes']), 1)
        
        # Verificar que sigue inactivo
        socio_info = SocioInfo.objects.get(usuario=self.usuario)
        self.assertEqual(socio_info.estado, 'inactivo')
    
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
            monto=15000.00,
            vencimiento=(timezone.now() - timedelta(days=15)).date(),
            descuento_aplicado=0
        )
        
        # Registrar pago completado
        Pago.objects.create(
            cuota=cuota,
            monto=15000.00,
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
                monto=15000.00,
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
            monto=15000.00,
            vencimiento=(timezone.now() - timedelta(days=15)).date()
        )
        
        # Registrar un pago en estado 'pendiente' para esa cuota
        Pago.objects.create(
            cuota=cuota,
            monto=15000.00,
            estado='pendiente',  # Estado clave de este test
            medio_pago='mercadopago'
        )
        
        self._autenticar_cliente(self.usuario)
        response = self.client.post(f'/socios/api/v1/usuarios/{self.usuario.id}/hacerse_socio/')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cuotas pendientes de pago', response.data['error'])



        # ==================== TESTS DE ACTIVACIÓN POR ADMIN ====================
    
    def test_admin_puede_activar_socio_con_deuda(self):
        """Test: Admin puede activar un socio inactivo que tiene cuotas pendientes."""
        # ARRANGE: Crear un socio inactivo con dos cuotas pendientes
        UsuarioRol.objects.create(usuario=self.usuario, rol=self.rol_socio)
        SocioInfo.objects.create(usuario=self.usuario, nivel_socio=self.nivel_1, estado='inactivo')
        
        Cuota.objects.create(
            usuario=self.usuario, periodo='2024-09', monto=15000.00,
            vencimiento=(timezone.now() - timedelta(days=60)).date()
        )
        Cuota.objects.create(
            usuario=self.usuario, periodo='2024-10', monto=15000.00,
            vencimiento=(timezone.now() - timedelta(days=30)).date()
        )
        
        self.assertEqual(Pago.objects.filter(cuota__usuario=self.usuario).count(), 0)
        
        # ACT: Autenticar como admin y llamar al endpoint con los datos del pago
        self._autenticar_cliente(self.admin)
        
        response = self.client.post(
            f'/socios/api/v1/usuarios/{self.usuario.id}/activar-socio/',
            {'medio_pago': 'efectivo', 'comprobante': 'Recibo #1234'}
        )
        
        # ASSERT: Verificar que la operación fue exitosa y los datos son correctos
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Socio activado exitosamente.')
        self.assertEqual(response.data['pagos_registrados'], 2)
        
        # Verificar que el socio ahora está activo
        socio_info = SocioInfo.objects.get(usuario=self.usuario)
        self.assertEqual(socio_info.estado, 'activo')
        self.assertTrue(socio_info.cuota_al_dia)
        
        # Verificar que se crearon los pagos para las cuotas pendientes
        pagos_creados = Pago.objects.filter(cuota__usuario=self.usuario)
        self.assertEqual(pagos_creados.count(), 2)
        self.assertTrue(all(p.estado == 'completado' for p in pagos_creados))
        self.assertTrue(all(p.medio_pago == 'efectivo' for p in pagos_creados))

    def test_activar_socio_falla_sin_medio_pago(self):
        """Test: Activar un socio falla si no se provee el medio de pago en el request."""
        # ARRANGE: Crear un socio inactivo con una cuota pendiente
        UsuarioRol.objects.create(usuario=self.usuario, rol=self.rol_socio)
        SocioInfo.objects.create(usuario=self.usuario, nivel_socio=self.nivel_1, estado='inactivo')
        Cuota.objects.create(
            usuario=self.usuario, periodo='2024-09', monto=15000.00,
            vencimiento=(timezone.now() - timedelta(days=60)).date()
        )
        
        # ACT: Autenticar como admin y llamar al endpoint sin datos de pago
        self._autenticar_cliente(self.admin)
        response = self.client.post(
            f'/socios/api/v1/usuarios/{self.usuario.id}/activar-socio/', 
            {}  # Body vacío
        )
        
        # ASSERT: Verificar que la API rechaza la solicitud
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('medio de pago', response.data['error'])
        
        # Verificar que el socio sigue inactivo y no se crearon pagos
        socio_info = SocioInfo.objects.get(usuario=self.usuario)
        self.assertEqual(socio_info.estado, 'inactivo')
        self.assertEqual(Pago.objects.count(), 0)





# Para ejecutar los tests:
# python manage.py test socios.tests.test_socios