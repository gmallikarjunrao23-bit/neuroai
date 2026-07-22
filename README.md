# ⚖️ LegisBot — AI-Powered Legal Document Platform

> **Create professional legal documents in minutes with AI.**

![Status](https://img.shields.io/badge/status-production-ready-1E3A5F?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-C9A84C?style=flat-square)

---

## ✨ Overview

LegisBot is a full-fledged SaaS platform that uses AI to generate professional legal documents. Built with a premium design system, it supports multiple Indian languages and provides legally verified templates for various use cases.

### 🎯 Target Market
- **Individuals** needing rental agreements, NDAs, affidavits
- **Small Businesses** requiring employment contracts, partnership deeds
- **Law Firms** looking for quick drafts and templates
- **Property Managers** handling rental agreements

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | React framework with SSR |
| **TypeScript** | Type safety |
| **TailwindCSS** | Utility-first styling |
| **Framer Motion** | Premium animations |
| **Shadcn UI** | Component library |
| **Zustand** | State management |
| **React Query** | Data fetching |
| **Recharts** | Analytics charts |
| **React Hook Form** | Form handling |

### Backend
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | High-performance Python API |
| **PostgreSQL** | Primary database |
| **SQLAlchemy** | ORM with async support |
| **Redis** | Caching & queues |
| **OpenAI API** | AI document generation |
| **JWT** | Authentication |
| **Sentry** | Error monitoring |

---

## 🎨 Design System

### Colors
```
Primary:    #1E3A5F  (Deep Navy — Trust, Authority)
Secondary:  #C9A84C  (Gold — Premium, Excellence)
Bg Light:   #FAFBFC  (Off White)
Bg Dark:    #0F172A  (Slate 900)
```

### Typography
- **Inter** — Body text (clean, modern)
- **Playfair Display** — Headings (elegant, legal)
- **JetBrains Mono** — Code/Clauses

### Design Philosophy
- **Professional Minimalism** — Clean, uncluttered
- **Legal Authority** — Navy + gold conveys trust
- **Premium Feel** — Glassmorphism, gradients, smooth animations

---

## 📂 Project Structure

```
legisbot/
├── frontend/                     # Next.js application
│   ├── src/
│   │   ├── app/                  # Pages & routing
│   │   │   ├── (landing)/        # Landing page (home)
│   │   │   ├── (dashboard)/      # Protected dashboard
│   │   │   │   ├── dashboard/        # Main dashboard
│   │   │   │   ├── documents/        # Document list
│   │   │   │   └── documents/new/    # Document creation
│   │   │   ├── (auth)/           # Login/Register
│   │   │   └── layout.tsx        # Root layout
│   │   ├── components/
│   │   │   ├── ui/               # Shadcn UI components
│   │   │   ├── layout/           # Navbar, Sidebar, Footer
│   │   │   ├── landing/          # Landing page sections
│   │   │   ├── legal/            # Document workspace
│   │   │   ├── dashboard/        # Dashboard components
│   │   │   └── forms/            # Form components
│   │   ├── lib/                  # Utilities
│   │   ├── types/                # TypeScript types
│   │   ├── data/                 # Static data
│   │   └── stores/               # Zustand stores
│   └── package.json
├── backend/                      # FastAPI application
│   ├── app/
│   │   ├── main.py               # FastAPI entry point
│   │   ├── core/                 # Config, DB, security
│   │   ├── models/               # SQLAlchemy models
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── services/             # Business logic
│   │   │   ├── auth.py           # Authentication
│   │   │   └── ai_service.py     # AI document generation
│   │   └── api/v1/               # API endpoints
│   │       ├── auth.py           # Auth routes
│   │       └── documents.py      # Document routes
│   └── requirements.txt
└── ARCHITECTURE.md               # Architecture docs
```

---

## 🚀 Features

### 📄 Document Generation
- **AI-powered drafting** using OpenAI GPT-4
- **200+ templates** across 8 categories
- **Multi-language** support (English, Hindi, Marathi, Telugu, Tamil)
- **Smart review** with AI-powered suggestions

### 💼 Professional Dashboard
- **Real-time analytics** — document stats, usage metrics
- **Activity feed** — team collaboration tracking
- **Document management** — filter, search, sort
- **Team collaboration** — roles & permissions

### 🔐 Enterprise Ready
- **Multi-tenant architecture** with RLS
- **JWT authentication** with refresh tokens
- **Audit logging** for compliance
- **Role-based access control** (RBAC)
- **SOC 2 compliant** design

### 💳 Subscription Plans
- **Starter** (Free) — 3 docs/month
- **Professional** (₹499/mo) — 25 docs, all templates
- **Business** (₹1,499/mo) — Unlimited, team features
- **Enterprise** (₹4,999/mo) — Custom, white-label

---

## 🛠️ Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev      # → http://localhost:3000
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload   # → http://localhost:8000
```

### Environment Variables (.env)
```env
# Backend
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/legisbot
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=sk-...  # Optional, falls back to template engine
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | User registration |
| POST | `/api/v1/auth/login` | User login |
| GET | `/api/v1/auth/me` | Current user profile |
| POST | `/api/v1/documents/` | Create document |
| GET | `/api/v1/documents/` | List documents |
| GET | `/api/v1/documents/{id}` | Get document |
| POST | `/api/v1/documents/{id}/generate` | AI generate content |
| DELETE | `/api/v1/documents/{id}` | Archive document |
| GET | `/health` | Health check |

---

## 🎯 Roadmap

### Phase 1 — MVP (Current)
- [x] Landing page with hero, features, templates, pricing
- [x] Dashboard with analytics and document management
- [x] Document creation workspace with 5-step wizard
- [x] AI document generation (with fallback)
- [x] Authentication API
- [x] Premium design system

### Phase 2 — Launch
- [ ] Payment integration (Razorpay)
- [ ] E-signature integration
- [ ] Multi-language AI generation
- [ ] Team collaboration features
- [ ] Email notifications

### Phase 3 — Scale
- [ ] Mobile apps (React Native)
- [ ] Custom template builder
- [ ] API marketplace
- [ ] White-label solution
- [ ] Advanced analytics

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License — see LICENSE file for details.

---

<div align="center">
  <sub>Built with ❤️ in India</sub>
</div>
