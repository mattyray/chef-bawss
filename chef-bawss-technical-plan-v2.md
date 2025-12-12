# Chef Bawss — Technical Plan v2

A multi-tenant SaaS application for private chef business management.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Data Models](#4-data-models)
5. [API Endpoints](#5-api-endpoints)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Multi-Tenancy](#7-multi-tenancy)
8. [Email Notifications](#8-email-notifications)
9. [Calendar System](#9-calendar-system)
10. [Security](#10-security)
11. [Deployment](#11-deployment)
12. [Development Phases](#12-development-phases)
13. [Permission Matrix](#13-permission-matrix)
14. [Future Considerations](#14-future-considerations)

---

## 1. Product Overview

### What It Is
A web-based business management system for private chefs and small catering business owners who hire freelance/contract chefs for events.

### Who It's For
A private chef or caterer who runs their own business, takes bookings from clients, and assigns other chefs to work those events.

### Business Model
- **Free to use** with optional donations via Stripe
- Users sign up and create their own organizations with custom business names
- Multi-tenant architecture supports unlimited organizations

### Core Entities
1. **Clients** - Contact information, dietary restrictions, event history
2. **Chefs** - Individual pay rates, profiles, assignment history
3. **Events** - Scheduling, financial tracking, chef assignments

### User Roles

**Admin (Business Owner)**
- Full access to all data
- Can see all financials (revenue, costs, profit)
- Manages clients, chefs, and events
- Can assign chefs to events

**Chef (Contractor)**
- Limited access to their assigned events only
- Can see their own pay (not client pay or profit)
- Can view client info for assigned events
- Can add notes to their assigned events
- Can edit their own profile

---

## 2. Tech Stack

### Backend
- **Framework:** Django 5.x with Django REST Framework
- **Database:** PostgreSQL 16
- **Cache/Queue:** Redis
- **Task Queue:** Celery
- **Email Service:** Amazon SES via django-ses

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Calendar:** FullCalendar

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Backend Hosting:** Fly.io
- **Frontend Hosting:** Netlify
- **CI/CD:** GitHub Actions

---

## 3. Architecture

### System Overview

```
┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│   Django API    │
│   (Netlify)     │     │   (Fly.io)      │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
               ┌────▼────┐  ┌────▼────┐  ┌────▼────┐
               │PostgreSQL│  │  Redis  │  │  Celery │
               │   (DB)   │  │ (Cache) │  │ (Tasks) │
               └──────────┘  └─────────┘  └────┬────┘
                                               │
                                          ┌────▼────┐
                                          │   SES   │
                                          │ (Email) │
                                          └─────────┘
```

### Project Structure

```
chef-bawss/
├── backend/
│   ├── config/                 # Django settings
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── users/              # User model, auth
│   │   ├── organizations/      # Multi-tenancy
│   │   ├── clients/            # Client CRUD
│   │   ├── chefs/              # Chef profiles
│   │   ├── events/             # Event management
│   │   └── notifications/      # Email tasks
│   ├── core/                   # Shared utilities
│   │   ├── mixins.py           # TenantQuerysetMixin
│   │   ├── permissions.py      # Custom permissions
│   │   └── middleware.py       # Tenant middleware
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js pages
│   │   ├── components/         # React components
│   │   ├── lib/                # Utilities, API client
│   │   ├── hooks/              # Custom hooks
│   │   └── types/              # TypeScript types
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 4. Data Models

### User

```python
class User(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    is_email_verified = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
```

### Organization

```python
class Organization(models.Model):
    name = models.CharField(max_length=200)  # Business name
    slug = models.SlugField(unique=True)
    timezone = models.CharField(max_length=50, default='America/New_York')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### OrganizationMembership

```python
class OrganizationMembership(models.Model):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        CHEF = 'chef', 'Chef'
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=Role.choices)
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'organization']
```

### ChefProfile

```python
class ChefProfile(models.Model):
    membership = models.OneToOneField(OrganizationMembership, on_delete=models.CASCADE)
    address = models.TextField(blank=True)
    default_pay_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    calendar_color = models.CharField(max_length=7)  # Hex color, auto-assigned
    notes = models.TextField(blank=True)  # Admin-only private notes
    
    def save(self, *args, **kwargs):
        if not self.calendar_color:
            self.calendar_color = self._assign_color()
        super().save(*args, **kwargs)
```

### Client

```python
class Client(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    allergies = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    # Soft delete
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Event

```python
class Event(models.Model):
    class Status(models.TextChoices):
        UPCOMING = 'upcoming', 'Upcoming'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
    
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    client = models.ForeignKey(Client, on_delete=models.PROTECT)
    chef = models.ForeignKey(ChefProfile, on_delete=models.SET_NULL, null=True, blank=True)
    
    name = models.CharField(max_length=200, blank=True)  # Defaults to "[Client] Event"
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    
    location = models.TextField(blank=True)  # Can differ from client address
    guest_count = models.PositiveIntegerField()
    allergies = models.TextField(blank=True)  # Event-specific + inherited from client
    menu_notes = models.TextField(blank=True)
    
    # Financials
    client_pay = models.DecimalField(max_digits=10, decimal_places=2)
    chef_pay = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    deposit_received = models.BooleanField(default=False)
    
    # Notes
    internal_notes = models.TextField(blank=True)  # Admin only
    chef_notes = models.TextField(blank=True)  # Editable by assigned chef
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UPCOMING)
    
    # Soft delete
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def profit(self):
        if self.chef_pay:
            return self.client_pay - self.chef_pay
        return self.client_pay
```

### NotificationLog

```python
class NotificationLog(models.Model):
    class NotificationType(models.TextChoices):
        ASSIGNMENT = 'assignment', 'Chef Assigned'
        UPDATE = 'update', 'Event Updated'
        CANCELLATION = 'cancellation', 'Event Cancelled'
        REMINDER_3DAY = 'reminder_3day', '3-Day Reminder'
        REMINDER_1DAY = 'reminder_1day', '1-Day Reminder'
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    chef = models.ForeignKey(ChefProfile, on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=20, choices=NotificationType.choices)
    sent_at = models.DateTimeField(auto_now_add=True)
    celery_task_id = models.CharField(max_length=255, blank=True)  # For revocation
```

---

## 5. API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Create account + organization |
| POST | `/api/auth/login/` | Get JWT tokens |
| POST | `/api/auth/logout/` | Blacklist refresh token |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| POST | `/api/auth/verify-email/` | Verify email address |
| POST | `/api/auth/resend-verification/` | Resend verification email |
| POST | `/api/auth/password-reset/` | Request password reset |
| POST | `/api/auth/password-reset/confirm/` | Set new password |

### Users & Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me/` | Get current user + membership |
| PATCH | `/api/users/me/` | Update profile |
| POST | `/api/users/me/change-password/` | Change password |

### Organizations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organizations/current/` | Get current org details |
| PATCH | `/api/organizations/current/` | Update org (admin only) |

### Clients

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/clients/` | List all clients | Admin, Chef (read-only) |
| POST | `/api/clients/` | Create client | Admin |
| GET | `/api/clients/{id}/` | Get client detail | Admin, Chef |
| PATCH | `/api/clients/{id}/` | Update client | Admin |
| DELETE | `/api/clients/{id}/` | Soft delete client | Admin |

### Chefs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/chefs/` | List all chefs | Admin |
| POST | `/api/chefs/invite/` | Invite new chef | Admin |
| GET | `/api/chefs/{id}/` | Get chef detail | Admin |
| PATCH | `/api/chefs/{id}/` | Update chef | Admin |
| POST | `/api/chefs/{id}/deactivate/` | Deactivate chef | Admin |
| GET | `/api/chefs/me/` | Get own chef profile | Chef |
| PATCH | `/api/chefs/me/` | Update own profile | Chef |

### Events

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/events/` | List events | Admin (all), Chef (assigned) |
| POST | `/api/events/` | Create event | Admin |
| GET | `/api/events/{id}/` | Get event detail | Admin, Chef (if assigned) |
| PATCH | `/api/events/{id}/` | Update event | Admin |
| DELETE | `/api/events/{id}/` | Soft delete event | Admin |
| PATCH | `/api/events/{id}/notes/` | Update chef notes | Chef (if assigned) |
| POST | `/api/events/{id}/complete/` | Mark complete | Admin |
| POST | `/api/events/{id}/cancel/` | Cancel event | Admin |
| GET | `/api/events/calendar/` | Calendar events | Admin, Chef |

### Dashboard

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard/` | Dashboard stats | Role-aware response |

### Finances

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/finances/` | Financial summary | Admin |
| GET | `/api/finances/by-chef/` | Breakdown by chef | Admin |

---

## 6. Authentication & Authorization

### JWT Configuration

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_COOKIE': 'access_token',
    'AUTH_COOKIE_HTTP_ONLY': True,
    'AUTH_COOKIE_SECURE': True,  # Production only
    'AUTH_COOKIE_SAMESITE': 'Lax',
}
```

### Token Storage
- Access token: httpOnly cookie (15 min expiry)
- Refresh token: httpOnly cookie (7 day expiry)

### Registration Flow
1. User submits: email, password, first name, last name, business name
2. Create User (is_email_verified=False)
3. Create Organization with business name
4. Create OrganizationMembership (role=admin)
5. Send verification email
6. User clicks verification link → is_email_verified=True

### Chef Invitation Flow
1. Admin creates invitation with chef details
2. Create User (is_email_verified=False, unusable password)
3. Create OrganizationMembership (role=chef)
4. Create ChefProfile with auto-assigned calendar color
5. Send invitation email with set-password link
6. Chef sets password → is_email_verified=True

---

## 7. Multi-Tenancy

### Strategy
Shared database with organization foreign key on all tenant-scoped models.

### Implementation

**TenantQuerysetMixin**
```python
class TenantQuerysetMixin:
    def get_queryset(self):
        qs = super().get_queryset()
        if hasattr(self.request, 'organization'):
            return qs.filter(organization=self.request.organization)
        return qs.none()
```

**Tenant Middleware**
```python
class TenantMiddleware:
    def __call__(self, request):
        if request.user.is_authenticated:
            membership = request.user.organizationmembership_set.first()
            if membership:
                request.organization = membership.organization
                request.membership = membership
        return self.get_response(request)
```

### Data Isolation
- All querysets automatically filtered by organization
- Users can only belong to one organization (current scope)
- Chef profiles linked to specific organization memberships

---

## 8. Email Notifications

### Email Types

1. **Verification Email** - Sent on registration
2. **Password Reset** - Sent on request
3. **Chef Invitation** - Sent when admin invites chef
4. **Chef Assignment** - Sent when chef assigned to event
5. **Event Update** - Sent when assigned event is modified
6. **Event Cancellation** - Sent when assigned event is cancelled
7. **3-Day Reminder** - Scheduled 3 days before event
8. **1-Day Reminder** - Scheduled 1 day before event

### Celery Tasks

```python
@shared_task
def send_assignment_email(event_id, chef_id):
    # Send immediate notification
    
@shared_task
def send_event_reminder(event_id, chef_id, reminder_type):
    # Send scheduled reminder
    
@shared_task
def schedule_event_reminders(event_id):
    # Schedule both 3-day and 1-day reminders
```

### Reminder Scheduling Logic

**When event created with chef:**
- Schedule 3-day reminder
- Schedule 1-day reminder
- Store celery_task_id in NotificationLog

**When chef assigned to existing event:**
- Send assignment notification immediately
- Schedule reminders

**When chef unassigned or event cancelled:**
- Revoke pending Celery tasks using stored task IDs

**When event date changes:**
- Revoke old reminders
- Schedule new reminders with updated dates

---

## 9. Calendar System

### Google Calendar-Style Features

**Desktop Only:**
- Mini month calendar in sidebar
- Chef filter checkboxes
- Click event → quick popup with View/Edit
- View details → side panel (calendar stays visible)
- Click-drag empty time → create event
- Drag event → move to new date/time
- Drag event edge → resize duration
- Optimistic UI with rollback on error

**Mobile:**
- Tap event → full page detail
- No drag interactions
- Use FAB (+) button to create events

### Calendar API

**GET /api/events/calendar/**

Query Parameters:
- `start` - Start date (ISO format)
- `end` - End date (ISO format)
- `chef_id` - Filter by chef (admin only)

Response (FullCalendar compatible):
```json
[
  {
    "id": "123",
    "title": "Johnson Holiday Party",
    "start": "2024-12-14T18:00:00",
    "end": "2024-12-14T22:00:00",
    "color": "#4A90D9",
    "extendedProps": {
      "client_name": "Sarah Johnson",
      "chef_name": "Maria Santos",
      "guest_count": 24,
      "location": "123 Oak Street"
    }
  }
]
```

**PATCH /api/events/{id}/** (for drag/resize)
```json
{
  "date": "2024-12-17",
  "start_time": "18:00",
  "end_time": "22:00"
}
```

### Chef Calendar Colors

Auto-assigned from palette on ChefProfile creation:
```python
CALENDAR_COLORS = [
    '#4A90D9',  # Blue
    '#7B68EE',  # Purple
    '#E57373',  # Red/Coral
    '#4DB6AC',  # Teal
    '#FFB74D',  # Orange
    '#81C784',  # Green
    '#F06292',  # Pink
    '#64B5F6',  # Light Blue
]

UNASSIGNED_COLOR = '#9E9E9E'  # Gray
```

---

## 10. Security

### API Throttling

```python
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'auth': '5/minute',  # Login/register endpoints
    }
}
```

### CORS Configuration

```python
CORS_ALLOWED_ORIGINS = [
    'https://chefbawss.com',
    'https://www.chefbawss.com',
]
CORS_ALLOW_CREDENTIALS = True
```

### Security Headers

- HTTPS enforced in production
- CSRF protection enabled
- Secure cookie flags
- Content Security Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff

### Input Validation

- All inputs validated via DRF serializers
- Email uniqueness enforcement
- Password strength requirements (min 8 characters)
- SQL injection prevented via ORM
- XSS prevented via template escaping

### Soft Deletes

- Clients and Events use soft delete (is_deleted flag)
- Maintains audit trail and allows data recovery
- Filtered from default querysets

---

## 11. Deployment

### Docker Compose (Development)

```yaml
version: '3.8'

services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: chefbawss
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  backend:
    build: ./backend
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=postgres://postgres:postgres@db:5432/chefbawss
      - REDIS_URL=redis://redis:6379/0

  celery:
    build: ./backend
    command: celery -A config worker -l info
    volumes:
      - ./backend:/app
    depends_on:
      - db
      - redis

  frontend:
    build: ./frontend
    command: npm run dev
    volumes:
      - ./frontend:/app
    ports:
      - "3000:3000"

volumes:
  postgres_data:
```

### Production (Fly.io)

```toml
# fly.toml
app = "chefbawss-api"

[build]
  dockerfile = "Dockerfile"

[env]
  DJANGO_SETTINGS_MODULE = "config.settings.production"

[http_service]
  internal_port = 8000
  force_https = true

[[services]]
  internal_port = 8000
  protocol = "tcp"

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

### CI/CD (GitHub Actions)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: |
          docker-compose -f docker-compose.test.yml up --abort-on-container-exit

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './frontend/out'
          production-deploy: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 12. Development Phases

### Backend Phases (1-10)

| Phase | Description | Days |
|-------|-------------|------|
| 1 | **Infrastructure** - Docker, Django, PostgreSQL, Redis, Celery | 3-4 |
| 2 | **Auth System** - JWT, login/logout, token refresh | 4-5 |
| 3 | **Email Verification & Reset** - SES integration, verification/reset flows | 3-4 |
| 4 | **Organizations & Multi-Tenancy** - Tenant isolation, middleware, permissions | 4-5 |
| 5 | **Clients Model** - CRUD API, soft delete, tenant-scoped | 2-3 |
| 6 | **Chefs Model** - Invitation flow, auto-assign color, self-service endpoint | 3-4 |
| 7 | **Events Model** - CRUD API, role-based filtering, calendar endpoint | 4-5 |
| 8 | **Dashboard API** - Role-aware stats, upcoming/recent queries | 2-3 |
| 9 | **Finances API** - Date filtering, aggregations, by-chef breakdown | 2 |
| 10 | **Throttling & Security** - Rate limits, CORS, security headers | 2 |

### Frontend Phases (11-20)

| Phase | Description | Days |
|-------|-------------|------|
| 11 | **Foundation** - Next.js setup, API client, auth context, route protection | 3-4 |
| 12 | **Auth Pages** - Login, register, verify, reset, set password forms | 3-4 |
| 13 | **Layout Shell** - Sidebar, bottom nav, header, role-based nav | 2-3 |
| 14 | **Dashboard** - Admin/chef dashboards, mini calendar, stats cards | 3-4 |
| 15 | **Events** - List, detail, create/edit forms, filters, chef notes | 4-5 |
| 16 | **Clients** - List, detail, create/edit forms, role-based UI | 3 |
| 17 | **Chefs** - List, detail, invite form, chef profile (own) | 3-4 |
| 18 | **Calendar (Google Style)** - FullCalendar, drag/drop, side panel, filters | 6-7 |
| 19 | **Finances** - Date filters, summary, by-chef breakdown | 2-3 |
| 20 | **Settings** - Business/profile editing, password change, logout | 2 |

### Final Phases (21-25)

| Phase | Description | Days |
|-------|-------------|------|
| 21 | **Email Notifications** - Celery tasks, templates, scheduling logic | 3-4 |
| 22 | **Landing Page** - Hero, features, how it works, Stripe donation | 2-3 |
| 23 | **Testing** - Unit, API, tenant isolation, permission, E2E | 4-5 |
| 24 | **CI/CD & Deployment** - GitHub Actions, Fly.io, Netlify | 3-4 |
| 25 | **Polish & Launch** - Loading states, error pages, responsive QA | 3-4 |

### Total Estimate

**80-100 days (~8-10 weeks)**

---

## 13. Permission Matrix

| Action | Admin | Chef |
|--------|:-----:|:----:|
| View all clients | ✓ | ✓ (read-only) |
| Create/edit/delete clients | ✓ | ✗ |
| View all chefs | ✓ | ✗ |
| Invite/edit/deactivate chefs | ✓ | ✗ |
| View/edit own profile | ✓ | ✓ |
| View all events | ✓ | ✗ |
| View assigned events | N/A | ✓ |
| Create/edit/delete events | ✓ | ✗ |
| Add notes to assigned events | N/A | ✓ |
| See client_pay | ✓ | ✗ |
| See chef_pay | ✓ | Own only |
| See profit | ✓ | ✗ |
| See internal_notes | ✓ | ✗ |
| View/edit finances | ✓ | ✗ |
| Drag/move events on calendar | ✓ | ✗ |
| Filter calendar by chef | ✓ | ✗ |

---

## 14. Future Considerations

### Monetization (Not Building Now)
- Stripe subscriptions
- Pricing tiers (Free, Pro, Business)
- Feature flags for paid features
- Usage limits per tier

### Additional Features (Not Building Now)
- Chef availability calendar
- Scheduling conflict detection
- Recurring events
- Invoice generation & PDF export
- Document/file storage per event
- SMS notifications
- Native mobile app
- Client portal (view their events)

### Platform Growth (Not Building Now)
- Superadmin dashboard for platform metrics
- User impersonation for support
- Onboarding wizard / guided setup
- Referral program
- White-label / custom branding per tenant

---

## Appendix: Environment Variables

### Backend (.env)

```bash
# Django
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=api.chefbawss.com

# Database
DATABASE_URL=postgres://user:pass@host:5432/chefbawss

# Redis
REDIS_URL=redis://localhost:6379/0

# Email (Amazon SES)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_SES_REGION_NAME=us-east-1
DEFAULT_FROM_EMAIL=noreply@chefbawss.com

# Frontend URL (for email links)
FRONTEND_URL=https://chefbawss.com

# JWT
JWT_SECRET_KEY=your-jwt-secret
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=https://api.chefbawss.com
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_xxx
```
