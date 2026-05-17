# Theo's Factory Web App

Full-stack event services application for guest browsing, logged-in customer workflows, and a separated admin entry point.

## Stack

- Frontend: React, Vite, React Router, Tailwind CSS, Axios
- Backend: Node.js, Express.js, JWT auth, bcrypt
- Database: MongoDB, Mongoose

## Features

- Public pages: Home, About, Services, Decoration, Planning, Rental Items, Gallery, Contact, Book Appointment, Request Quotation, Sign Up, Sign In
- User pages: Dashboard Overview, My Profile, Appointment Details, Rented Items, Quotations Requested, Profile Details, Delete Account, Logout
- Admin pages: `/admin` admin login, `/admin/dashboard` overview, `/admin/dashboard/bookings` booking management, `/admin/dashboard/inventory` rental inventory management, `/admin/dashboard/orders` inventory order tracking, and `/admin/dashboard/gallery` gallery management
- JWT sign up/sign in flow with protected routes
- Admin-only JWT login with role checks
- Appointment booking, quotation requests, rental booking, profile update, and delete account flow
- Day/night mode persisted in localStorage
- Seed data for services, gallery, rental items, demo user, demo admin, and demo customer records


## Project Structure

```text
backend/
  config/
  data/
  middleware/
  models/
  routes/
  server.js

frontend/
  src/
    api/
    components/
    contexts/
    data/
    pages/
    utils/
```

## Setup

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Create `backend/.env` from `backend/.env.example`:

```env
MONGO_URI=mongodb://localhost:27017/theos-factory
JWT_SECRET=change-this-secret
PORT=5001
CLIENT_URL=http://localhost:5173
```

3. Seed MongoDB:

```bash
npm run seed
```

4. Start the backend:

```bash
npm run dev
```

5. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

6. Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

7. Start the frontend:

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend API: `http://localhost:5001/api`

Demo customer: `avery@theosfactory.com` / `DemoPass123`<br>
Demo admin: `admin@theosfactory.com` / `AdminPass123`

## API Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/admin/login`
- `GET /api/auth/me`
- `GET /api/admin/overview`
- `GET /api/admin/inventory`
- `POST /api/admin/inventory`
- `PATCH /api/admin/inventory/:id`
- `DELETE /api/admin/inventory/:id`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id/status`
- `GET /api/admin/gallery`
- `POST /api/admin/gallery`
- `PATCH /api/admin/gallery/:id`
- `DELETE /api/admin/gallery/:id`
- `GET /api/admin/bookings`
- `PATCH /api/admin/bookings/:id/status`
- `PATCH /api/admin/bookings/:id/reschedule`
- `GET /api/services`
- `GET /api/services/:slug`
- `GET /api/gallery`
- `POST /api/appointments`
- `GET /api/appointments/me`
- `POST /api/quotations`
- `GET /api/quotations/me`
- `GET /api/rentals`
- `POST /api/rentals/book`
- `GET /api/rentals/me`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `DELETE /api/users/me`
