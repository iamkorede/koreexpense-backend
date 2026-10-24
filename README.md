# koreExpense Backend 💰

Node/Express + MySQL + JWT backend for [koreExpense](https://github.com/iamkorede/koreExpense), a React expense tracker.

## Features
- User auth: register + login with bcrypt-hashed passwords and 7-day JWTs
- Expense CRUD scoped to the logged-in user
- Server-side summary: total spent, average, highest expense, top categories
- Input validation and consistent JSON errors

## Stack
- Node.js, Express
- MySQL (mysql2 connection pool)
- JWT + bcryptjs
- CORS enabled for the React dev server

## Setup
1. npm install
2. Copy .env.example to .env and fill in your MySQL password and a JWT_SECRET
3. Create the tables: mysql -u root -p < schema.sql
4. Start the server on port 5000

## Endpoints
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | - | Create account, returns token |
| POST | /api/auth/login | - | Log in, returns token |
| GET | /api/expenses | Bearer token | List expenses, newest first |
| GET | /api/expenses/summary | Bearer token | Total, avg, highest, top categories |
| POST | /api/expenses | Bearer token | Add expense { description, amount, category?, date? } |
| DELETE | /api/expenses/:id | Bearer token | Delete an expense |

All protected routes need header: `Authorization: Bearer <token>`

## Project structure
```
src/
├── server.js            # Express app entry
├── db.js                # MySQL pool + query helper
├── middleware/auth.js   # JWT verification
└── routes/
    ├── auth.js          # /api/auth/*
    └── expenses.js      # /api/expenses/*
schema.sql               # users + expenses tables
```

MIT © 2026 Adekanbi Akorede
