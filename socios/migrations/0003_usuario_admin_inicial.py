from django.db import migrations
from django.contrib.auth.hashers import make_password

def crear_usuario_admin(apps, schema_editor):
    Usuario = apps.get_model("socios", "Usuario")
    Rol = apps.get_model("socios", "Rol")
    UsuarioRol = apps.get_model("socios", "UsuarioRol")

    # Si ya existe algún usuario admin, no hace nada
    if Usuario.objects.exists():
        return

    # Crear el usuario admin
    usuario_admin = Usuario.objects.create(
        nombre="Administrador",
        apellido="General",
        email="admin@socioskarazuno.com",
        contrasena="admin123",  # 🔐 encriptar contraseña
        tipo_documento="DNI",
        nro_documento="00000000",
        activo=True,
    )

    # Asignar rol "admin"
    rol_admin, _ = Rol.objects.get_or_create(nombre="admin")
    UsuarioRol.objects.create(usuario=usuario_admin, rol=rol_admin)

def eliminar_usuario_admin(apps, schema_editor):
    Usuario = apps.get_model("socios", "Usuario")
    Usuario.objects.filter(email="admin@socioskarazuno.com").delete()

class Migration(migrations.Migration):

    dependencies = [
        ("socios", "0002_roles_iniciales"),
    ]

    operations = [
        migrations.RunPython(crear_usuario_admin, eliminar_usuario_admin),
    ]