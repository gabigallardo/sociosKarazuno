from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth.hashers import make_password
from datetime import date, timedelta, datetime # Agregado datetime
import jwt # Agregado jwt
from django.conf import settings # Agregado settings
from socios.models import (
    Usuario, Rol, UsuarioRol, Disciplina, Categoria, 
    HorarioEntrenamiento, SesionEntrenamiento, AsistenciaEntrenamiento, 
    SocioInfo, NivelSocio
)

class GestionEntrenamientosTestCase(APITestCase):
    
    def setUp(self):
        self.client = APIClient()
        
        # 1. Configuración de Roles y Usuarios
        self.rol_admin, _ = Rol.objects.get_or_create(nombre='admin')
        self.rol_socio, _ = Rol.objects.get_or_create(nombre='socio')
        
        self.admin = Usuario.objects.create(
            email='admin@test.com', nombre='Admin', apellido='User', 
            contrasena=make_password('123')
        )
        UsuarioRol.objects.create(usuario=self.admin, rol=self.rol_admin)
        
        self.jugador = Usuario.objects.create(
            email='jugador@test.com', nombre='Leo', apellido='Messi', 
            nro_documento='10101010', contrasena=make_password('123')
        )
        UsuarioRol.objects.create(usuario=self.jugador, rol=self.rol_socio)

        # 2. Configuración de Disciplina y Categoría
        self.disciplina = Disciplina.objects.create(nombre='Fútbol')
        self.categoria = Categoria.objects.create(
            nombre_categoria='Sub-20', disciplina=self.disciplina, 
            edad_minima=18, edad_maxima=20, sexo='masculino'
        )
        
        # 3. Asignar Jugador a la Categoría
        self.nivel_1, _ = NivelSocio.objects.get_or_create(nivel=1, defaults={'descuento': 0})
        SocioInfo.objects.create(
            usuario=self.jugador, nivel_socio=self.nivel_1, 
            disciplina=self.disciplina, categoria=self.categoria, estado='activo'
        )

        # 4. Crear un Horario de Entrenamiento (Lunes de 18:00 a 20:00)
        self.horario = HorarioEntrenamiento.objects.create(
            categoria=self.categoria,
            dia_semana=0, # 0 = Lunes
            hora_inicio='18:00',
            hora_fin='20:00',
            lugar='Cancha 1',
            activo=True
        )

    def _autenticar_admin(self):
        """Genera un token manual usando la misma lógica que tu auth.py"""
        payload = {
            'id': self.admin.id,
            'email': self.admin.email,
            'exp': datetime.utcnow() + timedelta(hours=1)
        }
        # Usamos tu configuración de settings y algoritmo HS256
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_generar_sesiones_crea_eventos_sin_duplicados(self):
        """
        TEST CRÍTICO 1: Generación de Sesiones
        Verifica que al pedir generar sesiones para un rango de fechas:
        1. Se crean las sesiones correspondientes a los días del horario (Lunes).
        2. Si se vuelve a ejecutar, NO se duplican las sesiones.
        """
        self._autenticar_admin()
        
        # Elegimos un rango que sabemos contiene un Lunes
        # Ej: Lunes 01/01/2024 al Domingo 07/01/2024
        fecha_inicio = date(2024, 1, 1)
        fecha_fin = date(2024, 1, 7)
        
        url = f'/socios/api/v1/categorias/{self.categoria.id}/generar-sesiones/'
        payload = {
            'fecha_inicio': fecha_inicio.isoformat(),
            'fecha_fin': fecha_fin.isoformat()
        }

        # ACT 1: Primera generación
        response = self.client.post(url, payload)
        
        # ASSERT 1
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Debería haber creado 1 sesión (el lunes 1 de enero)
        self.assertEqual(SesionEntrenamiento.objects.count(), 1)
        sesion = SesionEntrenamiento.objects.first()
        self.assertEqual(sesion.fecha, fecha_inicio)
        self.assertEqual(sesion.horario, self.horario)

        # ACT 2: Intentar generar de nuevo para el mismo rango (Idempotencia)
        response_duplicado = self.client.post(url, payload)
        
        # ASSERT 2
        self.assertEqual(response_duplicado.status_code, status.HTTP_201_CREATED)
        # La cantidad total en DB debe seguir siendo 1, no 2
        self.assertEqual(SesionEntrenamiento.objects.count(), 1)

    def test_registrar_asistencia_bulk_actualiza_correctamente(self):
        """
        TEST CRÍTICO 2: Registro de Asistencia Masiva
        Verifica que se puede registrar la asistencia de un jugador en una sesión
        y que queda guardada correctamente vinculada al usuario.
        """
        self._autenticar_admin()
        
        # Crear una sesión manualmente para el test
        sesion = SesionEntrenamiento.objects.create(
            horario=self.horario,
            categoria=self.categoria,
            fecha=date(2024, 1, 1),
            estado='programada'
        )
        
        url = f'/socios/api/v1/sesiones/{sesion.id}/registrar-asistencia/'
        
        # Payload simulando lo que envía el frontend (lista de asistencias)
        payload = {
            "asistencias": [
                {
                    "usuario_id": self.jugador.id,
                    "estado": "presente",
                    "nota": "Llegó puntual"
                }
            ]
        }

        # ACT
        response = self.client.post(url, payload, format='json')
        
        # ASSERT
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verificar en base de datos
        asistencia = AsistenciaEntrenamiento.objects.get(sesion=sesion, usuario=self.jugador)
        self.assertEqual(asistencia.estado, 'presente')
        self.assertEqual(asistencia.nota, 'Llegó puntual')
        self.assertEqual(asistencia.registrado_por, self.admin) # Verifica quién tomó lista
    
    def test_hoja_asistencia_mezcla_correctamente_presentes_y_ausentes(self):
        """
        TEST CRÍTICO 3: Visualización de la Hoja de Asistencia
        Verifica que el endpoint 'hoja-asistencia' devuelve la lista completa de jugadores
        y asigna correctamente el estado 'presente' a quienes ya lo tienen, 
        y 'ausente' por defecto a quienes no tienen registro aún.
        """
        self._autenticar_admin()

        # 1. Preparación: Crear un segundo jugador en la misma categoría
        jugador_2 = Usuario.objects.create(
            email='jugador2@test.com', nombre='Cristiano', apellido='Ronaldo',
            nro_documento='77777777', contrasena=make_password('123')
        )
        UsuarioRol.objects.create(usuario=jugador_2, rol=self.rol_socio)
        SocioInfo.objects.create(
            usuario=jugador_2, nivel_socio=self.nivel_1,
            disciplina=self.disciplina, categoria=self.categoria, estado='activo'
        )

        # 2. Crear una sesión
        sesion = SesionEntrenamiento.objects.create(
            horario=self.horario, categoria=self.categoria,
            fecha=date(2024, 1, 1), estado='programada'
        )

        # 3. Registrar asistencia SOLO para el jugador 1 (Messi)
        AsistenciaEntrenamiento.objects.create(
            sesion=sesion, usuario=self.jugador, 
            estado='presente', registrado_por=self.admin
        )
        # El jugador 2 (Ronaldo) NO tiene registro (implícitamente 'ausente')

        # ACT: Pedir la hoja de asistencia
        url = f'/socios/api/v1/sesiones/{sesion.id}/hoja-asistencia/'
        response = self.client.get(url)

        # ASSERT
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data

        # Deben venir 2 jugadores en total
        self.assertEqual(len(data), 2)

        # Buscamos los datos de cada uno en la respuesta
        datos_messi = next(p for p in data if p['usuario_id'] == self.jugador.id)
        datos_ronaldo = next(p for p in data if p['usuario_id'] == jugador_2.id)

        # Verificamos Messi (debe estar PRESENTE porque lo creamos en el paso 3)
        self.assertEqual(datos_messi['estado'], 'presente')
        
        # Verificamos Ronaldo (debe estar AUSENTE por defecto porque no creamos registro)
        self.assertEqual(datos_ronaldo['estado'], 'ausente')