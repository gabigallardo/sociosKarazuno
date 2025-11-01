# socios/management/commands/generar_cuotas_historicas.py

import sys
from datetime import date
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from django.db import transaction, models
from django.conf import settings
from socios.models import SocioInfo, Cuota, Usuario

class Command(BaseCommand):
    help = """
    Genera cuotas histÃ³ricas para socios activos en un rango de fechas.
    ÃšTIL PARA TESTING Y DESARROLLO. No debe usarse en producciÃ³n sin supervisiÃ³n.
    Ejemplo: manage.py generar_cuotas_historicas --ano-inicio 2025 --mes-inicio 1
    """

    def add_arguments(self, parser):
        """AÃ±ade argumentos personalizables al comando."""
        hoy = timezone.now().date()
        parser.add_argument(
            '--ano-inicio',
            type=int,
            default=hoy.year,
            help='AÃ±o de inicio para generar cuotas (por defecto: aÃ±o actual).'
        )
        parser.add_argument(
            '--mes-inicio',
            type=int,
            default=1,
            help='Mes de inicio para generar cuotas (por defecto: 1).'
        )
        parser.add_argument(
            '--ano-fin',
            type=int,
            default=hoy.year,
            help='AÃ±o de fin para generar cuotas (por defecto: aÃ±o actual).'
        )
        parser.add_argument(
            '--mes-fin',
            type=int,
            default=hoy.month,
            help='Mes de fin para generar cuotas (por defecto: mes actual).'
        )
        parser.add_argument(
            '--usuario',
            type=str,
            required=False,
            help='Email o ID del usuario especÃ­fico para generar cuotas.'
        )
        parser.add_argument(
            '--forzar',
            action='store_true',
            help='Salta la confirmaciÃ³n antes de crear las cuotas.'
        )

    def handle(self, *args, **options):
        """LÃ³gica principal del comando."""
        # --- 1. Extraer y validar argumentos ---
        ano_inicio, mes_inicio = options['ano_inicio'], options['mes_inicio']
        ano_fin, mes_fin = options['ano_fin'], options['mes_fin']
        email_o_id_usuario = options['usuario']
        forzar = options['forzar']
        
        try:
            fecha_inicio = date(ano_inicio, mes_inicio, 1)
            fecha_fin = date(ano_fin, mes_fin, 1)
        except ValueError:
            raise CommandError("Fechas invÃ¡lidas. Verifica el aÃ±o y el mes.")

        if fecha_inicio > fecha_fin:
            raise CommandError("La fecha de inicio no puede ser posterior a la fecha de fin.")

        # --- 2. Obtener los socios a procesar ---
        socios_a_procesar = SocioInfo.objects.filter(estado='activo').select_related('usuario', 'nivel_socio')

        if email_o_id_usuario:
            try:
                # Intenta buscar por email o por ID
                if '@' in email_o_id_usuario:
                    usuario = Usuario.objects.get(email=email_o_id_usuario)
                else:
                    usuario = Usuario.objects.get(id=int(email_o_id_usuario))
                
                socios_a_procesar = socios_a_procesar.filter(usuario=usuario)
                if not socios_a_procesar.exists():
                    raise CommandError(f"No se encontrÃ³ un socio activo con el identificador '{email_o_id_usuario}'.")
            except Usuario.DoesNotExist:
                raise CommandError(f"El usuario '{email_o_id_usuario}' no existe.")
            except ValueError:
                raise CommandError("El ID de usuario debe ser un nÃºmero.")

        if not socios_a_procesar.exists():
            self.stdout.write(self.style.WARNING("No hay socios activos que cumplan los criterios para procesar."))
            return

        # --- 3. Preparar las cuotas a crear ---
        MONTO_BASE = getattr(settings, 'VALOR_CUOTA_BASE', 15000.00)
        DIA_VENCIMIENTO = getattr(settings, 'DIA_VENCIMIENTO_CUOTA', 5)
        
        cuotas_a_crear = []
        cuotas_duplicadas = 0

        # Iterar por cada socio
        for socio_info in socios_a_procesar:
            # Iterar por cada mes en el rango
            fecha_actual = fecha_inicio
            while fecha_actual <= fecha_fin:
                periodo = fecha_actual.strftime("%Y-%m")
                
                # Comprobar si la cuota ya existe
                if Cuota.objects.filter(usuario=socio_info.usuario, periodo=periodo).exists():
                    cuotas_duplicadas += 1
                else:
                    descuento = socio_info.nivel_socio.descuento if socio_info.nivel_socio else 0
                    monto_final = MONTO_BASE * (1 - descuento / 100)
                    
                    # Calcular vencimiento (dÃ­a 5 del mes siguiente al perÃ­odo)
                    vencimiento_mes = fecha_actual.month + 1
                    vencimiento_ano = fecha_actual.year
                    if vencimiento_mes > 12:
                        vencimiento_mes = 1
                        vencimiento_ano += 1
                    vencimiento = date(vencimiento_ano, vencimiento_mes, DIA_VENCIMIENTO)

                    cuotas_a_crear.append(
                        Cuota(
                            usuario=socio_info.usuario,
                            periodo=periodo,
                            monto=monto_final,
                            vencimiento=vencimiento,
                            descuento_aplicado=descuento
                        )
                    )
                
                # Avanzar al siguiente mes
                if fecha_actual.month == 12:
                    fecha_actual = date(fecha_actual.year + 1, 1, 1)
                else:
                    fecha_actual = date(fecha_actual.year, fecha_actual.month + 1, 1)

        # --- 4. ConfirmaciÃ³n y ejecuciÃ³n ---
        if not cuotas_a_crear:
            self.stdout.write(self.style.SUCCESS("No hay cuotas nuevas para generar. Todos los socios ya tienen sus cuotas para los perÃ­odos especificados."))
            if cuotas_duplicadas > 0:
                self.stdout.write(self.style.WARNING(f"Se omitieron {cuotas_duplicadas} cuotas que ya existÃ­an."))
            return

        self.stdout.write(self.style.WARNING(f"Se van a generar {len(cuotas_a_crear)} nuevas cuotas."))
        if cuotas_duplicadas > 0:
            self.stdout.write(self.style.WARNING(f"Se omitirÃ¡n {cuotas_duplicadas} cuotas que ya existen."))

        if not forzar:
            confirmacion = input("Â¿EstÃ¡s seguro de que quieres continuar? [y/N]: ")
            if confirmacion.lower() != 'y':
                self.stdout.write(self.style.ERROR("OperaciÃ³n cancelada por el usuario."))
                return

        try:
            with transaction.atomic():
                Cuota.objects.bulk_create(cuotas_a_crear)
            
            self.stdout.write(self.style.SUCCESS(f"âœ… Ã‰XITO: Se generaron {len(cuotas_a_crear)} cuotas histÃ³ricas."))
        except Exception as e:
            raise CommandError(f"âŒ Error durante la creaciÃ³n masiva. La operaciÃ³n fue revertida. Detalle: {str(e)}")