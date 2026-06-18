from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User
from apps.interactions.models import SocialAccount


class SocialAccountInline(admin.TabularInline):
    model = SocialAccount
    extra = 1
    fields = ["platform", "handle", "ig_user_id", "is_active", "is_connected"]
    readonly_fields = ["ig_user_id", "is_connected"]

    def is_connected(self, obj):
        return bool(obj.access_token and obj.ig_user_id)
    is_connected.boolean = True
    is_connected.short_description = "Conectado"


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "artistic_name", "genre", "is_active", "email_verified", "created_at"]
    list_filter = ["is_active", "email_verified", "is_staff"]
    search_fields = ["email", "artistic_name"]
    ordering = ["-created_at"]
    inlines = [SocialAccountInline]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Perfil artístico", {"fields": ("artistic_name", "genre", "bio", "avatar")}),
        ("Permisos", {"fields": ("is_active", "is_staff", "is_superuser", "email_verified")}),
        ("Fechas", {"fields": ("last_login", "created_at")}),
    )
    readonly_fields = ["created_at", "last_login"]

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "artistic_name", "password1", "password2", "is_active"),
        }),
    )