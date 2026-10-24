# koreExpense Backend

Node/Express + MySQL + JWT backend for the koreExpense React frontend.

## Setup
1. npm install
2. Copy .env.example to .env, fill in your MySQL password and a JWT_SECRET
3. Create the tables: mysql -u root -p < schema.sql
4. start the server on port 5000

## Endpoints
- POST /api/auth/register  { name?, email, password } -> { user, token }
- POST /api/auth/login     { email, password } -> { user, token }
- GET  /api/expenses       (auth) -> list, newest first
- GET  /api/expenses/summary (auth) -> { total, count, average, highest, topCategories }
- POST /api/expenses       (auth) { description, amount, category?, date? }
- DELETE /api/expenses/:id (auth)

All /api/expenses routes need header: Authorization: Bearer <token>
