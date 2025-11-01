# socios/management/commands/generar_cuotas.py

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.db import transaction
from django.conf import settings
from socios.models import SocioInfo, Cuota

class Command(BaseCommand):
    help = 'Genera cuotas mensuales para todos los socios activos de forma atómica y masiva.'
    
    def handle(self, *args, **options):
        periodo_actual = timezone.now().date().strftime("%Y-%m")
        self.stdout.write(self.style.SUCCESS(f'Iniciando generación de cuotas para el período {periodo_actual}...'))
        
        try:
            cuotas_a_crear = []
            socios_activos_ids = set() # Para evitar procesar duplicados si los hubiera
            
            # --- Inicia la transacción ---
            # Si algo falla aquí, todos los cambios se revierten.
            with transaction.atomic():
                
                # 1. Parámetros desde settings para mayor flexibilidad
                MONTO_BASE = getattr(settings, 'VALOR_CUOTA_BASE', 15000.00)
                DIA_VENCIMIENTO = getattr(settings, 'DIA_VENCIMIENTO_CUOTA', 5)
                
                hoy = timezone.now().date()
                vencimiento = (hoy + timedelta(days=35)).replace(day=DIA_VENCIMIENTO)
                
                # 2. Obtener socios activos que aún NO tienen cuota este mes
                socios_activos = SocioInfo.objects.filter(estado='activo') \
                                                  .exclude(usuario__cuotas__periodo=periodo_actual) \
                                                  .select_related('usuario', 'nivel_socio')
                
                total_socios_a_procesar = socios_activos.count()
                if total_socios_a_procesar == 0:
                    self.stdout.write(self.style.WARNING('No hay socios activos a los que generarles cuotas.'))
                    return

                self.stdout.write(self.style.WARNING(f'Procesando {total_socios_a_procesar} socios...'))
                
                for socio_info in socios_activos:
                    descuento = socio_info.nivel_socio.descuento if socio_info.nivel_socio else 0
                    monto_final = MONTO_BASE * (1 - descuento / 100)
                    
                    # 3. Preparar objetos para bulk_create
                    cuotas_a_crear.append(
                        Cuota(
                            usuario=socio_info.usuario,
                            periodo=periodo_actual,
                            monto=monto_final,
                            vencimiento=vencimiento,
                            descuento_aplicado=descuento
                        )
                    )
                
                # 4. Ejecutar una sola consulta masiva a la base de datos
                if cuotas_a_crear:
                    Cuota.objects.bulk_create(cuotas_a_crear)

            # --- Fin de la transacción ---
            
            # Mensajes de éxito solo si la transacción fue completada
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ ÉXITO: {len(cuotas_a_crear)} cuotas generadas para {periodo_actual}.'
                )
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'📅 Vencimiento establecido para: {vencimiento.strftime("%d/%m/%Y")}.'
                )
            )

        except Exception as e:
            # Si la transacción falló, se notifica el error.
            self.stdout.write(
                self.style.ERROR(f'❌ Error durante la generación. La operación fue revertida. Detalle: {str(e)}')
            )