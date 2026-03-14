# PhotoFrame Custom Gift Website

A full-stack e-commerce web application for selling custom photo products.

## Technology Stack
- **Frontend**: React.js with Material UI, Vite, Framer Motion
- **Backend**: FastAPI (Python REST API), SQLAlchemy, Pydantic
- **Database**: PostgreSQL / SQLite (Configurable)
- **Auth**: JWT-based login

## Features
- Custom Photo Gift Personalization (Real-time preview)
- User Authentication & Role-based Access (User/Admin)
- Admin Dashboard with Statistics & Order Management
- Multi-step Checkout with Dummy Payment
- Responsive & Modern Design

## Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or venv\Scripts\activate on Windows
pip install -r requirements.txt
python scripts/init_db.py  # Seed database
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Admin Credentials
- **Email**: `admin@example.com`
- **Password**: `admin123`

### 4. user password 
`prithvi@gmail.com`
`p1r2i3t4`

## Directory Structure
- `backend/`: FastAPI application code
- `frontend/`: React + Vite application
- `backend/uploads/`: Directory where user photos are stored
    