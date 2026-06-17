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

import requests
from django.conf import settings
from django.core import signing
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



INSTAGRAM_AUTH_URL = "https://api.instagram.com/oauth/authorize"
INSTAGRAM_TOKEN_URL = "https://api.instagram.com/oauth/access_token"
INSTAGRAM_LONG_TOKEN_URL = "https://graph.instagram.com/access_token"

REDIRECT_URI = "https://artisthub-production-33bd.up.railway.app/api/instagram/callback/"


def get_instagram_auth_url(user_id: int) -> str:
    state = signing.dumps({"user_id": user_id}, salt="instagram-oauth")
    params = {
        "client_id": settings.INSTAGRAM_APP_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments",
        "response_type": "code",
        "state": state,
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{INSTAGRAM_AUTH_URL}?{query}"


def verify_state(state: str, max_age=600):
    try:
        data = signing.loads(state, salt="instagram-oauth", max_age=max_age)
        return data.get("user_id")
    except signing.BadSignature:
        return None


def exchange_code_for_token(code: str) -> dict:
    resp = requests.post(INSTAGRAM_TOKEN_URL, data={
        "client_id": settings.INSTAGRAM_APP_ID,
        "client_secret": settings.INSTAGRAM_APP_SECRET,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT_URI,
        "code": code,
    })
    if resp.status_code != 200:
        return {"error": resp.json()}
    return resp.json()


def get_long_lived_token(short_token: str) -> dict:
    resp = requests.get(INSTAGRAM_LONG_TOKEN_URL, params={
        "grant_type": "ig_exchange_token",
        "client_secret": settings.INSTAGRAM_APP_SECRET,
        "access_token": short_token,
    })
    if resp.status_code != 200:
        return {"error": resp.json()}
    return resp.json()


def refresh_long_lived_token(long_token: str) -> dict:
    resp = requests.get("https://graph.instagram.com/refresh_access_token", params={
        "grant_type": "ig_refresh_token",
        "access_token": long_token,
    })
    if resp.status_code != 200:
        return {"error": resp.json()}
    return resp.json()