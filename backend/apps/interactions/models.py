from django.db import models
from django.conf import settings


class SocialAccount(models.Model):
    """Cuenta de red social conectada por el artista."""

    class Platform(models.TextChoices):
        INSTAGRAM = "instagram", "Instagram"
        TIKTOK = "tiktok", "TikTok"
        FACEBOOK = "facebook", "Facebook"

    artist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="social_accounts",
    )
    platform = models.CharField(max_length=20, choices=Platform.choices)
    handle = models.CharField(max_length=120, help_text="@nombre en esa red social")
    access_token = models.TextField(blank=True, help_text="Token OAuth (se llenará en Fase 2)")
    token_expires = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "cuenta social"
        verbose_name_plural = "cuentas sociales"
        unique_together = [["artist", "platform", "handle"]]
        ordering = ["platform"]

    def __str__(self):
        return f"{self.artist} · {self.get_platform_display()} · {self.handle}"


class Interaction(models.Model):
    """
    Comentario, DM o respuesta capturado desde una red social.
    En Fase 1 se carga manualmente. En Fase 2 viene de las APIs.
    """

    class InteractionType(models.TextChoices):
        COMMENT = "comment", "Comentario"
        DM = "dm", "Mensaje directo"
        REPLY = "reply", "Respuesta"

    social_account = models.ForeignKey(
        SocialAccount,
        on_delete=models.CASCADE,
        related_name="interactions",
    )
    platform_id = models.CharField(
        max_length=200, blank=True,
        help_text="ID original en la red social (para Fase 2 evitar duplicados)"
    )
    type = models.CharField(max_length=20, choices=InteractionType.choices, default=InteractionType.COMMENT)
    from_username = models.CharField(max_length=120, help_text="Quien escribió")
    content = models.TextField(help_text="Texto del mensaje o comentario")
    post_url = models.URLField(blank=True, help_text="URL de la publicación donde ocurrió")
    received_at = models.DateTimeField(help_text="Fecha y hora real del mensaje")
    fetched_at = models.DateTimeField(auto_now_add=True, help_text="Cuando lo registramos en ArtistHub")

    class Meta:
        verbose_name = "interacción"
        verbose_name_plural = "interacciones"
        ordering = ["-received_at"]

    def __str__(self):
        return f"@{self.from_username} → {self.social_account.get_platform_display()} ({self.received_at.date()})"


class Note(models.Model):
    """Anotación personal del artista sobre una interacción."""

    class Tag(models.TextChoices):
        SUGGESTION = "sugerencia", "Sugerencia"
        COLLABORATION = "colaboracion", "Colaboración"
        CLIENT = "cliente", "Cliente potencial"
        REVIEW = "revisar", "Revisar luego"

    class Status(models.TextChoices):
        PENDING = "pendiente", "Pendiente"
        REVIEWED = "revisado", "Revisado"
        ARCHIVED = "archivado", "Archivado"

    interaction = models.OneToOneField(
        Interaction,
        on_delete=models.CASCADE,
        related_name="note",
    )
    tag = models.CharField(max_length=20, choices=Tag.choices, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    text = models.TextField(blank=True, help_text="Lo que el artista quiere recordar")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "nota"
        verbose_name_plural = "notas"

    def __str__(self):
        return f"Nota: {self.interaction} [{self.get_status_display()}]"
