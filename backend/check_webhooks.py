import httpx
from scout.config import get_settings

s = get_settings()
base = f"https://{s.shopify_store_domain}/admin/api/{s.shopify_api_version}"
headers = {"X-Shopify-Access-Token": s.shopify_admin_token}
r = httpx.get(f"{base}/webhooks.json", headers=headers)
for w in r.json().get("webhooks", []):
    print(w["topic"], "->", w["address"])