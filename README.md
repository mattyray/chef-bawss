# Chef Bawss

A multi-tenant SaaS application for private chef business management. Built for private chefs and small catering business owners who hire freelance/contract chefs for events.

## What It Does

- **Client Management** — Store contact info, dietary restrictions, and event history
- **Chef Management** — Invite contract chefs, track pay rates, assign to events
- **Event Scheduling** — Create events, assign chefs, track financials (revenue, costs, profit)
- **Calendar** — Google Calendar-style view with drag/drop, chef color-coding, and filtering
- **Email Notifications** — Assignment alerts, event updates, and automated reminders (3-day, 1-day)
- **Role-Based Access** — Admins see everything; chefs only see their assigned events and own pay
- **Multi-Tenancy** — Each business gets its own isolated organization

## Tech Stack

### Backend
- **Django 5.2** + Django REST Framework
- **PostgreSQL 16** — primary database
- **Redis** — caching and message broker
- **Celery** — async task queue (email reminders, notifications)
- **Amazon SES** — transactional email
- **JWT auth** via `djangorestframework-simplejwt` (httpOnly cookies)

### Frontend
- **Next.js 16** (App Router) with React 19
- **TypeScript**
- **Tailwind CSS 4**

### Infrastructure
- **Docker & Docker Compose** — local development
- **Fly.io** — backend hosting
- **Netlify** — frontend hosting

## Project Structure

```
chef-bawss/
├── backend/
│   ├── config/              # Django settings (base, dev, prod), URLs, WSGI, Celery
│   ├── apps/
│   │   ├── users/           # Custom user model, auth (register, login, password reset)
│   │   ├── organizations/   # Multi-tenancy (org model, memberships)
│   │   ├── clients/         # Client CRUD with soft delete
│   │   ├── chefs/           # Chef profiles, invitation flow
│   │   ├── events/          # Event management, calendar endpoint
│   │   └── notifications/   # Email notification logging
│   ├── core/                # Shared utilities
│   │   ├── mixins.py        # TenantQuerysetMixin
│   │   ├── permissions.py   # IsAdmin, IsChef, etc.
│   │   ├── middleware.py    # Tenant middleware
│   │   ├── throttling.py    # Rate limiting
│   │   └── email.py         # Email helpers
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   └── src/
│       ├── app/             # Next.js pages (dashboard, events, clients, chefs, calendar, finances)
│       ├── components/      # Sidebar, ProtectedRoute, SearchableSelect, etc.
│       ├── contexts/        # AuthContext
│       ├── lib/             # API client, utilities
│       └── types/           # TypeScript type definitions
└── docker-compose.yml
```

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+

### Local Development

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/chef-bawss.git
   cd chef-bawss
   ```

2. **Set up backend environment**
   ```bash
   cp backend/.env.example backend/.env
   # Edit .env with your local settings
   ```

3. **Start services with Docker Compose**
   ```bash
   docker compose up -d
   ```
   This starts PostgreSQL (port 5437), Redis (port 6384), the Django backend (port 8007), and Celery worker.

4. **Run migrations**
   ```bash
   docker compose exec backend python manage.py migrate
   ```

5. **Create a superuser**
   ```bash
   docker compose exec backend python manage.py createsuperuser
   ```

6. **Start the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`.

### Running Without Docker

```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Celery worker (separate terminal)
celery -A config worker -l info

# Frontend
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `True` for development |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `AWS_ACCESS_KEY_ID` | AWS credentials for SES |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials for SES |
| `AWS_SES_REGION_NAME` | SES region (e.g., `us-east-1`) |
| `DEFAULT_FROM_EMAIL` | Sender email address |
| `FRONTEND_URL` | Frontend URL for email links |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |

## API Overview

- `POST /api/auth/register/` — Create account + organization
- `POST /api/auth/login/` — JWT login (tokens set as httpOnly cookies)
- `GET /api/users/me/` — Current user profile
- `GET/POST /api/clients/` — Client list & creation (admin)
- `GET/POST /api/chefs/` — Chef list & invitation (admin)
- `GET/POST /api/events/` — Event management
- `GET /api/events/calendar/` — Calendar-formatted events
- `GET /api/dashboard/` — Role-aware dashboard stats
- `GET /api/finances/` — Financial summaries (admin only)

See [chef-bawss-technical-plan-v2.md](chef-bawss-technical-plan-v2.md) for full API documentation.

## User Roles

| Capability | Admin | Chef |
|------------|:-----:|:----:|
| Manage clients | Full CRUD | Read-only |
| Manage chefs | Full CRUD + invite | Own profile only |
| Manage events | Full CRUD | View assigned only |
| See financials (revenue/profit) | Yes | No |
| See own pay | Yes | Yes |
| Calendar drag/drop | Yes | No |
| Add notes to events | Yes | Assigned events only |
