# Full Stack Developer Submission

This repository contains both applications submitted for the Full Stack Developer role.

| Folder | Application | Stack | Demo |
|---|---|---|---|
| [`nodejs/`](nodejs/README.md) | CRM REST API | Node.js, Express, PostgreSQL, Prisma 7, JWT | Runs locally |
| [`reactjs/`](reactjs/README.md) | Restaurant discovery app | React 19, Vite 6, React Router 7 | [craving-web.vercel.app](https://craving-web.vercel.app) |

## Repository layout

```text
fullstack-assignments/
├── nodejs/          # Backend assignment
│   ├── src/
│   ├── prisma/
│   ├── scripts/
│   ├── docker-compose.yml
│   └── README.md
├── reactjs/         # Frontend assignment
│   ├── src/
│   ├── public/
│   ├── screenshots/
│   └── README.md
└── README.md
```

## Backend

The CRM API supports employee registration/login, public enquiry submission, atomic lead claiming, and private lead views. See [`nodejs/README.md`](nodejs/README.md) for the full API reference.

```bash
cd nodejs
cp .env.example .env
# Set JWT_SECRET to a random value of at least 32 characters.

npm install
npm run db:up
npm run db:migrate
npm run dev
```

The API runs at `http://localhost:4000`. PostgreSQL runs on port `5434`.

Verification:

```bash
npm run smoke
```

The suite covers 26 checks, including two counselors claiming the same enquiry concurrently.

## Frontend

The React app implements the login, OTP verification, restaurant listing, restaurant detail, and cart screens. See [`reactjs/README.md`](reactjs/README.md) for setup and implementation details.

```bash
cd reactjs
npm install
npm run dev
```

Open `http://localhost:5173`.

**Live demo:** [craving-web.vercel.app](https://craving-web.vercel.app)

**Demo credentials:**

```text
Mobile: 9818979450
OTP:    123456
```

The login and OTP screens include one-tap demo buttons.

## Verification

- Backend smoke suite: 26/26 checks passed
- Backend Prisma migration and clean install: passed
- Frontend production build: passed
- Frontend login → OTP → restaurant list → detail → cart flow: passed
- `npm audit`: 0 vulnerabilities in both applications
