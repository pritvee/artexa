# 📸 PhotoFrame E-Commerce Website — Project Analysis

> **Project Name:** Artexa.in — Photo Frame & Gift Studio  
> **Last Analysed:** March 6, 2026  
> **Status:** 🟡 In Development (Backend + Frontend running locally)

---

## 1. Project Overview

Artexa is a full-stack e-commerce web application built for selling **customizable photo frames, mugs, gift hampers, and photo gifts**. Customers can browse products, upload personal photos, add items to a cart with customization options, check out, and track their orders in real time. A dedicated **Admin panel** allows store managers to manage products, view all orders, update order statuses, and track delivery.

---

## 2. Technology Stack

| Layer          | Technology                              | Notes                                  |
|----------------|-----------------------------------------|----------------------------------------|
| **Frontend**   | React 18 + Vite                         | SPA with JSX                           |
| **UI Library** | Material UI (MUI) v5                    | With Emotion as styling engine         |
| **Animations** | Framer Motion                           | Page/component transition animations   |
| **Routing**    | React Router DOM v6                     | Client-side routing with protected routes |
| **HTTP Client**| Axios                                   | API calls to backend                   |
| **Backend**    | Python FastAPI                          | Async-capable REST API                 |
| **ORM**        | SQLAlchemy                              | Model definitions and DB interaction   |
| **Auth**       | JWT (python-jose) + PassLib (bcrypt)    | Token-based authentication             |
| **Validation** | Pydantic v2 + email-validator           | Request/response schema validation     |
| **Database**   | SQLite (dev) / PostgreSQL (production)  | Switchable via `DATABASE_URL` env var  |
| **Migrations** | Alembic                                 | Schema versioning (configured)         |
| **File Upload**| python-multipart + StaticFiles          | Uploaded images served as static files |
| **Dev Server** | Uvicorn (backend) + Vite (frontend)     | Hot-reload in development              |
| **Docker**     | Docker Compose                          | PostgreSQL + pgAdmin container setup   |

---

## 3. Repository Structure

```
photoframe website/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── api_router.py          # Aggregates all route modules
│   │   │       └── endpoints/
│   │   │           ├── auth.py            # Login / Register + JWT guards
│   │   │           ├── users.py           # User profile management
│   │   │           ├── products.py        # Product listing & image upload
│   │   │           ├── orders.py          # Order placement & retrieval
│   │   │           ├── cart.py            # Cart CRUD operations
│   │   │           ├── admin.py           # Admin stats & order management
│   │   │           └── delivery.py        # Delivery tracking update
│   │   ├── core/
│   │   │   ├── config.py                  # Env-based settings (Pydantic)
│   │   │   └── security.py               # Password hash & JWT token creation
│   │   ├── db/
│   │   │   ├── base_class.py             # SQLAlchemy declarative Base
│   │   │   ├── base.py                   # Model registration for metadata
│   │   │   └── session.py                # Engine & session factory
│   │   ├── models/
│   │   │   └── models.py                 # All ORM table definitions
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── product.py
│   │   │   ├── cart.py
│   │   │   ├── order.py
│   │   │   └── token.py
│   │   └── main.py                       # App entry point, CORS, startup
│   ├── scripts/                          # Utility / seed scripts
│   ├── uploads/                          # Uploaded product/photo images
│   ├── .env                              # Environment variables
│   ├── requirements.txt
│   └── sql_app.db                        # SQLite dev database file
│
├── frontend/
│   ├── src/
│   │   ├── api/                          # Axios config / API wrappers
│   │   ├── components/
│   │   │   ├── Navbar.jsx                # Top nav with auth state, theme toggle
│   │   │   └── Footer.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx                  # Product grid + category filter
│   │   │   ├── ProductDetail.jsx         # Product detail + customization
│   │   │   ├── Cart.jsx                  # Cart view with quantity control
│   │   │   ├── Checkout.jsx              # Address + order summary + payment
│   │   │   ├── OrderTracking.jsx         # Real-time order status timeline
│   │   │   ├── Profile.jsx               # User profile page
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx    # Stats cards (orders, revenue, users)
│   │   │       ├── ManageProducts.jsx    # Add / edit / delete products
│   │   │       └── ManageOrders.jsx      # View & update order statuses
│   │   ├── store/
│   │   │   ├── AuthContext.jsx           # Global auth state (token, user, role)
│   │   │   ├── ProductContext.jsx        # Mock product data (local state)
│   │   │   ├── OrderContext.jsx          # Order state management
│   │   │   └── ThemeContext.jsx          # MUI dark/light theme toggle
│   │   ├── theme/                        # Global MUI theme override config
│   │   ├── App.jsx                       # Route definitions + ProtectedRoute
│   │   └── main.jsx                      # React root with context providers
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── docker-compose.yml                    # PostgreSQL + pgAdmin services
├── .gitignore
└── README.md
```

---

## 4. Database Schema

All tables are defined in `backend/app/models/models.py` using SQLAlchemy ORM and are auto-created on startup via `Base.metadata.create_all()`.

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    users     │       │    categories    │       │    products      │
│──────────────│       │──────────────────│       │──────────────────│
│ id (PK)      │       │ id (PK)          │       │ id (PK)          │
│ name         │       │ name             │       │ name             │
│ email        │       │ description      │       │ description      │
│ hashed_pwd   │       └──────────────────┘       │ price            │
│ phone        │                ▲                  │ stock            │
│ address      │                │ FK               │ category_id (FK) │
│ is_active    │       ┌──────────────────┐       │ customization_type│
│ role         │       │    products      │       │ image_url        │
└──────┬───────┘       └──────────────────┘       └──────────────────┘
       │
       │ 1:1           ┌──────────────────┐
       ├──────────────▶│      carts       │
       │               │ id (PK)          │
       │               │ user_id (FK)     │
       │               └────────┬─────────┘
       │                        │ 1:M
       │               ┌────────▼─────────┐
       │               │   cart_items     │
       │               │ id (PK)          │
       │               │ cart_id (FK)     │
       │               │ product_id (FK)  │
       │               │ quantity         │
       │               │ customization(J) │
       │               │ uploaded_photo_id│
       │               └──────────────────┘
       │
       │ 1:M           ┌──────────────────┐
       ├──────────────▶│     orders       │
       │               │ id (PK)          │
       │               │ user_id (FK)     │
       │               │ total_price      │
       │               │ status           │
       │               │ shipping_address │
       │               │ created_at       │
       │               └────────┬─────────┘
       │                        │ 1:M
       │               ┌────────▼─────────┐       ┌──────────────────────┐
       │               │   order_items    │       │  delivery_tracking   │
       │               │ id (PK)          │       │ id (PK)              │
       │               │ order_id (FK)    │       │ order_id (FK, 1:1)   │
       │               │ product_id (FK)  │       │ courier_partner      │
       │               │ quantity         │       │ tracking_id          │
       │               │ price            │       │ status               │
       │               │ customization(J) │       │ estimated_delivery   │
       │               │ uploaded_photo_id│       └──────────────────────┘
       │               └──────────────────┘
       │
       │ 1:M           ┌──────────────────┐
       └──────────────▶│ uploaded_photos  │
                       │ id (PK)          │
                       │ user_id (FK)     │
                       │ file_path        │
                       │ created_at       │
                       └──────────────────┘

┌──────────────┐
│    admins    │  ← Separate admin table (separate from users)
│──────────────│
│ id (PK)      │
│ name         │
│ email        │
│ hashed_pwd   │
└──────────────┘
```

### Order Status Flow
```
placed → processing → printed → shipped → out_for_delivery → delivered
```

---

## 5. API Endpoints

**Base URL:** `http://localhost:8000/api/v1`

### 🔐 Authentication (`/auth`)
| Method | Endpoint       | Description                     | Auth Required |
|--------|----------------|---------------------------------|---------------|
| POST   | `/auth/login`  | Login → returns JWT token       | No            |
| POST   | `/auth/register` | Register new user             | No            |

### 👤 Users (`/users`)
| Method | Endpoint  | Description         | Auth Required |
|--------|-----------|---------------------|---------------|
| GET    | `/users/` | Get current user    | Yes           |

### 🛍️ Products (`/products`)
| Method | Endpoint                  | Description                      | Auth Required |
|--------|---------------------------|----------------------------------|---------------|
| GET    | `/products/`              | List all products (filter/search)| No            |
| GET    | `/products/{id}`          | Get single product               | No            |
| GET    | `/products/categories`    | List all categories              | No            |
| POST   | `/products/upload-image`  | Upload product image             | No (⚠ should be admin) |

### 🛒 Cart (`/cart`)
| Method | Endpoint       | Description              | Auth Required |
|--------|----------------|--------------------------|---------------|
| GET    | `/cart/`       | View user's cart         | Yes           |
| POST   | `/cart/`       | Add item to cart         | Yes           |
| DELETE | `/cart/{id}`   | Remove item from cart    | Yes           |

### 📦 Orders (`/orders`)
| Method | Endpoint            | Description               | Auth Required |
|--------|---------------------|---------------------------|---------------|
| POST   | `/orders/`          | Place order from cart     | Yes           |
| GET    | `/orders/my-orders` | Get current user's orders | Yes           |
| GET    | `/orders/{id}`      | Get specific order        | Yes           |

### 🔧 Admin (`/admin`)
| Method | Endpoint                       | Description               | Auth Required     |
|--------|--------------------------------|---------------------------|-------------------|
| GET    | `/admin/dashboard-stats`       | Stats: orders, revenue    | Yes (Admin only)  |
| GET    | `/admin/orders`                | All orders                | Yes (Admin only)  |
| PATCH  | `/admin/orders/{id}/status`    | Update order status       | Yes (Admin only)  |

### 🚚 Delivery (`/delivery`)
| Method | Endpoint                          | Description                   | Auth Required    |
|--------|-----------------------------------|-------------------------------|------------------|
| PATCH  | `/delivery/{id}/update-tracking`  | Update courier & tracking info| Yes (Admin only) |

---

## 6. Frontend Pages & Routes

| Route                  | Component            | Protected | Admin Only |
|------------------------|----------------------|-----------|------------|
| `/`                    | Home                 | No        | No         |
| `/product/:id`         | ProductDetail        | No        | No         |
| `/cart`                | Cart                 | No        | No         |
| `/login`               | Login                | No        | No         |
| `/register`            | Register             | No        | No         |
| `/checkout`            | Checkout             | ✅ Yes    | No         |
| `/profile`             | Profile              | ✅ Yes    | No         |
| `/orders`              | OrderTracking        | ✅ Yes    | No         |
| `/admin`               | AdminDashboard       | ✅ Yes    | ✅ Yes     |
| `/admin/products`      | ManageProducts       | ✅ Yes    | ✅ Yes     |
| `/admin/orders`        | ManageOrders         | ✅ Yes    | ✅ Yes     |

---

## 7. Authentication & Authorization

- **Mechanism:** JWT Bearer tokens issued on login.
- **Token Storage:** `localStorage` — stores `token`, `role`, and `user_email`.
- **Roles:** `user` (default) and `admin`.
- **Protected Routes (Frontend):** Implemented via a `<ProtectedRoute>` HOC in `App.jsx` that checks for a valid token and correct role.
- **Protected Endpoints (Backend):** `get_current_user` dependency validates JWT; `get_current_active_admin` additionally enforces `role === "admin"`.

---

## 8. State Management (Frontend)

React Context API is used throughout — no external state management library (e.g., Redux) is needed at current scale.

| Context              | Purpose                                                      |
|----------------------|--------------------------------------------------------------|
| `AuthContext`        | Auth token, user email, role, login(), logout()             |
| `ProductContext`     | Local product list with add/update/delete (mock data)       |
| `OrderContext`       | Order list, place order, track order                        |
| `ThemeContext`       | Dark / Light mode toggle (persisted in localStorage)        |

> ⚠️ **Note:** `ProductContext` currently uses **hardcoded in-memory product data** and does not call the backend products API. This should be replaced with Axios API calls to `/api/v1/products/`.

---

## 9. Theme & Design System

- **Primary Color:** `#6366f1` (Indigo)
- **Secondary Color:** `#ec4899` (Pink/Rose)
- **Font Family:** `Outfit`, `Inter`, `Roboto` (via Google Fonts)
- **Dark Mode:** Fully supported via `ThemeContext` with MUI's `createTheme`.
- **Dark Background:** `#0f172a` (Slate 900)
- **Light Background:** `#f8fafc` (Slate 50)
- **Border Radius:** 12px globally on all MUI components.

---

## 10. Environment Configuration

**`backend/.env`**
```env
DATABASE_URL=sqlite:///./sql_app.db         # Switch to postgres:// for production
SECRET_KEY=your-secret-key-goes-here-...    # ⚠ Must be changed before deployment
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=backend/uploads
```

**Docker Compose (Production DB):**
```
PostgreSQL 15 — port 5432
pgAdmin 4     — port 5050 (http://localhost:5050)
```

---

## 11. Running the Project Locally

### Prerequisites
- Python 3.10+, Node.js 18+, npm

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
# API runs at: http://localhost:8000
# Swagger UI:  http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# UI runs at: http://localhost:5173
```

### Docker (PostgreSQL)
```bash
docker-compose up -d
# PostgreSQL: localhost:5432
# pgAdmin:    http://localhost:5050
```

---

## 12. Known Issues & Improvement Areas

| # | Issue / Gap | Priority |
|---|-------------|----------|
| 1 | `ProductContext` uses hardcoded mock data — not connected to backend `/products/` API | 🔴 High |
| 2 | `POST /products/upload-image` has no admin auth guard (any user can upload) | 🔴 High |
| 3 | `SECRET_KEY` in `.env` is a placeholder — insecure for production | 🔴 High |
| 4 | CORS is set to `allow_origins=["*"]` — should be locked to specific domains in production | 🟠 Medium |
| 5 | No payment gateway integration (Checkout page is UI only) | 🟠 Medium |
| 6 | No email notifications for order placement or status updates | 🟠 Medium |
| 7 | `Admins` table is separate from `Users` table but admin login goes through the shared `/auth/login` using the `users` table; the `admins` table appears unused | 🟠 Medium |
| 8 | No pagination on product listing or admin order listing endpoints | 🟡 Low |
| 9 | `uploaded_photos` table exists but the upload flow in the frontend may not be fully wired | 🟡 Low |
| 10| No unit or integration tests present | 🟡 Low |

---

## 13. Next Development Milestones

- [ ] Wire `ProductContext` to live backend API
- [ ] Add Razorpay / Stripe payment gateway to Checkout
- [ ] Protect the product image upload endpoint with admin guard
- [ ] Add email notification service (SMTP or SendGrid) for order events
- [ ] Implement pagination on product and order API endpoints
- [ ] Write backend unit tests with `pytest`
- [ ] Set production-safe `SECRET_KEY` and restrict CORS origins
- [ ] Deploy frontend to Vercel/Netlify and backend to Railway/Render
- [ ] Switch database from SQLite → PostgreSQL for production

---

*Generated by Antigravity · Artexa.in PhotoFrame E-Commerce Project · March 2026*
