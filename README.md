# Electrical Devices E-commerce Website

A full-stack e-commerce website for electrical devices built with React (frontend), Node.js/Express (backend), and SQLite locally, with PostgreSQL on Render/production.

## Features

- User registration and authentication
- Product catalog with categories
- Shopping cart functionality
- Order placement and history
- Modern, responsive UI

## Project Structure

```text
online/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── seed.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   └── orders.js
│   └── models/ (for future expansion)
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── components/
│       │   └── Navbar.jsx
│       └── pages/
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Products.jsx
│           ├── Cart.jsx
│           ├── Checkout.jsx
│           └── Orders.jsx
└── README.md
```

## Setup Instructions

### Backend

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the backend server:

   ```bash
   npm run dev
   ```

   The server will run on <http://localhost:5000>

   On first launch, the backend creates the schema and seeds the product catalog automatically if it is empty.

   For local development, the backend uses the bundled `database.db` file by default when `DATABASE_URL` is not set. That means you can run the app without installing PostgreSQL first.

   If you want to use PostgreSQL locally instead, set `DATABASE_URL` in `backend/.env`.

### Frontend

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The app will run on <http://localhost:5173>

   If you want to open it on your phone or another device on the same Wi-Fi network, use your computer's LAN IP address instead of `localhost`, for example `http://192.168.1.20:5173`.

## API Endpoints

### Authentication

- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Products

- GET /api/products - Get all products
- GET /api/products/:id - Get product by ID
- POST /api/products - Add new product (admin)

### Cart

- GET /api/cart - Get user's cart items
- POST /api/cart - Add item to cart
- PUT /api/cart/:id - Update cart item quantity
- DELETE /api/cart/:id - Remove item from cart

### Orders

- GET /api/orders - Get user's orders
- POST /api/orders - Place new order
- GET /api/orders/:id - Get order details

## Database Schema

The local SQLite database and the PostgreSQL deployment use the same tables:

- users (id, username, email, password)
- products (id, name, description, price, image, category)
- cart (id, user_id, product_id, quantity)
- orders (id, user_id, total, status, created_at)
- order_items (id, order_id, product_id, quantity, price)

## Technologies Used

- **Frontend:** React, React Router, Axios, Vite
- **Backend:** Node.js, Express.js, bcryptjs, jsonwebtoken, pg, node:sqlite
- **Database:** SQLite locally, PostgreSQL on Render

## M-Pesa Integration

The application now includes M-Pesa payment integration for secure mobile money payments.

### Setup M-Pesa

1. Create a developer account at the [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Create an app and copy your Consumer Key and Consumer Secret
3. Add the app's shortcode and passkey
4. Start with sandbox first, then switch to production when your live credentials are ready
5. Make sure your callback URL is publicly reachable. On Render, the backend builds it automatically from the service URL.

### Environment Variables

Create a `.env` file in the backend directory with:

```bash
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
BASE_URL=http://localhost:5000
# Optional for local PostgreSQL use only:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/online_db
```

If `DATABASE_URL` is omitted, the backend automatically uses the local `database.db` SQLite file in the backend folder.

For production Daraja credentials, change:

```bash
MPESA_BASE_URL=https://api.safaricom.co.ke
```

### Payment Flow

1. User adds items to cart and proceeds to checkout
2. Order is created with status 'pending_payment'
3. User enters M-Pesa phone number
4. STK Push is initiated to user's phone
5. User completes payment on their phone
6. M-Pesa sends callback to confirm payment
7. Order status is updated to 'paid'

### Render Setup

If you are deploying to Render:

1. Set the backend environment variables in the Render dashboard.
2. Keep `MPESA_BASE_URL` on the sandbox URL while testing.
3. Add your live credentials later when Safaricom approves production access.
4. Use the Render backend URL as the callback destination. The app now builds that URL automatically.
5. Make sure the frontend points to the backend through `VITE_API_URL`.
6. Keep `DATABASE_URL` pointed at the Render PostgreSQL instance; the SQLite fallback is only for local development.

### M-Pesa API Endpoints

- POST /api/mpesa/pay - Initiate M-Pesa payment
- POST /api/mpesa/callback - M-Pesa payment confirmation callback
- GET /api/mpesa/status/:checkoutRequestId - Check payment status

## Deploying To Render

This repo includes a `render.yaml` blueprint for one database and two services:

- `online-backend` as a Node web service
- `online-frontend` as a static site

Render provisions a managed PostgreSQL database for the backend, and the backend seeds products automatically on startup if the catalog is empty, so the catalog survives restarts.

Locally, the backend uses `backend/database.db` unless you set `DATABASE_URL`.

You still need to add your M-Pesa credentials in the backend service environment variables on Render:

- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`
- `MPESA_BASE_URL`

The frontend automatically receives the backend URL through `VITE_API_URL`.

## Google Sign-In

The login and registration pages now support Google sign-in with the Google Identity Services popup flow. This lets users continue with their Google account and have the app create or reuse their local ElectroHub account automatically.

### Setup Google Sign-In

1. Create an OAuth 2.0 Client ID in the [Google Cloud Console](https://console.cloud.google.com/).
2. Add these authorized JavaScript origins:
   - `http://localhost:5173`
   - Your live Render frontend URL, for example `https://your-frontend.onrender.com`
3. Set `GOOGLE_CLIENT_ID` in the backend environment.
4. If you deploy with the Render blueprint, the frontend receives `VITE_GOOGLE_CLIENT_ID` from the backend service automatically.
5. If you run locally, set `VITE_GOOGLE_CLIENT_ID` in your frontend environment before building.
6. Redeploy the frontend after setting the Google client ID so the Google button is included in the static build.

The backend verifies the Google ID token server-side, then creates or logs in the matching ElectroHub user and issues your normal app JWT.

### Public URL

After the Render deploy finishes, use the Render frontend service URL as your shared public link. That single URL will work on phone, laptop, and desktop because the app is responsive and the static site is configured to rewrite SPA routes back to `index.html`.
