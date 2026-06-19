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
            "fields": "id,messages{id,message,from,created_time,shares,attachments}",
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

            content = msg.get("message", "")
            post_url = ""

            # Si no hay texto, puede ser un post/reel compartido
            if not content:
                shares = msg.get("shares", {}).get("data", [])
                if shares:
                    post_url = shares[0].get("link", "")
                    content = "📎 Publicación compartida"
                else:
                    attachments = msg.get("attachments", {}).get("data", [])
                    if attachments:
                        att_type = attachments[0].get("type", "archivo")
                        content = f"📎 {att_type.capitalize()} adjunto"

            Interaction.objects.create(
                social_account=social_account,
                platform_id=platform_id,
                type=Interaction.InteractionType.DM,
                from_username=from_user.get("username", from_user.get("name", "unknown")),
                content=content,
                post_url=post_url,
                received_at=received_at,
            )
            created += 1

    return {"created": created, "skipped": skipped, "conversations": len(conversations)}


def sync_instagram_comments(social_account: SocialAccount) -> dict:
    """
    Consulta las publicaciones recientes y sus comentarios, guardándolos como Interaction.
    """
    token = social_account.access_token
    ig_user_id = social_account.ig_user_id

    if not token or not ig_user_id:
        return {"error": "Cuenta sin token o ig_user_id configurado"}

    # 1. Obtener publicaciones recientes (últimas 25)
    resp = requests.get(
        f"{GRAPH_URL}/{ig_user_id}/media",
        params={
            "fields": "id,permalink,caption,timestamp",
            "limit": 25,
            "access_token": token,
        },
    )

    if resp.status_code != 200:
        return {"error": resp.json().get("error", {}).get("message", "Error al obtener publicaciones")}

    media_items = resp.json().get("data", [])
    created = 0
    skipped = 0

    for media in media_items:
        media_id = media.get("id")
        permalink = media.get("permalink", "")

        comments_resp = requests.get(
            f"{GRAPH_URL}/{media_id}/comments",
            params={
                "fields": "id,text,username,timestamp, from",
                "access_token": token,
            },
        )

        if comments_resp.status_code != 200:
            continue

        comments = comments_resp.json().get("data", [])

        for comment in comments:
            platform_id = comment.get("id")
            if not platform_id:
                continue

            if Interaction.objects.filter(platform_id=platform_id).exists():
                skipped += 1
                continue

            received_at = datetime.fromisoformat(
                comment["timestamp"].replace("Z", "+00:00")
            ) if comment.get("timestamp") else datetime.now(timezone.utc)

            from_obj = comment.get("from", {}) or {}
            username = comment.get("username") or from_obj.get("username") or "unknown"

            Interaction.objects.create(
                social_account=social_account,
                platform_id=platform_id,
                type=Interaction.InteractionType.COMMENT,
                from_username=username,
                content=comment.get("text", ""),
                post_url=permalink,
                received_at=received_at,
            )
            
            created += 1

    return {"created": created, "skipped": skipped, "media_checked": len(media_items)}