# Wiring the React frontend to this API

1. Copy this file as src/api.js in the React project:

```js
const API = 'http://localhost:5000';
let token = localStorage.getItem('token') || '';

async function request(path, options = {}) {
  const res = await fetch(API + path, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: 'Bearer ' + token } : {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'request failed');
  return data;
}

export async function login(email, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  token = data.token;
  localStorage.setItem('token', token);
  return data;
}

export async function register(name, email, password) {
  const data = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  token = data.token;
  localStorage.setItem('token', token);
  return data;
}

export const getExpenses = () => request('/api/expenses');
export const getSummary = () => request('/api/expenses/summary');
export const addExpense = (expense) =>
  request('/api/expenses', { method: 'POST', body: JSON.stringify(expense) });
export const deleteExpense = (id) =>
  request('/api/expenses/' + id, { method: 'DELETE' });
```

2. In App.jsx:

```js
import { useEffect, useState } from 'react';
import { getExpenses, addExpense, deleteExpense } from './api';

const [expenses, setExpenses] = useState([]);
useEffect(() => {
  getExpenses().then(setExpenses).catch(console.error);
}, []);

const add = async (expense) => {
  const created = await addExpense(expense);
  setExpenses((prev) => [created, ...prev]);
};

const remove = async (id) => {
  await deleteExpense(id);
  setExpenses((prev) => prev.filter((e) => e.id !== id));
};
```

3. Build a small login/register screen first; without a token every expense request 401s.
