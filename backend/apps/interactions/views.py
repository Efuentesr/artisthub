from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from drf_spectacular.types import OpenApiTypes

from .models import SocialAccount, Interaction, Note
from .serializers import (
    SocialAccountSerializer,
    InteractionSerializer,
    InteractionCreateSerializer,
    NoteSerializer,
)
from .services import sync_instagram_dms

####
from .oauth import get_instagram_auth_url, exchange_code_for_token, get_long_lived_token
import secrets
from django.shortcuts import redirect as django_redirect
####

# ─── Social Accounts ────────────────────────────────────────────────────────

@extend_schema(
    tags=["Cuentas sociales"],
    summary="Listar cuentas sociales del artista",
    description="Devuelve todas las cuentas de redes sociales registradas por el artista autenticado.",
    responses={200: SocialAccountSerializer(many=True)},
)
class SocialAccountListCreateView(generics.ListCreateAPIView):
    serializer_class = SocialAccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SocialAccount.objects.filter(artist=self.request.user)

    def perform_create(self, serializer):
        serializer.save(artist=self.request.user)

    @extend_schema(
        tags=["Cuentas sociales"],
        summary="Agregar cuenta social",
        description="Registra una nueva cuenta de red social para el artista autenticado.",
        responses={201: SocialAccountSerializer},
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


@extend_schema(
    tags=["Cuentas sociales"],
    summary="Detalle, edición y eliminación de cuenta social",
    responses={200: SocialAccountSerializer},
)
class SocialAccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SocialAccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return SocialAccount.objects.filter(artist=self.request.user)


# ─── Interactions ────────────────────────────────────────────────────────────

@extend_schema(
    tags=["Interacciones"],
    summary="Listar interacciones con búsqueda y filtros",
    description=(
        "Devuelve todas las interacciones del artista autenticado. "
        "Soporta búsqueda por texto y filtros por plataforma, tipo y etiqueta."
    ),
    parameters=[
        OpenApiParameter("search", OpenApiTypes.STR, description="Buscar en contenido, usuario o nota"),
        OpenApiParameter("platform", OpenApiTypes.STR, description="instagram | tiktok | facebook"),
        OpenApiParameter("type", OpenApiTypes.STR, description="comment | dm | reply"),
        OpenApiParameter("tag", OpenApiTypes.STR, description="sugerencia | colaboracion | cliente | revisar"),
        OpenApiParameter("status", OpenApiTypes.STR, description="pendiente | revisado | archivado"),
    ],
    responses={200: InteractionSerializer(many=True)},
)
class InteractionListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["content", "from_username", "note__text"]
    ordering_fields = ["received_at", "fetched_at"]
    ordering = ["-received_at"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return InteractionCreateSerializer
        return InteractionSerializer

    def get_queryset(self):
        qs = Interaction.objects.filter(
            social_account__artist=self.request.user
        ).select_related("social_account", "note")

        platform = self.request.query_params.get("platform")
        if platform:
            qs = qs.filter(social_account__platform=platform)

        interaction_type = self.request.query_params.get("type")
        if interaction_type:
            qs = qs.filter(type=interaction_type)

        tag = self.request.query_params.get("tag")
        if tag:
            qs = qs.filter(note__tag=tag)

        note_status = self.request.query_params.get("status")
        if note_status:
            qs = qs.filter(note__status=note_status)

        return qs

    @extend_schema(
        tags=["Interacciones"],
        summary="Registrar interacción manualmente",
        description="Crea una interacción capturada manualmente (Fase 1). Opcionalmente incluye una nota.",
        request=InteractionCreateSerializer,
        responses={201: InteractionCreateSerializer},
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


@extend_schema(
    tags=["Interacciones"],
    summary="Detalle, edición y eliminación de interacción",
    responses={200: InteractionSerializer},
)
class InteractionDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return InteractionCreateSerializer
        return InteractionSerializer

    def get_queryset(self):
        return Interaction.objects.filter(
            social_account__artist=self.request.user
        ).select_related("social_account", "note")


# ─── Notes ───────────────────────────────────────────────────────────────────

@extend_schema(
    tags=["Notas"],
    summary="Crear o actualizar nota de una interacción",
    description="Si la interacción ya tiene nota, la actualiza. Si no, la crea.",
    request=NoteSerializer,
    responses={
        200: NoteSerializer,
        201: NoteSerializer,
        404: OpenApiResponse(description="Interacción no encontrada."),
    },
)
class NoteUpsertView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _get_interaction(self, interaction_id, user):
        try:
            return Interaction.objects.get(
                pk=interaction_id,
                social_account__artist=user,
            )
        except Interaction.DoesNotExist:
            return None

    def post(self, request, interaction_id):
        interaction = self._get_interaction(interaction_id, request.user)
        if not interaction:
            return Response({"detail": "Interacción no encontrada."}, status=status.HTTP_404_NOT_FOUND)

        serializer = NoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        note, created = Note.objects.update_or_create(
            interaction=interaction,
            defaults=serializer.validated_data,
        )
        return Response(
            NoteSerializer(note).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


@extend_schema(
    tags=["Interacciones"],
    summary="Sincronizar DMs de Instagram",
    description="Consulta la API de Instagram y guarda los DMs como interacciones.",
    responses={200: OpenApiResponse(description="Resumen de sincronización.")},
)
class InstagramSyncView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            social_account = SocialAccount.objects.get(
                artist=request.user,
                platform=SocialAccount.Platform.INSTAGRAM,
                is_active=True,
            )
        except SocialAccount.DoesNotExist:
            return Response(
                {"detail": "No tienes una cuenta de Instagram conectada."},
                status=status.HTTP_404_NOT_FOUND,
            )

        result = sync_instagram_dms(social_account)

        if "error" in result:
            return Response({"detail": result["error"]}, status=status.HTTP_400_BAD_REQUEST)

        return Response(result, status=status.HTTP_200_OK)
    

################## EFRM ###################

class InstagramOAuthInitView(APIView):
    """Genera la URL de autorización y redirige al usuario a Instagram."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        state = secrets.token_urlsafe(32)
        # Guardamos el state y el user_id en la sesión para verificarlo en el callback
        request.session["ig_oauth_state"] = state
        request.session["ig_oauth_user_id"] = request.user.id
        auth_url = get_instagram_auth_url(state)
        return Response({"auth_url": auth_url})


class InstagramOAuthCallbackView(APIView):
    """Recibe el código de Meta, lo intercambia por token y lo guarda."""
    permission_classes = []  # Público — Meta redirige aquí sin JWT

    def get(self, request):
        code = request.GET.get("code")
        state = request.GET.get("state")
        error = request.GET.get("error")

        FRONTEND_URL = "https://artisthub-fe-production-7a98.up.railway.app"

        if error or not code:
            return django_redirect(f"{FRONTEND_URL}/accounts?ig_error=1")

        # 1. Intercambiar código por token corto
        token_data = exchange_code_for_token(code)
        if "error" in token_data:
            return django_redirect(f"{FRONTEND_URL}/accounts?ig_error=1")

        short_token = token_data.get("access_token")
        ig_user_id = str(token_data.get("user_id", ""))

        # 2. Intercambiar por token de larga duración
        long_data = get_long_lived_token(short_token)
        if "error" in long_data:
            return django_redirect(f"{FRONTEND_URL}/accounts?ig_error=1")

        long_token = long_data.get("access_token")
        expires_in = long_data.get("expires_in", 5184000)  # ~60 días

        from datetime import datetime, timezone, timedelta
        token_expires = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

        # 3. Buscar el user_id guardado en sesión
        user_id = request.session.get("ig_oauth_user_id")
        saved_state = request.session.get("ig_oauth_state")

        if not user_id or saved_state != state:
            return django_redirect(f"{FRONTEND_URL}/accounts?ig_error=1")

        # 4. Actualizar o crear el SocialAccount
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return django_redirect(f"{FRONTEND_URL}/accounts?ig_error=1")

        SocialAccount.objects.update_or_create(
            artist=user,
            platform=SocialAccount.Platform.INSTAGRAM,
            defaults={
                "access_token": long_token,
                "ig_user_id": ig_user_id,
                "token_expires": token_expires,
                "is_active": True,
            }
        )

        return django_redirect(f"{FRONTEND_URL}/accounts?ig_connected=1")
    
class DebugEnvView(APIView):
    permission_classes = []

    def get(self, request):
        import os
        from django.conf import settings
        return Response({
            "META_APP_ID_settings": settings.META_APP_ID,
            "META_APP_ID_os": os.environ.get("META_APP_ID", "NOT FOUND"),
            "INSTAGRAM_APP_ID_os": os.environ.get("INSTAGRAM_APP_ID", "NOT FOUND"),
        })