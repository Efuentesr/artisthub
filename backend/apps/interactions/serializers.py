from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import SocialAccount, Interaction, Note


class SocialAccountSerializer(serializers.ModelSerializer):
    platform_display = serializers.SerializerMethodField()

    class Meta:
        model = SocialAccount
        fields = ["id", "platform", "platform_display", "handle", "access_token", "ig_user_id", "is_active", "created_at"]
        # fields = ["id", "platform", "platform_display", "handle", "is_active", "created_at"]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "access_token": {"write_only": True},
        }
        
    @extend_schema_field(serializers.CharField())
    def get_platform_display(self, obj):
        return obj.get_platform_display()


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "tag", "status", "text", "updated_at"]
        read_only_fields = ["id", "updated_at"]


class InteractionSerializer(serializers.ModelSerializer):
    note = NoteSerializer(read_only=True)
    platform = serializers.SerializerMethodField()
    platform_display = serializers.SerializerMethodField()

    class Meta:
        model = Interaction
        fields = [
            "id", "social_account", "platform", "platform_display",
            "type", "from_username", "content", "post_url",
            "received_at", "fetched_at", "note",
        ]
        read_only_fields = ["id", "fetched_at"]

    @extend_schema_field(serializers.CharField())
    def get_platform(self, obj):
        return obj.social_account.platform

    @extend_schema_field(serializers.CharField())
    def get_platform_display(self, obj):
        return obj.social_account.get_platform_display()


class InteractionCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear/editar interacciones manualmente (Fase 1)."""
    note = NoteSerializer(required=False)

    class Meta:
        model = Interaction
        fields = [
            "id", "social_account", "type", "from_username",
            "content", "post_url", "received_at", "note",
        ]
        read_only_fields = ["id"]

    def validate_social_account(self, value):
        request = self.context.get("request")
        if value.artist != request.user:
            raise serializers.ValidationError("Esta cuenta social no te pertenece.")
        return value

    def create(self, validated_data):
        note_data = validated_data.pop("note", None)
        interaction = Interaction.objects.create(**validated_data)
        if note_data:
            Note.objects.create(interaction=interaction, **note_data)
        return interaction

    def update(self, instance, validated_data):
        note_data = validated_data.pop("note", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if note_data:
            Note.objects.update_or_create(interaction=instance, defaults=note_data)
        return instance
