# Eircare — GP Booking System

A GP appointment booking system built with Spring Boot, React, and MySQL.

Live: https://eircaregp.com

The live deployment above is configured with all relevant API keys. Running locally requires Google Maps and Anthropic API keys. Using the live deployment is recommended

## Test Accounts (live deployment)

**Admin:** admin1@gmail.com / pass1234
**Doctor:** doctor1@gmail.com / pass1234
**Patient:** patient1@gmail.com / pass1234

---

## Running Locally

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) (for MySQL + backend)
- [Node.js](https://nodejs.org/) v18+ (for the frontend)

### 1. API Keys

Copy the example env file and fill in your API keys:

```bash
cp .env.example key.env
```

Edit `key.env`:

```
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Patient registration and address search won't work without Google Maps, and AI geocoding won't work without Anthropic. Both keys are needed for basic use locally.

### 2. Start the backend

```bash
docker-compose -f docker-compose.dev.yml up --build
```

This starts MySQL and the Spring Boot backend on port `8080`. The first build takes a while as Maven downloads dependencies.

### 3. Start the frontend

```bash
cd eircare-frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`. API calls are proxied automatically to `localhost:8080`.

### Default admin account

```
Email:    admin1@gmail.com
Password: pass1234
```

### 4. Seed practice data

The local database starts empty. Import a few practices via the admin API to get started:

```bash
curl -s -X POST http://localhost:8080/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin1@gmail.com","password":"pass1234"}' | python -c "import sys,json; print(json.load(sys.stdin)['token'])"
```

Copy the token from the output, then import a practice:

```bash
curl -X POST http://localhost:8080/api/admin/practices/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Test Practice","address":"1 Grafton Street, Dublin 2","phoneNumber":"0011234567"}'
```

Repeat with different names/addresses for more practices. You can also run `import_gp_practices.py`, after setting `BACKEND_URL = "http://localhost:8080"` to import the full dataset. This takes about 40 minutes.

---

## Tech Stack

- **Backend:** Java 21, Spring Boot, Spring Security, JPA/Hibernate
- **Frontend:** React, Vite, Bootstrap
- **Database:** MySQL 8
- **Infrastructure:** Docker, Nginx, GitHub Actions CI/CD
