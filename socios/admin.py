from django.contrib import admin
from .models import Usuario, Rol, NivelSocio, UsuarioRol, SocioInfo, Disciplina

# Register your models here.
admin.site.register(Usuario)
admin.site.register(Rol)
admin.site.register(NivelSocio)
admin.site.register(UsuarioRol)
admin.site.register(SocioInfo)
admin.site.register(Disciplina)