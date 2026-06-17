import requests
from django.conf import settings

#INSTAGRAM_AUTH_URL = "https://api.instagram.com/oauth/authorize"
INSTAGRAM_AUTH_URL = "https://www.facebook.com/dialog/oauth"
INSTAGRAM_TOKEN_URL = "https://api.instagram.com/oauth/access_token"
INSTAGRAM_LONG_TOKEN_URL = "https://graph.instagram.com/access_token"

REDIRECT_URI = "https://artisthub-production-33bd.up.railway.app/api/instagram/callback/"


def get_instagram_auth_url(state: str) -> str:
    """Genera la URL de autorización de Instagram."""
    params = {
        #"client_id": settings.INSTAGRAM_APP_ID,
        "client_id": settings.META_APP_ID, 
        "redirect_uri": REDIRECT_URI,
        #"scope": "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments",
        #"scope": "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments",
        "scope": "instagram_basic,instagram_manage_messages,pages_show_list,pages_read_engagement,business_management",
        "response_type": "code",
        "state": state,
        "display": "popup",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{INSTAGRAM_AUTH_URL}?{query}"


def exchange_code_for_token(code: str) -> dict:
    """Intercambia el código de autorización por un token de corta duración."""
    resp = requests.post(INSTAGRAM_TOKEN_URL, data={
        "client_id": settings.INSTAGRAM_APP_ID,
        "client_secret": settings.INSTAGRAM_APP_SECRET,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT_URI,
        "code": code,
    })
    if resp.status_code != 200:
        return {"error": resp.json()}
    return resp.json()  # {"access_token": ..., "user_id": ...}


def get_long_lived_token(short_token: str) -> dict:
    """Intercambia el token corto por uno de larga duración (~60 días)."""
    resp = requests.get(INSTAGRAM_LONG_TOKEN_URL, params={
        "grant_type": "ig_exchange_token",
        "client_secret": settings.INSTAGRAM_APP_SECRET,
        "access_token": short_token,
    })
    if resp.status_code != 200:
        return {"error": resp.json()}
    return resp.json()  # {"access_token": ..., "token_type": ..., "expires_in": ...}


def refresh_long_lived_token(long_token: str) -> dict:
    """Renueva un token de larga duración antes de que expire."""
    resp = requests.get("https://graph.instagram.com/refresh_access_token", params={
        "grant_type": "ig_refresh_token",
        "access_token": long_token,
    })
    if resp.status_code != 200:
        return {"error": resp.json()}
    return resp.json()