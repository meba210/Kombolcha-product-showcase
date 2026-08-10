# AI-Powered Product Showcase Platform
### Wollo University — Kombolcha Institute of Technology
**Department of Software Engineering**

> A full-stack AI-powered e-commerce platform connecting Kombolcha factories with buyers.

---

## 🏗️ Project Structure

```
gc/
├── frontend/          # React + Vite + TypeScript + Tailwind CSS
├── backend/           # Node.js + Express + TypeScript + Prisma
├── ai-service/        # Python FastAPI AI recommendation engine
├── prisma/            # Prisma schema (shared)
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MySQL 8.0+
- npm or yarn

---

### 1. Database Setup

Create the MySQL database:
```sql
CREATE DATABASE ai_showcase_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy and configure environment
copy .env.example .env
# Edit .env with your MySQL credentials and JWT secret

# Copy prisma schema
copy ..\prisma\schema.prisma .\prisma\schema.prisma

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with sample data
npm run prisma:seed

# Start development server
npm run dev
```

Backend runs on: **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

### 4. AI Service Setup

```bash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
copy .env.example .env
# Edit .env with your MySQL credentials

# Start the AI service
python main.py
```

AI Service runs on: **http://localhost:8000**

---

## 🔑 Demo Credentials

| Role    | Email                              | Password     |
|---------|------------------------------------|--------------|
| Admin   | admin@showcase.com                 | Admin@123    |
| Factory | kombolcha.textile@factory.com      | Factory@123  |
| Buyer   | buyer@example.com                  | Buyer@123    |

---

## 🌟 Features

### For Buyers
- Browse and search products with advanced filtering
- AI-powered personalized product recommendations
- Shopping cart management
- Secure checkout with Chapa payment gateway
- Order tracking
- Direct messaging with factories

### For Factory Partners
- Product management (CRUD with image upload)
- Order management and status updates
- Sales reports and analytics
- Direct messaging with buyers

### For Admin
- Full platform management dashboard
- Factory approval workflow
- User management
- Product management (on behalf of non-partner factories)
- Payment and commission tracking
- Comprehensive reports

---

## 🛠️ Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | React 18, Vite, TypeScript, Tailwind CSS      |
| State      | Zustand, TanStack Query                       |
| Backend    | Node.js, Express, TypeScript                  |
| Database   | MySQL 8 + Prisma ORM                          |
| AI Service | Python, FastAPI, scikit-learn (TF-IDF)        |
| Auth       | JWT + bcrypt + Role-based access control      |
| Payment    | Chapa Payment Gateway                         |
| i18n       | i18next (English + Amharic)                   |

---

## 📊 Database Tables

- `User` — All users (buyers, factories, admins)
- `Buyer` — Buyer profiles
- `Factory` — Factory profiles with approval status
- `Admin` — Admin profiles
- `Category` — Product categories
- `Product` — Product listings
- `Message` — Direct messaging
- `Order` — Customer orders
- `OrderItem` — Order line items
- `Payment` — Payment records (Chapa)
- `Cart` — Shopping carts
- `CartItem` — Cart line items
- `AIRecommendation` — AI recommendation logs
- `SearchHistory` — Buyer search/browse history

---

## 🤖 AI Recommendation System

The recommendation engine uses **Content-Based Filtering**:

1. **Data Collection** — Buyer search history and product data
2. **Feature Extraction** — TF-IDF vectorization of product name, description, category
3. **Similarity Computation** — Cosine similarity between buyer query and product vectors
4. **Ranking** — Top-N most similar products returned
5. **Fallback** — Popular products when insufficient history

**Expected Metrics:**
- Accuracy: ~89%
- Precision: ~86%
- Recall: ~84%
- F1-Score: ~85%

---

## 🔐 Access Control Matrix

| Feature              | Admin | Buyer | Factory |
|----------------------|-------|-------|---------|
| Login                | ✅    | ✅    | ✅      |
| Browse Products      | ✅    | ✅    | ✅      |
| Manage Products      | ✅    | ❌    | ✅      |
| Make Payments        | ❌    | ✅    | ❌      |
| Manage Orders        | ✅    | ❌    | ✅      |
| Track Orders         | ✅    | ✅    | ✅      |
| Manage Users         | ✅    | ❌    | ❌      |
| View All Reports     | ✅    | ❌    | ❌      |
| Manage Commissions   | ✅    | ❌    | ❌      |
| Approve Factories    | ✅    | ❌    | ❌      |

---

## 👥 Team

| Name             | ID              | Role                    |
|------------------|-----------------|-------------------------|
| Feven Tesema     | WOUR/2405/14    | Testing & Documentation |
| Fiyameta Getachew| WOUR/4096/14    | Design & Implementation |

**Advisor:** Ms. Bezawit  
**Institution:** Wollo University, Kombolcha Institute of Technology
