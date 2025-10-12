from django.db import migrations

def crear_datos_iniciales(apps, schema_editor):
    # Obtener modelos
    NivelSocio = apps.get_model('socios', 'NivelSocio')
    
    # Crear niveles de socio
    NivelSocio.objects.get_or_create(
        nivel=1,
        defaults={
            "descuento": 0,
            "descripcion": "Nivel Básico",
            "beneficios": "Acceso a instalaciones, descuentos en eventos",
            "requisitos": "Pago de cuota mensual"
        }
    )
    
    NivelSocio.objects.get_or_create(
        nivel=2,
        defaults={
            "descuento": 10,
            "descripcion": "Nivel Intermedio",
            "beneficios": "10% descuento en cuotas, prioridad en reservas",
            "requisitos": "1 año de antigüedad"
        }
    )
    
    NivelSocio.objects.get_or_create(
        nivel=3,
        defaults={
            "descuento": 20,
            "descripcion": "Nivel Premium",
            "beneficios": "20% descuento, acceso VIP a eventos",
            "requisitos": "2 años de antigüedad"
        }
    )

def eliminar_datos_iniciales(apps, schema_editor):
    NivelSocio = apps.get_model('socios', 'NivelSocio')
    NivelSocio.objects.filter(nivel__in=[1, 2, 3]).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('socios', '0003_usuario_admin_inicial'),  # Reemplaza con el nombre de tu última migración
    ]

    operations = [
        migrations.RunPython(crear_datos_iniciales, eliminar_datos_iniciales),
    ]