from django.db import migrations

def crear_roles_iniciales(apps, schema_editor):
    Rol = apps.get_model("socios", "Rol")
    roles = ["admin", "socio", "profesor", "dirigente"]

    for nombre in roles:
        Rol.objects.get_or_create(nombre=nombre)

def eliminar_roles(apps, schema_editor):
    Rol = apps.get_model("socios", "Rol")
    Rol.objects.filter(nombre__in=["admin", "socio", "profesor", "dirigente"]).delete()

class Migration(migrations.Migration):

    dependencies = [
        ("socios", "0001_initial"),  # ajustá esto al nombre de tu migración inicial
    ]

    operations = [
        migrations.RunPython(crear_roles_iniciales, eliminar_roles),
    ]
