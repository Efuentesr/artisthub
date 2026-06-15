import requests
from datetime import datetime, timezone
from .models import SocialAccount, Interaction


GRAPH_URL = "https://graph.instagram.com/v25.0"


def sync_instagram_dms(social_account: SocialAccount) -> dict:
    """
    Consulta los DMs de Instagram y los guarda como Interaction.
    Retorna un resumen de cuántos se crearon y cuántos ya existían.
    """
    token = social_account.access_token
    ig_user_id = social_account.ig_user_id

    if not token or not ig_user_id:
        return {"error": "Cuenta sin token o ig_user_id configurado"}

    # 1. Obtener conversaciones
    resp = requests.get(
        f"{GRAPH_URL}/{ig_user_id}/conversations",
        params={
            "platform": "instagram",
            "fields": "id,messages{id,message,from,created_time}",
            "access_token": token,
        },
    )

    if resp.status_code != 200:
        return {"error": resp.json().get("error", {}).get("message", "Error desconocido")}

    conversations = resp.json().get("data", [])
    created = 0
    skipped = 0

    for conv in conversations:
        messages = conv.get("messages", {}).get("data", [])
        for msg in messages:
            platform_id = msg.get("id")
            if not platform_id:
                continue

            # Evitar duplicados
            if Interaction.objects.filter(platform_id=platform_id).exists():
                skipped += 1
                continue

            from_user = msg.get("from", {})
            received_at = datetime.fromisoformat(
                msg["created_time"].replace("Z", "+00:00")
            ) if msg.get("created_time") else datetime.now(timezone.utc)

            Interaction.objects.create(
                social_account=social_account,
                platform_id=platform_id,
                type=Interaction.InteractionType.DM,
                from_username=from_user.get("username", from_user.get("name", "unknown")),
                content=msg.get("message", ""),
                received_at=received_at,
            )
            created += 1

    return {"created": created, "skipped": skipped, "conversations": len(conversations)}