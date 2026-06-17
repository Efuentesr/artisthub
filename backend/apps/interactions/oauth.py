import requests
from django.conf import settings
from django.core import signing

INSTAGRAM_AUTH_URL = "https://www.facebook.com/dialog/oauth"
INSTAGRAM_TOKEN_URL = "https://api.instagram.com/oauth/access_token"
INSTAGRAM_LONG_TOKEN_URL = "https://graph.instagram.com/access_token"

REDIRECT_URI = "https://artisthub-production-33bd.up.railway.app/api/instagram/callback/"


def get_instagram_auth_url(user_id: int) -> str:
    """Genera la URL de autorización de Instagram, con el user_id firmado en el state."""
    state = signing.dumps({"user_id": user_id}, salt="instagram-oauth")
    params = {
        "client_id": settings.META_APP_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": "instagram_basic,instagram_manage_messages,pages_show_list,pages_read_engagement,business_management",
        "response_type": "code",
        "state": state,
        "display": "popup",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{INSTAGRAM_AUTH_URL}?{query}"


def verify_state(state: str, max_age=600):
    """Verifica y decodifica el state firmado. Retorna el user_id o None si es inválido."""
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