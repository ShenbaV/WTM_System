# Wallet & Transaction Management System

A full-stack wallet application that lets registered users hold a balance, add money, transfer money to other users, and review their full transaction history.

- **Backend**: Node.js, Express, TypeScript, PostgreSQL (via `pg` raw SQL), JWT, bcrypt, Zod, Swagger.
- **Frontend**: React + Vite + TypeScript, MUI, TanStack Query, React Router DOM, Axios.
- **Database**: PostgreSQL (Supabase compatible). Money is stored as `BIGINT` in minor units (paise/cents) — never as floats.
- **Transfers**: implemented inside a single PostgreSQL transaction with `SELECT … FOR UPDATE` row-locking on both wallets to guarantee consistency under concurrency.

---

## Repository layout

```
.
├── backend/
│   ├── db/schema.sql              # full SQL schema
│   └── src/
│       ├── config/                # env, db pool, swagger
│       ├── middleware/            # auth, validate, error
│       ├── modules/
│       │   ├── auth/              # register, login
│       │   ├── wallet/            # balance, add-money, transfer
│       │   └── transaction/       # history
│       ├── types/
│       ├── utils/                 # ApiError, asyncHandler, jwt, money
│       ├── app.ts                 # express app composition
│       └── server.ts              # bootstrap
└── frontend/
    └── src/
        ├── components/            # BalanceCard, TransactionsTable
        ├── hooks/                 # useAuth, useWallet, useTransactions
        ├── layouts/               # AppLayout, AuthLayout
        ├── pages/                 # Login, Register, Dashboard, AddMoney, Transfer, TransactionHistory
        ├── routes/                # ProtectedRoute, PublicOnlyRoute
        ├── services/              # api client + auth/wallet/transaction services
        ├── store/                 # auth (localStorage)
        ├── types/                 # shared API types
        ├── utils/                 # formatting helpers
        ├── App.tsx
        └── main.tsx
```

---

## Prerequisites

- Node.js **18+**
- npm **9+**
- A PostgreSQL database — easiest path is a free [Supabase](https://supabase.com/) project.

---

## 1. Database setup (Supabase or any PostgreSQL)

1. Create a project on Supabase. From **Project Settings → Database**, copy the **Connection String** (URI, with your password).
2. Put that URI into `backend/.env` as `DATABASE_URL` (and set `DB_SSL=true` for Supabase).
3. Apply the schema with the bundled migration script:

   ```bash
   cd backend
   npm install
   npm run migrate
   ```

   This runs [`backend/db/schema.sql`](backend/db/schema.sql) against your `DATABASE_URL` inside a single transaction, creating `users`, `wallets`, `transactions` and enabling `pgcrypto` for `gen_random_uuid()`. The schema uses `IF NOT EXISTS` guards, so the script is safe to re-run.

The schema in short:

| Table | Key columns |
| --- | --- |
| `users` | `id UUID PK`, `name`, `email UNIQUE`, `password_hash`, `created_at` |
| `wallets` | `id UUID PK`, `user_id UUID UNIQUE FK`, `balance BIGINT >= 0`, `created_at` |
| `transactions` | `id UUID PK`, `sender_wallet_id FK?`, `receiver_wallet_id FK?`, `type ('DEPOSIT'|'TRANSFER')`, `amount BIGINT > 0`, `status ('SUCCESS'|'FAILED'|'PENDING')`, `description`, `created_at` |

---

## 2. Backend setup

```bash
cd backend
cp .env.example .env       # fill in DATABASE_URL and JWT_SECRET
npm install
npm run migrate            # apply backend/db/schema.sql (idempotent)
npm run dev                # http://localhost:4000
```

`backend/.env` keys:

| Key | Description |
| --- | --- |
| `PORT` | API port (default `4000`) |
| `NODE_ENV` | `development` or `production` |
| `DATABASE_URL` | full Postgres connection string (Supabase URI) |
| `DB_SSL` | `true` for Supabase / any TLS host |
| `JWT_SECRET` | long random secret used to sign JWTs |
| `JWT_EXPIRES_IN` | e.g. `7d`, `1h` |
| `CORS_ORIGIN` | comma-separated allowed origins (default `http://localhost:5173`) |

Once the server is running:

- **Swagger UI**: <http://localhost:4000/api/docs>
- **OpenAPI JSON**: <http://localhost:4000/api/docs.json>
- **Health**: <http://localhost:4000/health>

### Backend scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start with `ts-node-dev` and hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled `dist/server.js` |
| `npm run migrate` | Apply `db/schema.sql` against `DATABASE_URL` |

---

## 3. Frontend setup

```bash
cd frontend
cp .env.example .env       # default points to http://localhost:4000/api
npm install
npm run dev                # http://localhost:5173
```

`frontend/.env`:

| Key | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL for the backend, e.g. `http://localhost:4000/api` |

### Frontend scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check and production build to `dist/` |
| `npm run preview` | Preview the production build locally |

---

## 4. End-to-end flow

1. Open <http://localhost:5173>.
2. Register two accounts (in two browsers, or one normal + one incognito).
3. Sign in to the first account, click **Add money**, top up the wallet.
4. Click **Transfer**, enter the second account's email, and send money.
5. Both accounts see the transaction on the **Transactions** page with sender, receiver, amount, status and date.

---

## 5. API reference

All endpoints return:

```json
{ "success": true|false, "message": "string", "data": ..., "error": ... }
```

### Auth

| Method | Path | Body | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | `{ name, email, password }` | — |
| POST | `/api/auth/login` | `{ email, password }` | — |

Both return `{ token, user }`. Send `Authorization: Bearer <token>` on protected endpoints.

### Wallet (auth required)

| Method | Path | Body | Description |
| --- | --- | --- | --- |
| GET | `/api/wallet` | — | Get current user's wallet |
| POST | `/api/wallet/add-money` | `{ amount }` | Add money to wallet |
| POST | `/api/wallet/transfer` | `{ receiverEmail, amount, description? }` | Transfer money to another user |

### Transactions (auth required)

| Method | Path | Query | Description |
| --- | --- | --- | --- |
| GET | `/api/transactions` | `limit`, `offset` | Paginated transaction history (most recent first) |

Full request/response schemas are available in **Swagger UI** at `/api/docs`.

---

## 6. Transfer logic — concurrency & consistency

The transfer endpoint is the critical piece of the system. The flow inside `walletService.transfer` is:

1. **Reject self-transfer by email**.
2. **Open a single PG transaction** (`BEGIN`).
3. **Resolve receiver** (user + wallet) by email.
4. **Reject self-transfer by user id** (defence-in-depth).
5. **Lock both wallets** with `SELECT … FOR UPDATE`, ordered by `wallet.id ASC`. The deterministic lock order is what prevents deadlocks when two users transfer to each other simultaneously.
6. **Validate balance** *after* the locks are held (avoids TOCTOU races).
7. **Debit sender**.
8. **Credit receiver**.
9. **Insert** the `transactions` row.
10. **COMMIT**. On any thrown error, the wrapping `withTransaction` helper issues `ROLLBACK`, so the caller never sees a partial debit or credit.

Money is stored as `BIGINT` minor units (paise/cents). The frontend submits amounts in major units (e.g. `100.50`) and the backend converts using `toMinorUnits` / `fromMinorUnits` (`backend/src/utils/money.ts`). The `wallets.balance` column has a `CHECK (balance >= 0)` constraint as a final guardrail.

Validation rules enforced server-side:

- Receiver must exist.
- `amount > 0` and finite.
- Sender ≠ receiver (by email **and** user id).
- Sender's locked balance ≥ amount.

---

## 7. Security

- Passwords hashed with **bcrypt** (10 rounds).
- JWT signed with `JWT_SECRET`, attached via `Authorization: Bearer <token>` and verified by `auth.middleware`.
- Express hardened with `helmet` and `cors` (origin allowlist).
- All request payloads validated by `Zod` schemas via the `validate` middleware before reaching controllers.
- Centralized error handler returns consistent error JSON and hides internal details outside development.
- Database access uses parameterized queries — no string concatenation, no ORM.

---

## 8. Deliverables checklist

- [x] Source code (`backend/`, `frontend/`)
- [x] README with setup instructions (this file)
- [x] Database schema (`backend/db/schema.sql`)
- [x] API documentation (Swagger at `/api/docs`)
- [x] Working frontend and backend
- [x] `.env.example` for both apps
