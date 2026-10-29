# CRM API

> Part of the full-stack submission. The React application is in [`../reactjs/`](../reactjs/README.md) and is live at [craving-web.vercel.app](https://craving-web.vercel.app).

REST API for a counselor CRM. Employees authenticate, view incoming student enquiries, and claim leads. A claimed lead is visible only to the counselor who claimed it.

## Features

- Employee registration and JWT login
- Public enquiry submission without authentication
- Shared pool of unclaimed enquiries
- Atomic claiming: exactly one counselor wins a raced claim
- Private "my leads" view scoped to the authenticated employee
- Pagination, Zod validation, and consistent error responses
- PostgreSQL persistence with Prisma 7

## Stack

- Node.js + Express
- PostgreSQL 16 via Docker Compose
- Prisma ORM 7 with `@prisma/adapter-pg`
- JWT (`jsonwebtoken`) and bcrypt (`bcryptjs`)
- Validation (`zod`)

## Quick start

Prerequisites: Node.js 20.19+ and Docker.

From the repository root:

```bash
cd nodejs

cp .env.example .env
# Set JWT_SECRET to a random value of at least 32 characters:
# openssl rand -hex 32

npm install
npm run db:up        # PostgreSQL on localhost:5434, waits for health
npm run db:migrate   # applies the committed migration
npm run dev          # API on http://localhost:4000
```

```bash
curl http://localhost:4000/health
# {"status":"ok","uptime":1.23}
```

The Docker host port is **5434** to avoid conflicts with a local PostgreSQL instance. If it changes, update `docker-compose.yml` and `DATABASE_URL` together.

## Configuration

| Variable | Purpose | Default |
|---|---|---|
| `NODE_ENV` | Runtime mode | `development` |
| `PORT` | HTTP port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | see `.env.example` |
| `JWT_SECRET` | JWT signing secret, minimum 32 characters | required |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |

`.env` is ignored by Git; `.env.example` is the committed template.

## API

Base URL: `http://localhost:4000`. Protected routes require:

```http
Authorization: Bearer <token>
```

Successful responses use `{ "data": ... }`. Errors use `{ "error": { "message": "...", "code": "..." } }`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create an employee account |
| `POST` | `/api/auth/login` | Public | Authenticate and receive a JWT |
| `GET` | `/api/auth/me` | JWT | Return the current employee |
| `POST` | `/api/enquiries` | Public | Submit an enquiry |
| `GET` | `/api/enquiries/unclaimed` | JWT | List unclaimed enquiries |
| `GET` | `/api/enquiries/my` | JWT | List enquiries claimed by the current employee |
| `POST` | `/api/enquiries/:id/claim` | JWT | Claim an enquiry |

`GET /api/enquiries/public` is an alias for `/api/enquiries/unclaimed`.

### Authentication

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Asha Counselor","email":"asha@example.com","password":"Password123!"}'
```

`201 Created` returns `{ data: { employee, token } }`. Duplicate email returns `409 EMAIL_IN_USE`.

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"asha@example.com","password":"Password123!"}'
```

`200 OK` returns the same shape. Invalid credentials return `401 INVALID_CREDENTIALS`.

### Submit an enquiry (public)

```bash
curl -X POST http://localhost:4000/api/enquiries \
  -H 'Content-Type: application/json' \
  -d '{
    "name":"Rahul Student",
    "email":"rahul@example.com",
    "phone":"+919999999999",
    "courseInterest":"Full Stack Development",
    "message":"Please call after 6pm."
  }'
```

`201 Created` returns the enquiry with `claimedById: null` and `claimedAt: null`. Validation failures return `400 VALIDATION_ERROR` with field-level details.

### List enquiries

```bash
curl 'http://localhost:4000/api/enquiries/unclaimed?page=1&limit=20' \
  -H "Authorization: Bearer $TOKEN"

curl 'http://localhost:4000/api/enquiries/my?page=1&limit=20' \
  -H "Authorization: Bearer $TOKEN"
```

Both lists return `{ data: [...], meta: { page, limit, total, totalPages } }`. Query parameters: `page` (default `1`) and `limit` (default `20`, maximum `100`). `/my` is scoped to the employee ID in the verified JWT.

### Claim an enquiry

```bash
curl -X POST http://localhost:4000/api/enquiries/4a6d.../claim \
  -H "Authorization: Bearer $TOKEN"
```

| Case | Status | Code |
|---|---|---|
| Claim succeeded | `200` | — |
| Enquiry does not exist | `404` | `ENQUIRY_NOT_FOUND` |
| Already claimed | `409` | `ENQUIRY_ALREADY_CLAIMED` |
| Malformed UUID | `400` | `VALIDATION_ERROR` |
| Missing or invalid JWT | `401` | `UNAUTHORIZED` / `INVALID_TOKEN` |

## Claim concurrency

Claiming uses one conditional update, not a read-then-write:

```js
const result = await prisma.enquiry.updateMany({
  where: { id, claimedById: null },
  data: { claimedById: req.user.id, claimedAt: new Date() },
});
```

PostgreSQL evaluates the condition and writes in one statement. When two counselors race for the same lead, only one can update a row whose `claimedById` is still `null`. A count of `1` means the claim succeeded; `0` means the enquiry is missing (`404`) or already claimed (`409`).

## Data model

```
employees: id, name, email (unique), passwordHash, createdAt, updatedAt
enquiries: id, name, email, phone, courseInterest, message,
           claimedById (nullable FK -> employees.id), claimedAt,
           createdAt, updatedAt
```

Indexes: unique `employees.email`, `enquiries.claimedById`, `enquiries.createdAt`.

## Testing

With the API running:

```bash
npm run smoke
```

The suite covers registration, login, duplicate emails, public submission, validation, the unclaimed pool, JWT scoping, concurrent claiming, claimed-lead privacy, missing records, and malformed input.

## Project structure

```
nodejs/
├── docker-compose.yml
├── prisma.config.mjs
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── scripts/smoke.js
├── src/
│   ├── config/env.js
│   ├── controllers/
│   ├── lib/prisma.js
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── validators/
│   ├── app.js
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

## Implementation notes

- Identity is taken only from the verified JWT; claim and "my leads" never accept an employee ID from the client.
- Passwords use bcrypt cost 12 and are excluded from every response.
- The public form is unauthenticated but fully validated with Zod.
- Helmet and CORS are enabled; JSON bodies are limited to 100 KB.
- Prisma 7 uses the PostgreSQL driver adapter; the CLI datasource is configured in `prisma.config.mjs`.
