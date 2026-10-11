# Venus Forex

Web application for **Venus Forex Pvt Ltd**, an RBI-authorised Full Fledged Money Changer (FFMC) in Chennai.
It combines the company website (home, about, services, rates, contact) with live exchange rates,
a rate-forecast tool (FinSight), and an account-based currency exchange flow secured with card
validation and email OTP.

- **Frontend:** React 18 + Vite + Tailwind CSS (custom stylesheet matching the Venus brand design)
- **Backend:** FastAPI + SQLAlchemy (SQLite by default)
- **Auth:** JWT bearer tokens, bcrypt password hashing, email OTP

---

## Table of contents

1. [Features](#features)
2. [Project structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Quick start](#quick-start)
5. [Configuration (.env)](#configuration-env)
6. [How it works](#how-it-works)
7. [API reference](#api-reference)
8. [Frontend routes](#frontend-routes)
9. [Data model](#data-model)
10. [Testing the app](#testing-the-app)
11. [Production build](#production-build)
12. [Troubleshooting](#troubleshooting)
13. [Security notes](#security-notes)

---

## Features

**Public website**
- Home, About, Services, Rates, Contact pages in the Venus design (red / blue brand palette, company logo)
- Scrolling forex-news ticker (headlines fetched by the backend, with a static fallback)
- Live rates table (we buy / we sell / card rate) and a currency converter
- Enquiry and contact forms delivered by email (see [Enquiry forms](#enquiry-forms))

**FinSight forecast**
- 60-day history chart with 7-day moving average and a next-day forecast point
- Volatility-adaptive spread regime (Tight / Standard / Wide)
- Inventory signal (Accumulate / Hold / Reduce)
- All-currency spread overview table

**Accounts and exchange**
- Registration with email OTP verification, login, sign out
- Buy or sell forex: live-rate preview, GST and TCS estimate, Luhn-validated card number
- Transaction is confirmed with an emailed OTP
- Transaction history with pagination and cancel for pending transactions

---

## Project structure

```
venus_forex_app/
├── README.md
├── run_backend.sh            # starts the API (bash)
├── run_frontend.sh           # starts the dev server (bash)
├── backend/
│   ├── main.py               # FastAPI app, CORS, router registration
│   ├── database.py           # SQLAlchemy engine / session
│   ├── models.py             # User, OTP, Transaction, RateCache
│   ├── schemas.py            # Pydantic request/response models
│   ├── dependencies.py       # JWT creation/validation, current-user dependencies
│   ├── requirements.txt
│   ├── .env.example          # copy to .env
│   ├── routers/
│   │   ├── auth.py           # register, login, OTP send/verify, /me
│   │   ├── rates.py          # live, history, forecast, convert, news
│   │   ├── cards.py          # card validation
│   │   └── transactions.py   # create, list, verify OTP, cancel, admin list
│   └── services/
│       ├── rates.py          # ExchangeRate-API + Frankfurter clients, spreads
│       ├── forecast.py       # FinSight forecast model
│       ├── luhn.py           # Luhn card validation and network detection
│       └── otp.py            # OTP generation and email delivery
└── frontend/
    ├── index.html
    ├── vite.config.js        # dev server on 5173, /api proxy to :8000
    ├── tailwind.config.js
    ├── public/logo.png       # company logo
    └── src/
        ├── main.jsx, App.jsx # entry point and routes
        ├── index.css         # site-wide design stylesheet
        ├── hooks.js          # shared live-rates hook
        ├── enquiry.js        # enquiry/contact form submission
        ├── api/              # axios client and API wrappers
        ├── context/          # AuthContext (login state)
        ├── components/       # NavBar, Footer, NewsTicker, Layout, OTPModal, CardInput
        └── pages/            # Home, About, Services, Rates, Contact, Forecast,
                              # Exchange, History, Login, Register
```

---

## Prerequisites

| Tool    | Version                |
|---------|------------------------|
| Python  | 3.10 or newer (3.11 tested) |
| Node.js | 18 or newer            |
| npm     | bundled with Node      |

Internet access is required at runtime for live rates (ExchangeRate-API), historical data
(Frankfurter / ECB), and the news ticker.

---

## Quick start

Use two terminals.

### 1. Backend

```bash
cd venus_forex_app/backend

# first time only
pip install -r requirements.txt
cp .env.example .env          # then edit .env (see Configuration)

# every time
uvicorn main:app --reload --port 8000
```

You should see `Uvicorn running on http://127.0.0.1:8000`.
Interactive API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd venus_forex_app/frontend

# first time only
npm install

# every time
npm run dev
```

Open http://localhost:5173.

The frontend calls the API through the Vite proxy at `/api` (rewritten to `http://localhost:8000`),
so no CORS setup is needed in development.

> On Linux/macOS you can use `./run_backend.sh` and `./run_frontend.sh` instead.

---

## Configuration (.env)

Create `backend/.env` from `backend/.env.example`.

| Variable | Purpose | Default |
|----------|---------|---------|
| `SECRET_KEY` | JWT signing key. Generate with `python -c "import secrets; print(secrets.token_hex(32))"` | `change-this-in-production` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Login token lifetime | `1440` (24 h) |
| `DATABASE_URL` | SQLAlchemy URL | `sqlite:///./venus_forex.db` |
| `EXCHANGE_RATE_API_KEY` | Key for [ExchangeRate-API v6](https://app.exchangerate-api.com/dashboard) | built-in demo key |
| `SMTP_HOST` / `SMTP_PORT` | Mail server for OTP emails | `smtp.gmail.com` / `587` |
| `SMTP_USER` / `SMTP_PASSWORD` | SMTP login (for Gmail use an [App Password](https://myaccount.google.com/apppasswords)) | empty |
| `EMAIL_FROM` | From header on OTP emails | `Venus Forex <venusforex2005@gmail.com>` |
| `DEV_MODE` | `true`: OTP is printed in the backend console and returned in the API response instead of being emailed. `false`: OTP is emailed via SMTP | `true` |

**Local development tip:** set `DEV_MODE=true`. You then read OTP codes from the backend console
(and the `dev_otp` field in the `/auth/otp/send` response) and do not need working SMTP credentials.

Optional frontend variable: `VITE_API_URL` overrides the API base URL (default `/api`, used with the Vite proxy).

---

## How it works

### Rates and spreads
- Mid rates come from ExchangeRate-API (USD base, converted to INR per unit).
- Venus applies a per-currency spread (1.5% to 1.8%, default 2.0%).
- API fields: `buy_rate` = mid plus spread (what a customer **pays** to buy forex), `sell_rate` = mid minus spread (what a customer **receives** when selling forex).
- The website labels these from Venus's point of view: **We buy** = `sell_rate`, **We sell** = `buy_rate`. The **card rate** is mid × 1.005.
- JPY is shown per 100 units in history and forecast.

### FinSight forecast
- Fetches ~120 days of ECB history from Frankfurter (AED and SAR are derived from USD via their pegs).
- Features: lagged returns, 7- and 21-day moving averages, rolling volatility.
- Forecast blends a mean-reversion signal (35%) and a momentum signal (15%).
- Spread regime: Tight (volatility below the 30th percentile), Wide (above the 70th), otherwise Standard.
- Inventory signal: Accumulate if the forecast rise exceeds 0.20%, Reduce if the fall exceeds 0.20%, otherwise Hold.
- Indicative only. This is not financial advice.

### Exchange flow
1. Sign in (or register and verify email with an OTP).
2. Choose Buy or Sell, currency, amount, and enter a card number (validated with the Luhn algorithm and network detection).
3. The app previews rate, INR amount, GST, TCS, and total.
4. Submitting creates a **pending** transaction and emails a transaction OTP.
5. Enter the OTP in the modal. The backend verifies it for that transaction and marks it **completed**.
6. View it under **History**; pending transactions can be cancelled.

OTPs are 6 digits, valid for 10 minutes, with a maximum of 3 attempts.

### Enquiry forms
The Home "Quick enquiry" and Contact forms post to formsubmit.co, which emails the submission.
The destination address is the `ENDPOINT` constant in `frontend/src/enquiry.js`
(`https://formsubmit.co/ajax/<email>`). The first submission triggers an activation email to that
address; delivery starts after the link is clicked.

### News ticker
The backend endpoint `GET /rates/news` reads an investing.com forex RSS feed, caches it for 10 minutes,
and falls back to a fixed headline list if the feed is unavailable.

---

## API reference

Base URL (dev): `http://localhost:8000` (or `/api` through the Vite proxy). Authenticated endpoints need
`Authorization: Bearer <token>`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` , `/health` | no | Service status |
| POST | `/auth/register` | no | Create account (`name`, `email`, `phone?`, `password` min 8 chars) |
| POST | `/auth/login` | no | Returns `access_token` plus user info |
| GET | `/auth/me` | yes | Current user |
| POST | `/auth/otp/send` | no | Send OTP (`email`, `purpose`: `login` / `register` / `transaction`) |
| POST | `/auth/otp/verify` | no | Verify OTP (`email`, `otp_code`, `purpose`) |
| GET | `/rates/live` | no | All currencies with mid, buy, sell, spread |
| GET | `/rates/history/{currency}?days=` | no | Historical INR rate points |
| GET | `/rates/forecast/{currency}?days=` | no | FinSight forecast, spread regime, inventory signal, history |
| GET | `/rates/convert?from_currency=&to_currency=&amount=` | no | Currency conversion |
| GET | `/rates/news` | no | Headlines for the ticker |
| POST | `/cards/validate` | no | Luhn check and card network (`card_number`) |
| POST | `/transactions/` | yes | Create a pending transaction and email an OTP |
| GET | `/transactions/` | yes | List own transactions (`page`, `page_size`, `status`, `currency`) |
| GET | `/transactions/{id}` | yes | Get one transaction |
| POST | `/transactions/{id}/verify-otp` | yes | Confirm with OTP (`otp_code`) and complete |
| POST | `/transactions/{id}/cancel` | yes | Cancel a pending transaction |
| GET | `/transactions/admin/all` | staff/admin | All transactions |

Supported currencies: USD, EUR, GBP, SGD, AED, SAR, JPY, CAD, CHF, AUD, HKD, NZD.

---

## Frontend routes

| Path | Page |
|------|------|
| `/` | Home |
| `/about` | About |
| `/services` | Services |
| `/rates` | Rates and converter |
| `/contact` | Contact, map, FAQ |
| `/forecast` | FinSight forecast (`?currency=USD`) |
| `/exchange` | Buy / sell forex |
| `/history` | My transactions (sign-in required) |
| `/login`, `/register` | Account pages |

---

## Data model

SQLite tables are created automatically on backend startup.

- **User**: name, email, phone, password hash, role (`customer` / `staff` / `admin`), verified and active flags
- **OTP**: email, code, purpose, expiry, attempts, used flag
- **Transaction**: type (buy/sell), currency, foreign amount, INR amount, rate used, spread, GST, TCS, card last 4 and type, status (`pending` / `otp_verified` / `completed` / `cancelled` / `failed`), purpose, notes
- **RateCache**: cached rate snapshots

Card numbers are validated but **only the last 4 digits and card type are stored**.

To make a user an admin, update their `role` column in `backend/venus_forex.db`.

---

## Testing the app

1. Start both servers and open http://localhost:5173.
2. Browse Home, Rates, Forecast. Rates and the forecast chart should load without errors.
3. Register an account. With `DEV_MODE=true`, copy the OTP from the backend console and verify.
4. Sign in, open **Exchange**, enter a test card number such as `4111 1111 1111 1111` (a valid Visa test number), choose an amount, submit, and enter the OTP from the console.
5. Open **History** to see the completed transaction.

Handy checks:
```bash
curl http://localhost:8000/health
curl http://localhost:8000/rates/live
curl http://localhost:8000/rates/forecast/USD
```

---

## Production build

```bash
cd frontend
npm run build        # outputs frontend/dist
```

Serve `dist/` from any static host or reverse proxy, and route `/api` to the FastAPI app
(or set `VITE_API_URL` at build time to the API's full URL). For production:
- Set a strong `SECRET_KEY` and `DEV_MODE=false` with valid SMTP credentials.
- Use a production database via `DATABASE_URL` instead of SQLite.
- Restrict CORS origins in `backend/main.py` (`ALLOWED_ORIGINS`) to your domain.
- Run uvicorn without `--reload` (for example behind gunicorn or a process manager).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Backend crashes at startup with a `UnicodeEncodeError` | Use the current `main.py` (startup message is ASCII). Older versions printed a check-mark that Windows consoles cannot encode |
| Registration returns 500 mentioning `bcrypt` | Install the pinned version: `pip install bcrypt==4.0.1` (already in `requirements.txt`) |
| Login works but every authenticated call returns 401 | Make sure the backend runs the current code. The JWT `sub` claim must be a string |
| Forecast or history fails with a `301 Moved Permanently` for `api.frankfurter.app` | Restart the backend. The current code uses `https://api.frankfurter.dev/v1` and follows redirects. A running server keeps old code until restarted |
| Code changes do not show up | Restart uvicorn (and `npm run dev` if the page is blank after large edits) |
| No OTP email arrives | Use `DEV_MODE=true` for local work, or check `SMTP_USER` / `SMTP_PASSWORD` (Gmail needs an App Password) |
| Enquiry form says "Could not send" | Check internet access and that the formsubmit.co activation link has been clicked |
| Flag emojis appear as letters (US, EU) | Windows browsers do not render flag emojis; this is cosmetic |
| Port already in use | Stop the old process (`netstat -ano \| findstr :8000`) or change the port |

---

## Security notes

- `backend/.env` contains secrets (SMTP password, JWT key). **Never commit it.** Add it to `.gitignore`.
- The ExchangeRate-API key has a built-in demo default. Use your own key via `EXCHANGE_RATE_API_KEY`.
- Rates, forecasts, and spreads are indicative; final rates are confirmed at the counter.
- Regulatory points shown on the site (LRS limit, TCS, GST, cash limits) should be reviewed by compliance before publishing.

---

© Venus Forex Private Limited. RBI-authorised FFMC under FEMA 1999.
