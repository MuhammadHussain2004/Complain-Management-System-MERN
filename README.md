# Smart Complaint Management System (MERN Stack)

A centralized complaint management platform for an educational institution. Users register, wait for
admin approval, log in through a single login page, submit complaints, and track their status. Admins
manage users (approve/reject/activate/deactivate/roles) and manage the full complaint lifecycle.

## Stack

- **Frontend:** React (Vite, JSX) + React Router + Axios
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt password hashing, role-based route protection

## Project Structure

```
Hackathon/
  backend/     Express API (auth, users, complaints)
  frontend/    React app (Vite)
```

## Complaint Workflow

```
Submit Complaint → Pending → Admin Review → In Progress → Resolved / Rejected
```

## Account Workflow

```
Register → status: pending → Admin Approve/Reject → Login (role detected) → User/Admin Dashboard
```

A new registration is always a `user` with `pending` status — it can never self-promote to admin.
The first admin account is created via the seed script below.

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env      # then edit MONGO_URI and JWT_SECRET
npm run seed:admin        # creates the initial admin account from .env
npm run dev                # starts on http://localhost:5000
```

Initial admin credentials are controlled by `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`
(defaults: `admin@scms.com` / `Admin@12345` — change these before using the app for real).

### API Overview

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register (status starts `pending`) |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Authenticated | Current user profile |
| GET | `/api/admin/users` | Admin | List users (`?status=&role=&search=`) |
| PATCH | `/api/admin/users/:id/approve` | Admin | Approve a pending account |
| PATCH | `/api/admin/users/:id/reject` | Admin | Reject a pending account |
| PATCH | `/api/admin/users/:id/status` | Admin | Activate / deactivate a user |
| PATCH | `/api/admin/users/:id/role` | Admin | Change a user's role |
| POST | `/api/complaints` | User | Submit a complaint |
| GET | `/api/complaints/my` | User | List own complaints |
| PUT | `/api/complaints/:id` | User (owner) | Edit own complaint (only while `Pending`) |
| DELETE | `/api/complaints/:id` | User (owner) | Delete own complaint (only while `Pending`) |
| GET | `/api/complaints` | Admin | List all complaints (`?status=&category=&priority=&search=`) |
| GET | `/api/complaints/stats` | Admin | Dashboard statistics |
| PATCH | `/api/complaints/:id/status` | Admin | Update status + remarks |

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env      # points to the backend API URL
npm run dev                 # starts on http://localhost:5173
```

## Local Development Flow

1. Start MongoDB, then the backend (`npm run dev` in `backend/`).
2. Run `npm run seed:admin` once to create the initial admin.
3. Start the frontend (`npm run dev` in `frontend/`).
4. Register a normal user account at `/register` — it stays `pending`.
5. Log in as the seeded admin, go to **Manage Users**, and approve the new account.
6. Log in as the approved user, submit a complaint, and track it under **My Complaints**.
7. As admin, review it under **Manage Complaints** and update its status/remarks.
