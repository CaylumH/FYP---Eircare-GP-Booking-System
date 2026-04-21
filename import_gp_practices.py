import time
import requests
from bs4 import BeautifulSoup

BACKEND_URL = "https://eircaregp.com"
ADMIN_EMAIL = "admin1@gmail.com"
ADMIN_PASSWORD = "pass1234"

def get_admin_token():

    response  = requests.post(f"{BACKEND_URL}/api/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})

    return response.json()["token"]

def scrape_page(page):
    response = requests.get(f"https://www2.hse.ie/services/find-a-gp/?page={page}", timeout=15)

    soup = BeautifulSoup(response.text, "html.parser")
    practices = []

    for item in soup.select('div[data-testid="hse-result-card"]'):
        name = item.select_one('h3[data-testid="hse-result-card__title"]')
        
        address = item.select_one('p[data-testid="hse-result-card__address--address"]')
        phone = item.select_one('a[href^="tel:"]')
        if name and address and phone:

            practices.append({
                "name": name.get_text(strip=True),
                "address": address.get_text(strip=True),
                "phoneNumber": phone.get_text(strip=True),
            })
    return practices

token = get_admin_token()

for page in range(1, 156):
    print(f"Page {page}/155")

    for practice in scrape_page(page):
        response = requests.post(
            f"{BACKEND_URL}/api/admin/practices/import",
            json=practice,
            headers={"Authorization": f"Bearer {token}"}

        )
        print(f"  {'OK' if response.status_code == 200 else 'SKIP'}: {practice['name']}")
        time.sleep(1)
