# Deployment Guide

## Local Development (Zero Dependencies)

```bash
# 1. Start Backend
cd apps/api
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# 2. Start Frontend
cd ../web
npm install
npm run dev
```

Frontend runs at: `http://localhost:5185`  
API Swagger runs at: `http://127.0.0.1:8000/docs`

## Docker Deployment (Production)

```bash
docker compose up -d --build
```

Services started:
- `contractflow-api`: FastAPI REST engine on port 8000.
- `contractflow-web`: Nginx-served React SPA on port 3000.
- `contractflow-db`: PostgreSQL 16 on port 5432.

---

## Production TLS Termination & Automatic HTTPS

### Option 1: Caddy Reverse Proxy (Recommended, Zero-Config HTTPS)

Caddy automatically provisions and renews Let's Encrypt / ZeroSSL TLS certificates with HTTP/3 support:

1. Configure your domain in `.env`:
   ```bash
   DOMAIN_NAME=clm.yourcompany.com
   ACME_EMAIL=admin@yourcompany.com
   ```
2. Start the production stack:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
3. Caddy will bind ports `80` and `443`, automatically acquire an SSL certificate, and reverse proxy traffic to the web client and FastAPI backend.

### Option 2: Nginx with Certbot / Custom SSL

If your infrastructure uses existing wildcard or enterprise certificates:
1. Review `infrastructure/nginx/nginx.conf` and `infrastructure/nginx/conf.d/contractflow.conf`.
2. Mount your `fullchain.pem` and `privkey.pem` into `/etc/letsencrypt/live/${DOMAIN_NAME}/`.
3. All HTTP traffic on port 80 is automatically upgraded to HTTPS with modern cipher suites and HSTS enabled.

---

## Outbound Email Notifications (SendGrid / Amazon SES)

In `.env`, configure your transactional SMTP provider:

### SendGrid Setup:
```bash
SMTP_ENABLED=true
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your_api_key_here
SMTP_FROM=contracts@yourcompany.com
SMTP_TLS=true
```

### Amazon SES Setup:
```bash
SMTP_ENABLED=true
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=AKIAIOSFODNN7EXAMPLE
SMTP_PASSWORD=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
SMTP_FROM=contracts@yourcompany.com
SMTP_TLS=true
```
When `SMTP_ENABLED=false`, ContractFlow safely captures and logs all outgoing email previews to the application console without attempting external network calls.
