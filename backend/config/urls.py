from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # Apps
    path("api/auth/", include("apps.users.urls")),
    path("api/", include("apps.interactions.urls")),

    # Swagger
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

# ─── Servir el build de React ────────────────────────────────────────────────
# Cualquier ruta que no sea /api/ o /admin/ la maneja React
frontend_dir = settings.BASE_DIR.parent / "frontend" / "dist"
if frontend_dir.exists():
    # Archivos estáticos del build (JS, CSS, íconos)
    urlpatterns += static("/assets/", document_root=frontend_dir / "assets")
    urlpatterns += static("/icons/", document_root=frontend_dir / "icons")
    urlpatterns += [
        re_path(r"^(?!api/|admin/|assets/|icons/).*$",
                TemplateView.as_view(template_name="index.html"),
                name="frontend"),
    ]
