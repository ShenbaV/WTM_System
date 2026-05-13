# Wallet & Transaction Management System

A full-stack wallet application that lets registered users hold a balance, add money, transfer money to other users, and review their full transaction history.

- **Backend**: Node.js, Express, TypeScript, PostgreSQL via **TypeORM**, JWT, bcrypt, Zod, Swagger.
- **Frontend**: React + Vite + TypeScript, MUI, TanStack Query, React Router DOM, Axios, notistack.
- **Database**: PostgreSQL (Supabase compatible). Money is stored as `BIGINT` in minor units (paise/cents) — never as floats.
- **Transfers**: a single TypeORM transaction with `setLock('pessimistic_write')` (`SELECT … FOR UPDATE`) on both wallet rows to guarantee consistency under concurrency.

---

## Repository layout

```
.
├── backend/
│   └── src/
│       ├── config/
│       │   ├── data-source.ts     # TypeORM DataSource + withTransaction helper
│       │   ├── env.ts
│       │   └── swagger.ts
│       ├── entities/              # User, Wallet, Transaction (TypeORM entities)
│       ├── middleware/            # auth, validate, error
│       ├── migrations/            # TypeORM migrations
│       ├── modules/
│       │   ├── auth/              # register, login
│       │   ├── wallet/            # balance, add-money, transfer
│       │   └── transaction/       # history
│       ├── scripts/migrate.ts     # runs TypeORM migrations
│       ├── types/
│       ├── utils/                 # ApiError, asyncHandler, jwt, money
│       ├── app.ts
│       └── server.ts
└── frontend/
    └── src/
        ├── components/            # BalanceCard, TransactionsTable, StatCard, EmptyState,
        │                          # StatusBadge, CurrencyInput, ConfirmDialog, UserAvatar, PasswordField
        ├── hooks/                 # useAuth, useWallet, useTransactions
        ├── layouts/               # AppLayout, AuthLayout
        ├── pages/                 # Login, Register, Dashboard, AddMoney, Transfer, TransactionHistory
        ├── routes/                # ProtectedRoute, PublicOnlyRoute
        ├── services/              # api client + auth/wallet/transaction services
        ├── store/                 # auth (localStorage)
        ├── types/                 # shared API types
        ├── utils/                 # formatting helpers
        ├── theme.ts
        ├── App.tsx
        └── main.tsx
```

---

## Prerequisites

- Node.js **18+**
- npm **9+**
- A PostgreSQL database — easiest path is a free [Supabase](https://supabase.com/) project.

---

## 1. Database setup (via TypeORM migration)

1. Create a project on Supabase. From **Project Settings → Database**, copy the **Connection String** (URI, with your password).
2. Put that URI into `backend/.env` as `DATABASE_URL` (and set `DB_SSL=true` for Supabase).
3. Apply the schema with the TypeORM migration runner:

   ```bash
   cd backend
   npm install
   npm run migrate
   ```

   This runs the migrations in [`backend/src/migrations/`](backend/src/migrations) (currently `InitSchema1715600000000`) inside a single transaction, creating `users`, `wallets`, `transactions` and enabling `pgcrypto` for `gen_random_uuid()`. The migration uses `IF NOT EXISTS` guards and is tracked in a `typeorm_migrations` table, so it is safe to re-run.

   To roll the last migration back:

   ```bash
   npm run migrate:revert
   ```

### Schema overview

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
npm run migrate            # apply TypeORM migrations (idempotent)
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
| `npm run migrate` | Apply pending TypeORM migrations |
| `npm run migrate:revert` | Roll back the most recent migration |

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
4. Click **Transfer**, enter the second account's email, review the confirmation, and send.
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

Implemented in [`wallet.service.ts`](backend/src/modules/wallet/wallet.service.ts) using a TypeORM `QueryRunner`:

1. **Reject self-transfer by email** before opening the transaction.
2. **`withTransaction`** opens a single PG transaction via `QueryRunner.startTransaction()`.
3. **Resolve receiver** (user + wallet) by email using the transaction-bound manager.
4. **Reject self-transfer by user id** (defence-in-depth).
5. **Lock both wallet rows** in a single query with TypeORM's `setLock('pessimistic_write')` (`SELECT … FOR UPDATE`), ordered by `wallet.id ASC`. The deterministic lock order eliminates deadlocks when two users transfer to each other simultaneously.
6. **Validate balance** *after* the locks are held to avoid TOCTOU races.
7. **Debit sender + credit receiver** with `repo.save([sender, receiver])`.
8. **Insert** the `transactions` row.
9. **`commitTransaction()`**. Any thrown error triggers `rollbackTransaction()` in `withTransaction`'s `catch`, so callers never see a partial debit/credit.

Money is stored as `BIGINT` minor units (paise/cents). The frontend submits amounts in major units (e.g. `100.50`) and the backend converts using `toMinorUnits` / `fromMinorUnits` ([`utils/money.ts`](backend/src/utils/money.ts)). The `wallets.balance` column has a `CHECK (balance >= 0)` constraint (`Check('balance_non_negative', ...)`) as a final guardrail.

Validation rules enforced server-side:

- Receiver must exist.
- `amount > 0` and finite (Zod).
- Sender ≠ receiver (by email **and** user id).
- Sender's locked balance ≥ amount.

---

## 7. Security

- Passwords hashed with **bcrypt** (10 rounds).
- JWT signed with `JWT_SECRET`, attached via `Authorization: Bearer <token>` and verified by `auth.middleware`.
- Express hardened with `helmet` and `cors` (origin allowlist).
- All request payloads validated by `Zod` schemas via the `validate` middleware before reaching controllers.
- Centralized error handler returns consistent error JSON and hides internal details outside development.
- TypeORM uses parameterized queries everywhere — no string concatenation.

---

## 8. UI/UX

The frontend is built for clarity and to handle every edge case:

- **Polished theme** with a modern fintech palette, custom shadows, Inter typography, soft radii.
- **Two-column auth layout** with a hero panel (features) on the left and a focused form on the right.
- **App shell** with a sticky topbar (frosted glass) and a left sidebar with active route highlighting and a footer user card with logout.
- **Dashboard**: hero balance card (gradient + show/hide balance), three stat cards (received / sent / transfers), quick action cards, recent activity.
- **Add money**: quick amount chips, currency input with `₹` prefix, live "balance after top-up" preview.
- **Transfer**: currency input, real-time validation (self-transfer, insufficient balance, invalid amount), an inline "Add money" CTA when balance is short, and a **confirmation dialog** that previews recipient, amount, remaining balance, and note.
- **Transaction history**: filter tabs (All / Received / Sent / Top-ups), pagination, responsive layout (table on desktop, cards on mobile), relative dates with hover tooltips showing the full date, status badges, avatar-based counterparty display.
- **Loading & empty states**: skeletons match real content shape; empty states have a friendly icon, message and CTA.
- **Errors**: shown both inline (Alert) and as toasts (notistack).
- **Mobile**: drawer-based navigation, stacked layouts, card-based transaction list.

---

## 9. Deliverables checklist

- [x] Source code (`backend/`, `frontend/`)
- [x] README with setup instructions (this file)
- [x] Database schema (TypeORM migration in [`backend/src/migrations/`](backend/src/migrations))
- [x] API documentation (Swagger at `/api/docs`)
- [x] Working frontend and backend
- [x] `.env.example` for both apps
