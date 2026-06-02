from django.contrib import admin
from .models import SocialAccount, Interaction, Note


class NoteInline(admin.StackedInline):
    model = Note
    extra = 0


@admin.register(SocialAccount)
class SocialAccountAdmin(admin.ModelAdmin):
    list_display = ["artist", "platform", "handle", "is_active", "created_at"]
    list_filter = ["platform", "is_active"]
    search_fields = ["artist__email", "artist__artistic_name", "handle"]


@admin.register(Interaction)
class InteractionAdmin(admin.ModelAdmin):
    list_display = ["from_username", "social_account", "type", "received_at", "fetched_at"]
    list_filter = ["social_account__platform", "type"]
    search_fields = ["from_username", "content"]
    inlines = [NoteInline]
    ordering = ["-received_at"]


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ["interaction", "tag", "status", "updated_at"]
    list_filter = ["tag", "status"]
