from django.contrib.auth import get_user_model
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.conf import settings

from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    EmailVerifySerializer,
    ResendVerificationSerializer,
)
from .tokens import email_verification_token

User = get_user_model()


def send_verification_email(user, request=None):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = email_verification_token.make_token(user)
    verify_url = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"
    send_mail(
        subject="Verifica tu cuenta en ArtistHub",
        message=f"Hola {user.artistic_name or user.email},\n\nVerifica tu cuenta aquí:\n{verify_url}\n\nEste enlace expira en 24 horas.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


@extend_schema(
    tags=["Auth"],
    summary="Registro de nuevo artista",
    description="Crea una cuenta nueva. El usuario queda inactivo hasta verificar su email.",
    responses={
        201: OpenApiResponse(description="Cuenta creada. Se envió email de verificación."),
        400: OpenApiResponse(description="Datos inválidos."),
    },
    examples=[
        OpenApiExample(
            "Ejemplo de registro",
            value={"email": "artista@example.com", "password": "Secreta123!", "password2": "Secreta123!", "artistic_name": "DJ Kuro"},
            request_only=True,
        )
    ],
)
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        send_verification_email(user)
        return Response(
            {"detail": "Cuenta creada. Revisa tu email para verificarla."},
            status=status.HTTP_201_CREATED,
        )


@extend_schema(
    tags=["Auth"],
    summary="Login con email y contraseña",
    description="Devuelve tokens JWT de acceso y refresco. El usuario debe tener su email verificado.",
)
class LoginView(TokenObtainPairView):
    pass


@extend_schema(
    tags=["Auth"],
    summary="Refrescar token de acceso",
    description="Usa el refresh token para obtener un nuevo access token.",
)
class RefreshView(TokenRefreshView):
    pass


@extend_schema(
    tags=["Auth"],
    summary="Logout — invalida el refresh token",
    description="Agrega el refresh token a la blacklist. El access token expira solo.",
    request={"application/json": {"type": "object", "properties": {"refresh": {"type": "string"}}}},
    responses={
        205: OpenApiResponse(description="Sesión cerrada correctamente."),
        400: OpenApiResponse(description="Token inválido o ya en blacklist."),
    },
)
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data["refresh"])
            token.blacklist()
            return Response({"detail": "Sesión cerrada."}, status=status.HTTP_205_RESET_CONTENT)
        except (TokenError, KeyError):
            return Response({"detail": "Token inválido."}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Auth"],
    summary="Verificar email",
    description="Activa la cuenta del usuario usando el enlace enviado por email (uid + token).",
    parameters=[
        OpenApiParameter("uidb64", OpenApiTypes.STR, OpenApiParameter.PATH, description="UID del usuario en base64"),
        OpenApiParameter("token", OpenApiTypes.STR, OpenApiParameter.PATH, description="Token de verificación"),
    ],
    responses={
        200: OpenApiResponse(description="Email verificado correctamente."),
        400: OpenApiResponse(description="Token inválido o expirado."),
    },
)
class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = EmailVerifySerializer

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, User.DoesNotExist):
            return Response({"detail": "Enlace inválido."}, status=status.HTTP_400_BAD_REQUEST)

        if email_verification_token.check_token(user, token):
            user.is_active = True
            user.email_verified = True
            user.save()
            return Response({"detail": "Email verificado. Ya puedes iniciar sesión."})

        return Response({"detail": "El enlace expiró o ya fue usado."}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Auth"],
    summary="Reenviar email de verificación",
    description="Reenvía el correo de verificación si el usuario aún no activó su cuenta.",
    responses={
        200: OpenApiResponse(description="Email reenviado."),
        400: OpenApiResponse(description="El email no existe o ya está verificado."),
    },
)
class ResendVerificationView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ResendVerificationSerializer

    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.get(email=serializer.validated_data["email"])
        except User.DoesNotExist:
            # Respuesta genérica por seguridad (no revelar si el email existe)
            return Response({"detail": "Si el email existe, recibirás el correo."})

        if user.email_verified:
            return Response({"detail": "Este email ya fue verificado."}, status=status.HTTP_400_BAD_REQUEST)

        send_verification_email(user)
        return Response({"detail": "Email de verificación reenviado."})


@extend_schema(
    tags=["Perfil"],
    summary="Ver y editar perfil del artista",
    description="GET devuelve el perfil del usuario autenticado. PATCH permite actualizarlo.",
    responses={200: UserProfileSerializer},
)
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user


@extend_schema(
    tags=["Perfil"],
    summary="Cambiar contraseña",
    description="Requiere la contraseña actual para establecer una nueva.",
    responses={
        200: OpenApiResponse(description="Contraseña actualizada."),
        400: OpenApiResponse(description="Contraseña actual incorrecta o nueva inválida."),
    },
)
class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response({"old_password": "Contraseña incorrecta."}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"detail": "Contraseña actualizada correctamente."})
