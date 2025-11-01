# socios/management/commands/borrar_todas_las_cuotas.py

import sys
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from socios.models import Cuota, Pago

class Command(BaseCommand):
    help = """
    ELIMINA TODAS LAS CUOTAS Y PAGOS ASOCIADOS DE LA BASE DE DATOS.
    ¡¡¡ADVERTENCIA: ESTA ACCIÓN ES IRREVERSIBLE Y DEBE USARSE SOLO EN ENTORNOS DE DESARROLLO!!!
    """

    def add_arguments(self, parser):
        """Añade argumentos para forzar la ejecución sin confirmación."""
        parser.add_argument(
            '--forzar',
            action='store_true',
            help='Salta la confirmación interactiva. Útil para scripts automáticos.'
        )

    def handle(self, *args, **options):
        """Lógica principal del comando."""
        forzar = options['forzar']
        
        # --- 1. Contar los registros a eliminar para informar al usuario ---
        total_cuotas = Cuota.objects.count()
        total_pagos = Pago.objects.count()

        if total_cuotas == 0 and total_pagos == 0:
            self.stdout.write(self.style.SUCCESS("✅ No hay cuotas ni pagos para borrar."))
            return

        # --- 2. Advertencia y Confirmación ---
        self.stdout.write(self.style.WARNING("======================================================"))
        self.stdout.write(self.style.ERROR("           ¡¡¡ATENCIÓN: OPERACIÓN DESTRUCTIVA!!!"))
        self.stdout.write(self.style.WARNING("======================================================"))
        self.stdout.write(f"Este script eliminará permanentemente:")
        self.stdout.write(self.style.WARNING(f"  - {total_cuotas} cuota(s)"))
        self.stdout.write(self.style.WARNING(f"  - {total_pagos} pago(s) asociados"))
        self.stdout.write("Esta acción no se puede deshacer.")
        self.stdout.write("")

        if not forzar:
            # La palabra de confirmación debe ser precisa para evitar accidentes
            confirmacion = input(f"Para confirmar, escribe la palabra 'eliminar' y presiona Enter: ")
            if confirmacion.lower() != 'eliminar':
                self.stdout.write(self.style.ERROR("\n❌ Operación cancelada. No se ha borrado nada."))
                return

        # --- 3. Ejecución de la eliminación ---
        self.stdout.write(self.style.WARNING("\nProcediendo con la eliminación..."))
        
        try:
            # Usamos una transacción para asegurar que todo se borre o nada se borre
            with transaction.atomic():
                # Primero borramos los pagos para evitar problemas de Foreign Key
                pagos_borrados, _ = Pago.objects.all().delete()
                # Luego borramos las cuotas
                cuotas_borradas, _ = Cuota.objects.all().delete()
            
            self.stdout.write(self.style.SUCCESS("======================================================"))
            self.stdout.write(self.style.SUCCESS("✅ ÉXITO: Todos los registros han sido eliminados."))
            self.stdout.write(self.style.SUCCESS(f"   - Pagos eliminados: {pagos_borrados}"))
            self.stdout.write(self.style.SUCCESS(f"   - Cuotas eliminadas: {cuotas_borradas}"))
            self.stdout.write(self.style.SUCCESS("======================================================"))

        except Exception as e:
            raise CommandError(f"❌ Error durante la eliminación. La operación fue revertida. Detalle: {str(e)}")