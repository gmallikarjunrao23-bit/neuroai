# ⚖️ LegisBot — AI-Powered Legal Document Platform

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    🌐 CLIENT LAYER                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │          Next.js 14 App (React 18)              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────────┐   │   │
│  │  │ Landing  │ │ Dashboard│ │ Document Gen   │   │   │
│  │  │  Page    │ │  Panel   │ │  Workspace     │   │   │
│  │  └──────────┘ └──────────┘ └────────────────┘   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────────┐   │   │
│  │  │ Billing  │ │  Admin   │ │  Profile/      │   │   │
│  │  │  Portal  │ │  Panel   │ │  Settings      │   │   │
│  │  └──────────┘ └──────────┘ └────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │          Shared Design System (UI Kit)          │   │
│  │  Shadcn UI + TailwindCSS + Framer Motion       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │ HTTPS/TLS
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    🚀 API GATEWAY                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Next.js API Routes / tRPC / Express Gateway    │   │
│  │  Rate Limiting · Auth Middleware · Logging      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  🧠 SERVICE LAYER                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Auth    │ │ Document │ │ Template │ │ Payment  │  │
│  │  Service │ │  Service │ │  Service │ │  Service │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  AI/LLM  │ │  User    │ │  Audit   │ │  Report  │  │
│  │  Service │ │  Service │ │  Service │ │  Service │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  📊 DATA LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ PostgreSQL   │  │    Redis     │  │    S3 /      │  │
│  │ (Primary DB) │  │   (Cache)    │  │  Cloudflare  │  │
│  │              │  │   + Queue    │  │     R2       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🎨 Design System

### Colors
```
Primary:    #1E3A5F  (Deep Navy Blue)  — Trust, Law, Authority
Secondary:  #C9A84C  (Gold)            — Premium, Excellence
Accent:     #E8F0FE  (Light Blue)      — Clarity, Freshness
Success:    #10B981  (Emerald)         — Success
Warning:    #F59E0B  (Amber)           — Caution
Error:      #EF4444  (Ruby Red)        — Errors
Bg Dark:    #0F172A  (Slate 900)       — Dark Mode
Bg Light:   #FAFBFC  (Off White)       — Light Mode
Text:       #1A202C  (Near Black)      — Readability
```

### Typography
```
Headings:   Inter / Playfair Display (serif for legal feel)
Body:       Inter (sans-serif, clean)
Monospace:  JetBrains Mono (code/legal clauses)
```

### Design Principles
1. **Professional Minimalism** — Clean, uncluttered, white space
2. **Legal Authority** — Dark blue + gold accents convey trust
3. **Premium Feel** — Subtle gradients, smooth animations, glassmorphism
4. **Responsive** — Mobile-first, works on all devices
5. **Accessibility** — WCAG 2.1 AA compliant

## 🗄️ Database Schema (PostgreSQL)

### Tables
- `users` — User accounts, profiles, roles
- `organizations` — Multi-tenant organizations
- `documents` — Generated legal documents
- `document_templates` — Legal document templates
- `template_categories` — Category groupings
- `ai_conversations` — AI chat sessions
- `subscriptions` — Subscription plans
- `invoices` — Billing records
- `api_usage` — Usage tracking
- `audit_logs` — Compliance audit trail

## 🔐 Security
- JWT + Refresh Token auth
- Row-Level Security (RLS) for multi-tenancy
- End-to-end encryption for document content
- SOC 2 compliant audit logging
- Rate limiting per tenant
- GDPR & Indian IT Act compliant

## 🚀 Deployment
- Frontend: Vercel (Edge Network)
- Backend: Railway / AWS ECS
- Database: Supabase / AWS RDS
- CDN: Cloudflare
- Monitoring: Sentry + DataDog
