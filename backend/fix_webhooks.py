import httpx
from scout.config import get_settings

s = get_settings()
base = f"https://{s.shopify_store_domain}/admin/api/{s.shopify_api_version}"
headers = {"X-Shopify-Access-Token": s.shopify_admin_token, "Content-Type": "application/json"}

CORRECT_URL = "https://scout-api-6bon.onrender.com/webhooks/shopify"

with httpx.Client(timeout=30) as client:
    # Delete existing broken webhooks
    r = client.get(f"{base}/webhooks.json", headers=headers)
    for w in r.json().get("webhooks", []):
        del_r = client.delete(f"{base}/webhooks/{w['id']}.json", headers=headers)
        print(f"deleted {w['topic']} (was: {w['address']}) -> {del_r.status_code}")

    # Register correct ones
    for topic in ["orders/create", "inventory_levels/update"]:
        body = {"webhook": {"topic": topic, "address": CORRECT_URL, "format": "json"}}
        reg_r = client.post(f"{base}/webhooks.json", headers=headers, json=body)
        print(f"registered {topic} -> {CORRECT_URL} : {reg_r.status_code}")