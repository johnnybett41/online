# Electrical Devices E-commerce Website

A full-stack e-commerce website for electrical devices built with React (frontend), Node.js/Express (backend), and SQLite (database).

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

3. Seed the database with sample products:

   ```bash
   npm run seed
   ```

4. Start the backend server:

   ```bash
   npm run dev
   ```

   The server will run on <http://localhost:5000>

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

The SQLite database includes the following tables:

- users (id, username, email, password)
- products (id, name, description, price, image, category)
- cart (id, user_id, product_id, quantity)
- orders (id, user_id, total, status, created_at)
- order_items (id, order_id, product_id, quantity, price)

## Technologies Used

- **Frontend:** React, React Router, Axios, Vite
- **Backend:** Node.js, Express.js, SQLite3, bcryptjs, jsonwebtoken
- **Database:** SQLite

## M-Pesa Integration

The application now includes M-Pesa payment integration for secure mobile money payments.

### Setup M-Pesa

1. Create a developer account at [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Create an app and get your Consumer Key and Consumer Secret
3. Set up your shortcode and passkey
4. For testing, use the sandbox environment

### Environment Variables

Create a `.env` file in the backend directory with:

```bash
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey
MPESA_BASE_URL=https://sandbox.safaricom.co.ke
BASE_URL=http://localhost:5000
DATABASE_PATH=./database.db
```

### Payment Flow

1. User adds items to cart and proceeds to checkout
2. Order is created with status 'pending_payment'
3. User enters M-Pesa phone number
4. STK Push is initiated to user's phone
5. User completes payment on their phone
6. M-Pesa sends callback to confirm payment
7. Order status is updated to 'paid'

### M-Pesa API Endpoints

- POST /api/mpesa/pay - Initiate M-Pesa payment
- POST /api/mpesa/callback - M-Pesa payment confirmation callback
- GET /api/mpesa/status/:checkoutRequestId - Check payment status

## Deploying To Render

This repo includes a `render.yaml` blueprint for two services:

- `online-backend` as a Node web service
- `online-frontend` as a static site

Render also mounts a persistent disk for the SQLite database, and the backend seeds products automatically on startup if the catalog is empty, so the catalog survives restarts.

You still need to add your M-Pesa credentials in the backend service environment variables on Render:

- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`
- `MPESA_BASE_URL`

The frontend automatically receives the backend URL through `VITE_API_URL`.
