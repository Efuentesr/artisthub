from django.urls import path
from .views import (
    SocialAccountListCreateView,
    SocialAccountDetailView,
    InteractionListCreateView,
    InteractionDetailView,
    NoteUpsertView,
    InstagramSyncView,
    InstagramOAuthInitView,
    InstagramOAuthCallbackView,
)

urlpatterns = [
    # Cuentas sociales
    path("social-accounts/", SocialAccountListCreateView.as_view(), name="social-account-list"),
    path("social-accounts/<int:pk>/", SocialAccountDetailView.as_view(), name="social-account-detail"),

    # Interacciones
    path("interactions/", InteractionListCreateView.as_view(), name="interaction-list"),
    path("interactions/<int:pk>/", InteractionDetailView.as_view(), name="interaction-detail"),

    # Notas
    path("interactions/<int:interaction_id>/note/", NoteUpsertView.as_view(), name="interaction-note"),

    # Instagram
    path("instagram/sync/", InstagramSyncView.as_view(), name="instagram-sync"),
    path("instagram/oauth/", InstagramOAuthInitView.as_view(), name="instagram-oauth-init"),
    path("instagram/callback/", InstagramOAuthCallbackView.as_view(), name="instagram-callback"),
]