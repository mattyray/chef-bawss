# Chef Bawss - Complete Source Code Export

Generated: 2026-01-15 13:44:31

## Project Overview

Chef Bawss is a full-stack web application for managing private chef businesses.

**Tech Stack:**
- Backend: Django 5.2 + Django REST Framework
- Frontend: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- Database: PostgreSQL
- Queue: Redis + Celery

---

## Table of Contents

1. [Backend Code](#backend-code)
2. [Frontend Code](#frontend-code)
3. [Infrastructure](#infrastructure)

---

# Backend Code

## `backend/manage.py`

```python
#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
```

## `backend/config/__init__.py`

```python
from .celery import app as celery_app

__all__ = ('celery_app',)
```

## `backend/config/urls.py`

```python
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from apps.events.views import DashboardView, FinancesView, FinancesByChefView


def health_check(request):
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('api/health/', health_check, name='health_check'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/organizations/', include('apps.organizations.urls')),
    path('api/clients/', include('apps.clients.urls')),
    path('api/chefs/', include('apps.chefs.urls')),
    path('api/events/', include('apps.events.urls')),
    path('api/dashboard/', DashboardView.as_view(), name='dashboard'),
    path('api/finances/', FinancesView.as_view(), name='finances'),
    path('api/finances/by-chef/', FinancesByChefView.as_view(), name='finances_by_chef'),
]
```

## `backend/config/wsgi.py`

```python
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
application = get_wsgi_application()
```

## `backend/config/celery.py`

```python
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

app = Celery('config')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
```

## `backend/config/settings/base.py`

```python
import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'change-me')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'apps.users',
    'apps.organizations',
    'apps.clients',
    'apps.chefs',
    'apps.events',
    'apps.notifications',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'core.middleware.TenantMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

AUTH_USER_MODEL = 'users.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'auth': '5/minute',  # For login/register endpoints
    }
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

CELERY_BROKER_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
```

## `backend/config/settings/development.py`

```python
from .base import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'chefbawss',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': os.getenv('DB_HOST', 'db'),
        'PORT': '5432',
    }
}

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
CORS_ALLOW_CREDENTIALS = True

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

## `backend/config/settings/production.py`

```python
from .base import *
import os
from urllib.parse import urlparse

DEBUG = False

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

# Support DATABASE_URL format (used by Fly.io) or individual env vars
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL:
    url = urlparse(DATABASE_URL)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': url.path[1:],  # Remove leading slash
            'USER': url.username,
            'PASSWORD': url.password,
            'HOST': url.hostname,
            'PORT': url.port or 5432,
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME'),
            'USER': os.getenv('DB_USER'),
            'PASSWORD': os.getenv('DB_PASSWORD'),
            'HOST': os.getenv('DB_HOST'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }

# CORS - temporarily allow all origins for debugging
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Security headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_SSL_REDIRECT = False  # Railway handles SSL termination
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# HSTS - tell browsers to only use HTTPS
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Referrer policy
SECURE_REFERRER_POLICY = 'same-origin'

# Redis (Fly.io uses REDIS_URL)
REDIS_URL = os.getenv('REDIS_URL')
if REDIS_URL:
    CELERY_BROKER_URL = REDIS_URL
    CELERY_RESULT_BACKEND = REDIS_URL

# AWS SES Email
EMAIL_BACKEND = 'django_ses.SESBackend'
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_SES_REGION_NAME = os.getenv('AWS_SES_REGION_NAME', 'us-east-1')
AWS_SES_REGION_ENDPOINT = f'email.{AWS_SES_REGION_NAME}.amazonaws.com'
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@chefbawss.com')
```

## `backend/core/email.py`

```python
from django.core.mail import send_mail
from django.conf import settings


def send_chef_invitation_email(user, organization, token):
    """Send invitation email to a newly invited chef."""
    invite_url = f"{settings.FRONTEND_URL}/accept-invite?token={token}"

    subject = f"You've been invited to join {organization.name} on Chef Bawss"

    # Plain text version
    message = f"""
Hi {user.first_name},

You've been invited to join {organization.name} as a chef on Chef Bawss.

Click the link below to set your password and access your account:
{invite_url}

This link will expire in 7 days.

If you didn't expect this invitation, you can ignore this email.

Best,
The Chef Bawss Team
"""

    # HTML version (optional, for nicer emails)
    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .button {{ display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
        .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>Welcome to Chef Bawss!</h2>
        <p>Hi {user.first_name},</p>
        <p>You've been invited to join <strong>{organization.name}</strong> as a chef on Chef Bawss.</p>
        <p>Click the button below to set your password and access your account:</p>
        <a href="{invite_url}" class="button">Accept Invitation</a>
        <p>Or copy this link: {invite_url}</p>
        <p>This link will expire in 7 days.</p>
        <div class="footer">
            <p>If you didn't expect this invitation, you can ignore this email.</p>
        </div>
    </div>
</body>
</html>
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@chefbawss.com'),
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False,
    )


def send_event_assignment_email(chef_user, event, organization):
    """Send email to chef when they're assigned to a new event."""
    event_url = f"{settings.FRONTEND_URL}/events/{event.id}/chef-view"

    subject = f"New Event Assignment: {event.display_name}"

    message = f"""
Hi {chef_user.first_name},

You've been assigned to a new event with {organization.name}!

Event: {event.display_name}
Client: {event.client.name}
Date: {event.date.strftime('%A, %B %d, %Y')}
Time: {event.start_time.strftime('%I:%M %p')}
Location: {event.location or 'TBD'}
Guests: {event.guest_count}
Your Pay: ${event.chef_pay or 'TBD'}

View event details: {event_url}

Best,
{organization.name}
"""

    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .button {{ display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
        .details {{ background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }}
        .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>New Event Assignment</h2>
        <p>Hi {chef_user.first_name},</p>
        <p>You've been assigned to a new event with <strong>{organization.name}</strong>!</p>
        <div class="details">
            <p><strong>Event:</strong> {event.display_name}</p>
            <p><strong>Client:</strong> {event.client.name}</p>
            <p><strong>Date:</strong> {event.date.strftime('%A, %B %d, %Y')}</p>
            <p><strong>Time:</strong> {event.start_time.strftime('%I:%M %p')}</p>
            <p><strong>Location:</strong> {event.location or 'TBD'}</p>
            <p><strong>Guests:</strong> {event.guest_count}</p>
            <p><strong>Your Pay:</strong> ${event.chef_pay or 'TBD'}</p>
        </div>
        <a href="{event_url}" class="button">View Event Details</a>
        <div class="footer">
            <p>Sent from {organization.name} via Chef Bawss</p>
        </div>
    </div>
</body>
</html>
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@chefbawss.com'),
        recipient_list=[chef_user.email],
        html_message=html_message,
        fail_silently=True,  # Don't fail the request if email fails
    )


def send_event_update_email(chef_user, event, organization, changes=None):
    """Send email to chef when their assigned event is updated."""
    event_url = f"{settings.FRONTEND_URL}/events/{event.id}/chef-view"

    subject = f"Event Updated: {event.display_name}"

    changes_text = ""
    if changes:
        changes_text = "\n\nChanges made:\n" + "\n".join(f"- {c}" for c in changes)

    message = f"""
Hi {chef_user.first_name},

An event you're assigned to has been updated.{changes_text}

Event: {event.display_name}
Client: {event.client.name}
Date: {event.date.strftime('%A, %B %d, %Y')}
Time: {event.start_time.strftime('%I:%M %p')}
Location: {event.location or 'TBD'}
Guests: {event.guest_count}

View event details: {event_url}

Best,
{organization.name}
"""

    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .button {{ display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
        .details {{ background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }}
        .changes {{ background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }}
        .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>Event Updated</h2>
        <p>Hi {chef_user.first_name},</p>
        <p>An event you're assigned to has been updated.</p>
        {'<div class="changes"><strong>Changes:</strong><ul>' + "".join(f"<li>{c}</li>" for c in (changes or [])) + '</ul></div>' if changes else ''}
        <div class="details">
            <p><strong>Event:</strong> {event.display_name}</p>
            <p><strong>Client:</strong> {event.client.name}</p>
            <p><strong>Date:</strong> {event.date.strftime('%A, %B %d, %Y')}</p>
            <p><strong>Time:</strong> {event.start_time.strftime('%I:%M %p')}</p>
            <p><strong>Location:</strong> {event.location or 'TBD'}</p>
            <p><strong>Guests:</strong> {event.guest_count}</p>
        </div>
        <a href="{event_url}" class="button">View Event Details</a>
        <div class="footer">
            <p>Sent from {organization.name} via Chef Bawss</p>
        </div>
    </div>
</body>
</html>
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@chefbawss.com'),
        recipient_list=[chef_user.email],
        html_message=html_message,
        fail_silently=True,
    )


def send_password_reset_email(user, token):
    """Send password reset email."""
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

    subject = "Reset Your Password - Chef Bawss"

    message = f"""
Hi {user.first_name},

We received a request to reset your password for your Chef Bawss account.

Click the link below to reset your password:
{reset_url}

This link will expire in 1 hour.

If you didn't request a password reset, you can ignore this email. Your password will remain unchanged.

Best,
The Chef Bawss Team
"""

    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .button {{ display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
        .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>Reset Your Password</h2>
        <p>Hi {user.first_name},</p>
        <p>We received a request to reset your password for your Chef Bawss account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="{reset_url}" class="button">Reset Password</a>
        <p>Or copy this link: {reset_url}</p>
        <p>This link will expire in 1 hour.</p>
        <div class="footer">
            <p>If you didn't request a password reset, you can ignore this email. Your password will remain unchanged.</p>
        </div>
    </div>
</body>
</html>
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@chefbawss.com'),
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False,
    )
```

## `backend/core/middleware.py`

```python
class TenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Initialize - will be populated after DRF auth
        request.organization = None
        request.membership = None
        return self.get_response(request)
```

## `backend/core/mixins.py`

```python
class TenantMixin:
    """
    Mixin that sets organization/membership after DRF authentication
    but before permission checks.
    """
    def initial(self, request, *args, **kwargs):
        # Standard DRF setup
        self.format_kwarg = self.get_format_suffix(**kwargs)
        neg = self.perform_content_negotiation(request)
        request.accepted_renderer, request.accepted_media_type = neg
        version, scheme = self.determine_version(request, *args, **kwargs)
        request.version, request.versioning_scheme = version, scheme

        # Authenticate first
        self.perform_authentication(request)

        # Always initialize tenant attributes
        request.organization = None
        request.membership = None

        # Set tenant AFTER auth, BEFORE permissions
        if request.user.is_authenticated:
            membership = request.user.memberships.filter(is_active=True).first()
            if membership:
                request.organization = membership.organization
                request.membership = membership

        # Now check permissions with tenant available
        self.check_permissions(request)
        self.check_throttles(request)


class TenantQuerysetMixin(TenantMixin):
    """
    Filters queryset by organization. Includes TenantMixin behavior.
    """
    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.organization:
            return qs.filter(organization=self.request.organization)
        return qs.none()
```

## `backend/core/permissions.py`

```python
from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.membership:
            return False
        return request.membership.role == 'admin'


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.membership:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.membership.role == 'admin'


class IsChefOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.membership:
            return False
        return request.membership.role in ['admin', 'chef']
```

## `backend/core/throttling.py`

```python
from rest_framework.throttling import AnonRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """
    Throttle for authentication endpoints (login, register, password reset).
    More restrictive than general anon throttle to prevent brute force attacks.
    """
    scope = 'auth'
```

## `backend/apps/users/models.py`

```python
import secrets
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from datetime import timedelta


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    is_email_verified = models.BooleanField(default=False)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'


class InvitationToken(models.Model):
    """Token for chef invitations to set their password."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invitation_tokens')
    token = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(48)
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=7)
        super().save(*args, **kwargs)

    @property
    def is_valid(self):
        return self.used_at is None and timezone.now() < self.expires_at

    def mark_used(self):
        self.used_at = timezone.now()
        self.save()

    def __str__(self):
        return f"Invitation for {self.user.email}"


class PasswordResetToken(models.Model):
    """Token for password reset requests."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(48)
        if not self.expires_at:
            # Password reset tokens expire in 1 hour
            self.expires_at = timezone.now() + timedelta(hours=1)
        super().save(*args, **kwargs)

    @property
    def is_valid(self):
        return self.used_at is None and timezone.now() < self.expires_at

    def mark_used(self):
        self.used_at = timezone.now()
        self.save()

    def __str__(self):
        return f"Password reset for {self.user.email}"
```

## `backend/apps/users/serializers.py`

```python
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from apps.organizations.models import Organization, OrganizationMembership
from .models import InvitationToken, PasswordResetToken

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'is_email_verified']
        read_only_fields = ['id', 'email', 'is_email_verified']


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    business_name = serializers.CharField(max_length=200)
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value
    
    def create(self, validated_data):
        business_name = validated_data.pop('business_name')
        
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        
        org = Organization.objects.create(name=business_name)
        
        OrganizationMembership.objects.create(
            user=user,
            organization=org,
            role='admin'
        )
        
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value


class MeSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    organization_name = serializers.SerializerMethodField()
    organization_id = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 
                  'is_email_verified', 'role', 'organization_name', 'organization_id']
        read_only_fields = ['id', 'email', 'is_email_verified']
    
    def get_role(self, obj):
        request = self.context.get('request')
        if request and request.membership:
            return request.membership.role
        return None
    
    def get_organization_name(self, obj):
        request = self.context.get('request')
        if request and request.organization:
            return request.organization.name
        return None
    
    def get_organization_id(self, obj):
        request = self.context.get('request')
        if request and request.organization:
            return request.organization.id
        return None


class AcceptInviteSerializer(serializers.Serializer):
    """Validates invitation token and sets user password."""
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_token(self, value):
        try:
            invitation = InvitationToken.objects.select_related('user').get(token=value)
        except InvitationToken.DoesNotExist:
            raise serializers.ValidationError('Invalid invitation token.')

        if not invitation.is_valid:
            raise serializers.ValidationError('This invitation has expired or already been used.')

        self.invitation = invitation
        return value

    def save(self):
        user = self.invitation.user
        user.set_password(self.validated_data['password'])
        user.is_email_verified = True
        user.save()

        self.invitation.mark_used()
        return user


class InviteInfoSerializer(serializers.Serializer):
    """Returns info about an invitation for the accept-invite page."""
    token = serializers.CharField()

    def validate_token(self, value):
        try:
            invitation = InvitationToken.objects.select_related('user').get(token=value)
        except InvitationToken.DoesNotExist:
            raise serializers.ValidationError('Invalid invitation token.')

        if not invitation.is_valid:
            raise serializers.ValidationError('This invitation has expired or already been used.')

        self.invitation = invitation
        return value

    def get_info(self):
        user = self.invitation.user
        # Get the organization from the user's chef membership
        membership = user.memberships.filter(role='chef').first()
        org_name = membership.organization.name if membership else None

        return {
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'organization_name': org_name,
        }


class PasswordResetRequestSerializer(serializers.Serializer):
    """Request a password reset email."""
    email = serializers.EmailField()

    def validate_email(self, value):
        # We don't reveal whether the email exists or not for security
        self.user = User.objects.filter(email=value).first()
        return value

    def save(self):
        if self.user:
            # Delete any existing tokens for this user
            PasswordResetToken.objects.filter(user=self.user).delete()
            # Create new token
            token = PasswordResetToken.objects.create(user=self.user)
            return token
        return None


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Confirm password reset with token and new password."""
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_token(self, value):
        try:
            reset_token = PasswordResetToken.objects.select_related('user').get(token=value)
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError('Invalid or expired reset link.')

        if not reset_token.is_valid:
            raise serializers.ValidationError('This reset link has expired or already been used.')

        self.reset_token = reset_token
        return value

    def save(self):
        user = self.reset_token.user
        user.set_password(self.validated_data['password'])
        user.save()
        self.reset_token.mark_used()
        return user
```

## `backend/apps/users/views.py`

```python
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from core.mixins import TenantMixin
from core.throttling import AuthRateThrottle
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    MeSerializer,
    AcceptInviteSerializer,
    InviteInfoSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)
from core.email import send_password_reset_email

User = get_user_model()


class ThrottledTokenObtainPairView(TokenObtainPairView):
    """Login endpoint with auth throttling to prevent brute force."""
    throttle_classes = [AuthRateThrottle]


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class MeView(TenantMixin, generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MeSerializer
    
    def get_object(self):
        return self.request.user


class ChangePasswordView(TenantMixin, APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        
        return Response({'detail': 'Password updated successfully.'})


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Successfully logged out.'})
        except Exception:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class InviteInfoView(APIView):
    """Get info about an invitation token (for the accept-invite page)."""
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def get(self, request):
        token = request.query_params.get('token')
        if not token:
            return Response(
                {'detail': 'Token is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = InviteInfoSerializer(data={'token': token})
        if serializer.is_valid():
            return Response(serializer.get_info())
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AcceptInviteView(APIView):
    """Accept an invitation and set password."""
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = AcceptInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens so they're logged in immediately
        refresh = RefreshToken.for_user(user)

        return Response({
            'detail': 'Account activated successfully.',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class PasswordResetRequestView(APIView):
    """Request a password reset email."""
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.save()

        # Send email if user exists (token will be None if user doesn't exist)
        if token:
            try:
                send_password_reset_email(token.user, token.token)
            except Exception:
                pass  # Don't reveal email sending errors

        # Always return success to not reveal if email exists
        return Response({
            'detail': 'If an account with that email exists, we have sent a password reset link.'
        })


class PasswordResetConfirmView(APIView):
    """Confirm password reset with token and new password."""
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens so they're logged in immediately
        refresh = RefreshToken.for_user(user)

        return Response({
            'detail': 'Password has been reset successfully.',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
```

## `backend/apps/users/urls.py`

```python
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    ThrottledTokenObtainPairView,
    MeView,
    ChangePasswordView,
    LogoutView,
    InviteInfoView,
    AcceptInviteView,
    PasswordResetRequestView,
    PasswordResetConfirmView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', ThrottledTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MeView.as_view(), name='me'),
    path('me/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('invite-info/', InviteInfoView.as_view(), name='invite_info'),
    path('accept-invite/', AcceptInviteView.as_view(), name='accept_invite'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]
```

## `backend/apps/users/admin.py`

```python
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'first_name', 'last_name', 'is_email_verified', 'is_staff']
    list_filter = ['is_staff', 'is_superuser', 'is_email_verified']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['email']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_email_verified')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )
```

## `backend/apps/organizations/models.py`

```python
from django.db import models
from django.conf import settings
from django.utils.text import slugify


class Organization(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    timezone = models.CharField(max_length=50, default='America/New_York')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Organization.objects.filter(slug=slug).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name


class OrganizationMembership(models.Model):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        CHEF = 'chef', 'Chef'
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='memberships'
    )
    organization = models.ForeignKey(
        Organization, 
        on_delete=models.CASCADE,
        related_name='memberships'
    )
    role = models.CharField(max_length=20, choices=Role.choices)
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'organization']
    
    def __str__(self):
        return f'{self.user.email} - {self.organization.name} ({self.role})'
```

## `backend/apps/organizations/serializers.py`

```python
from rest_framework import serializers
from .models import Organization, OrganizationMembership


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'slug', 'timezone', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class OrganizationMembershipSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = OrganizationMembership
        fields = ['id', 'user', 'user_email', 'user_name', 'role', 'is_active', 'joined_at']
        read_only_fields = ['id', 'joined_at']
```

## `backend/apps/organizations/views.py`

```python
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from core.mixins import TenantMixin
from core.permissions import IsAdmin
from .models import Organization
from .serializers import OrganizationSerializer


class CurrentOrganizationView(TenantMixin, generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationSerializer
    
    def get_object(self):
        return self.request.organization
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
```

## `backend/apps/organizations/urls.py`

```python
from django.urls import path
from .views import CurrentOrganizationView

urlpatterns = [
    path('current/', CurrentOrganizationView.as_view(), name='current_organization'),
]
```

## `backend/apps/organizations/admin.py`

```python
from django.contrib import admin
from .models import Organization, OrganizationMembership


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'timezone', 'created_at']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(OrganizationMembership)
class OrganizationMembershipAdmin(admin.ModelAdmin):
    list_display = ['user', 'organization', 'role', 'is_active', 'joined_at']
    list_filter = ['role', 'is_active', 'organization']
    search_fields = ['user__email', 'organization__name']
```

## `backend/apps/chefs/models.py`

```python
from django.db import models
from apps.organizations.models import OrganizationMembership


CALENDAR_COLORS = [
    '#4A90D9',
    '#7B68EE',
    '#E57373',
    '#4DB6AC',
    '#FFB74D',
    '#81C784',
    '#F06292',
    '#64B5F6',
]


class ChefProfile(models.Model):
    membership = models.OneToOneField(
        OrganizationMembership, 
        on_delete=models.CASCADE, 
        related_name='chef_profile'
    )
    address = models.TextField(blank=True)
    default_pay_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    calendar_color = models.CharField(max_length=7, blank=True)
    notes = models.TextField(blank=True, help_text='Admin-only private notes')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.calendar_color:
            self.calendar_color = self._assign_color()
        super().save(*args, **kwargs)
    
    def _assign_color(self):
        org = self.membership.organization
        used_colors = ChefProfile.objects.filter(
            membership__organization=org
        ).values_list('calendar_color', flat=True)
        
        for color in CALENDAR_COLORS:
            if color not in used_colors:
                return color
        
        count = ChefProfile.objects.filter(membership__organization=org).count()
        return CALENDAR_COLORS[count % len(CALENDAR_COLORS)]
    
    @property
    def user(self):
        return self.membership.user
    
    @property
    def organization(self):
        return self.membership.organization
    
    @property
    def is_active(self):
        return self.membership.is_active
    
    def __str__(self):
        return f'{self.user.full_name} - {self.organization.name}'
```

## `backend/apps/chefs/serializers.py`

```python
from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.organizations.models import OrganizationMembership
from apps.users.models import InvitationToken
from core.email import send_chef_invitation_email
from .models import ChefProfile

User = get_user_model()


class ChefProfileSerializer(serializers.ModelSerializer):
    # Use ChefProfile.id (not membership.id) so it matches what Event.chef expects
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    is_active = serializers.BooleanField(source='membership.is_active', read_only=True)
    has_accepted_invite = serializers.SerializerMethodField()
    event_count = serializers.SerializerMethodField()

    class Meta:
        model = ChefProfile
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 'phone',
            'address', 'default_pay_rate', 'calendar_color', 'notes',
            'is_active', 'has_accepted_invite', 'event_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'calendar_color', 'event_count', 'created_at', 'updated_at']

    def get_has_accepted_invite(self, obj):
        return obj.user.has_usable_password()

    def get_event_count(self, obj):
        return obj.events.filter(is_deleted=False).count()


class ChefProfileUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = ChefProfile
        fields = ['address', 'default_pay_rate', 'notes', 'first_name', 'last_name', 'phone']
    
    def update(self, instance, validated_data):
        user = instance.user
        if 'first_name' in validated_data:
            user.first_name = validated_data.pop('first_name')
        if 'last_name' in validated_data:
            user.last_name = validated_data.pop('last_name')
        if 'phone' in validated_data:
            user.phone = validated_data.pop('phone')
        user.save()
        
        return super().update(instance, validated_data)


class ChefInviteSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    default_pay_rate = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_email(self, value):
        organization = self.context['request'].organization
        if OrganizationMembership.objects.filter(
            user__email=value, 
            organization=organization
        ).exists():
            raise serializers.ValidationError('This user is already a member of your organization.')
        return value
    
    def create(self, validated_data):
        organization = self.context['request'].organization
        email = validated_data['email']
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': validated_data['first_name'],
                'last_name': validated_data['last_name'],
                'phone': validated_data.get('phone', ''),
            }
        )
        
        if created:
            user.set_unusable_password()
            user.save()
        
        membership = OrganizationMembership.objects.create(
            user=user,
            organization=organization,
            role='chef'
        )
        
        chef_profile = ChefProfile.objects.create(
            membership=membership,
            address=validated_data.get('address', ''),
            default_pay_rate=validated_data.get('default_pay_rate'),
            notes=validated_data.get('notes', '')
        )

        # Create invitation token and send email
        invitation = InvitationToken.objects.create(user=user)
        send_chef_invitation_email(user, organization, invitation.token)

        return chef_profile


class ChefSelfSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    phone = serializers.CharField(source='user.phone', allow_blank=True)
    
    class Meta:
        model = ChefProfile
        fields = [
            'email', 'first_name', 'last_name', 'full_name', 'phone', 'address'
        ]
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance
```

## `backend/apps/chefs/views.py`

```python
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from core.mixins import TenantMixin
from core.permissions import IsAdmin
from core.email import send_chef_invitation_email
from apps.users.models import InvitationToken
from .models import ChefProfile
from .serializers import (
    ChefProfileSerializer,
    ChefProfileUpdateSerializer,
    ChefInviteSerializer,
    ChefSelfSerializer
)


class ChefListView(TenantMixin, generics.ListAPIView):
    serializer_class = ChefProfileSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        if not self.request.organization:
            return ChefProfile.objects.none()
        return ChefProfile.objects.filter(
            membership__organization=self.request.organization
        ).select_related('membership__user')


class ChefInviteView(TenantMixin, generics.CreateAPIView):
    serializer_class = ChefInviteSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        chef_profile = serializer.save()
        
        return Response(
            ChefProfileSerializer(chef_profile).data,
            status=status.HTTP_201_CREATED
        )


class ChefDetailView(TenantMixin, generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        if not self.request.organization:
            return ChefProfile.objects.none()
        return ChefProfile.objects.filter(
            membership__organization=self.request.organization
        ).select_related('membership__user')
    
    def get_object(self):
        queryset = self.get_queryset()
        return generics.get_object_or_404(queryset, id=self.kwargs['pk'])
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ChefProfileUpdateSerializer
        return ChefProfileSerializer


class ChefDeactivateView(TenantMixin, APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            chef_profile = ChefProfile.objects.get(
                id=pk,
                membership__organization=request.organization
            )
            chef_profile.membership.is_active = False
            chef_profile.membership.save()
            return Response({'detail': 'Chef deactivated successfully.'})
        except ChefProfile.DoesNotExist:
            return Response(
                {'detail': 'Chef not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class ChefActivateView(TenantMixin, APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            chef_profile = ChefProfile.objects.get(
                id=pk,
                membership__organization=request.organization
            )
            chef_profile.membership.is_active = True
            chef_profile.membership.save()
            return Response({'detail': 'Chef activated successfully.'})
        except ChefProfile.DoesNotExist:
            return Response(
                {'detail': 'Chef not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class ChefResendInviteView(TenantMixin, APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            chef_profile = ChefProfile.objects.get(
                id=pk,
                membership__organization=request.organization
            )
            user = chef_profile.user

            # Check if user already has a password set (already accepted invite)
            if user.has_usable_password():
                return Response(
                    {'detail': 'This chef has already accepted their invitation.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Delete any existing tokens and create a new one
            InvitationToken.objects.filter(user=user).delete()
            invitation = InvitationToken.objects.create(user=user)

            # Send the invitation email
            send_chef_invitation_email(user, request.organization, invitation.token)

            return Response({'detail': 'Invitation resent successfully.'})
        except ChefProfile.DoesNotExist:
            return Response(
                {'detail': 'Chef not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class ChefMeView(TenantMixin, generics.RetrieveUpdateAPIView):
    serializer_class = ChefSelfSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        if not self.request.membership or self.request.membership.role != 'chef':
            return None
        return getattr(self.request.membership, 'chef_profile', None)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance:
            return Response(
                {'detail': 'Chef profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
```

## `backend/apps/chefs/urls.py`

```python
from django.urls import path
from .views import (
    ChefListView,
    ChefInviteView,
    ChefDetailView,
    ChefDeactivateView,
    ChefActivateView,
    ChefResendInviteView,
    ChefMeView
)

urlpatterns = [
    path('', ChefListView.as_view(), name='chef_list'),
    path('invite/', ChefInviteView.as_view(), name='chef_invite'),
    path('me/', ChefMeView.as_view(), name='chef_me'),
    path('<int:pk>/', ChefDetailView.as_view(), name='chef_detail'),
    path('<int:pk>/deactivate/', ChefDeactivateView.as_view(), name='chef_deactivate'),
    path('<int:pk>/activate/', ChefActivateView.as_view(), name='chef_activate'),
    path('<int:pk>/resend-invite/', ChefResendInviteView.as_view(), name='chef_resend_invite'),
]
```

## `backend/apps/chefs/admin.py`

```python
from django.contrib import admin
from .models import ChefProfile


@admin.register(ChefProfile)
class ChefProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'organization', 'default_pay_rate', 'calendar_color', 'is_active']
    list_filter = ['membership__organization', 'membership__is_active']
    search_fields = ['membership__user__email', 'membership__user__first_name']
    
    def user(self, obj):
        return obj.user.full_name
    
    def organization(self, obj):
        return obj.organization.name
    
    def is_active(self, obj):
        return obj.is_active
    is_active.boolean = True
```

## `backend/apps/clients/models.py`

```python
from django.db import models
from django.utils import timezone
from apps.organizations.models import Organization


class Client(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='clients')
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    allergies = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
```

## `backend/apps/clients/serializers.py`

```python
from django.db import models
from rest_framework import serializers
from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    event_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Client
        fields = [
            'id', 'name', 'email', 'phone', 'address', 
            'allergies', 'notes', 'event_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'event_count', 'created_at', 'updated_at']
    
    def get_event_count(self, obj):
        return obj.events.filter(is_deleted=False).count()


class ClientDetailSerializer(ClientSerializer):
    total_revenue = serializers.SerializerMethodField()
    
    class Meta(ClientSerializer.Meta):
        fields = ClientSerializer.Meta.fields + ['total_revenue']
    
    def get_total_revenue(self, obj):
        request = self.context.get('request')
        if request and request.membership and request.membership.role == 'admin':
            total = obj.events.filter(is_deleted=False, status='completed').aggregate(
                total=models.Sum('client_pay')
            )['total']
            return total or 0
        return None
```

## `backend/apps/clients/views.py`

```python
from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from core.mixins import TenantQuerysetMixin
from core.permissions import IsAdminOrReadOnly
from .models import Client
from .serializers import ClientSerializer, ClientDetailSerializer


class ClientListCreateView(TenantQuerysetMixin, generics.ListCreateAPIView):
    queryset = Client.objects.filter(is_deleted=False)
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'phone']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def perform_create(self, serializer):
        serializer.save(organization=self.request.organization)


class ClientDetailView(TenantQuerysetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Client.objects.filter(is_deleted=False)
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    
    def get_serializer_class(self):
        return ClientDetailSerializer
    
    def perform_destroy(self, instance):
        instance.soft_delete()
```

## `backend/apps/clients/urls.py`

```python
from django.urls import path
from .views import ClientListCreateView, ClientDetailView

urlpatterns = [
    path('', ClientListCreateView.as_view(), name='client_list_create'),
    path('<int:pk>/', ClientDetailView.as_view(), name='client_detail'),
]
```

## `backend/apps/clients/admin.py`

```python
from django.contrib import admin
from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'organization', 'is_deleted', 'created_at']
    list_filter = ['organization', 'is_deleted']
    search_fields = ['name', 'email', 'phone']
```

## `backend/apps/events/models.py`

```python
from django.db import models
from django.utils import timezone
from apps.organizations.models import Organization
from apps.clients.models import Client
from apps.chefs.models import ChefProfile


class Event(models.Model):
    class Status(models.TextChoices):
        UPCOMING = 'upcoming', 'Upcoming'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
    
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='events')
    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name='events')
    chef = models.ForeignKey(
        ChefProfile, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='events'
    )
    
    name = models.CharField(max_length=200, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    
    location = models.TextField(blank=True)
    guest_count = models.PositiveIntegerField()
    allergies = models.TextField(blank=True)
    menu_notes = models.TextField(blank=True)
    
    client_pay = models.DecimalField(max_digits=10, decimal_places=2)
    chef_pay = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    deposit_received = models.BooleanField(default=False)
    payment_received = models.BooleanField(default=False)
    
    internal_notes = models.TextField(blank=True, help_text='Admin only')
    chef_notes = models.TextField(blank=True, help_text='Editable by assigned chef')
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UPCOMING)
    
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['date', 'start_time']
    
    def __str__(self):
        return self.display_name
    
    @property
    def display_name(self):
        if self.name:
            return self.name
        return f'{self.client.name} Event'
    
    @property
    def profit(self):
        if self.chef_pay:
            return self.client_pay - self.chef_pay
        return self.client_pay
    
    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def save(self, *args, **kwargs):
        if not self.location and self.client.address:
            self.location = self.client.address
        super().save(*args, **kwargs)
```

## `backend/apps/events/serializers.py`

```python
from rest_framework import serializers
from .models import Event
from apps.clients.models import Client
from apps.chefs.models import ChefProfile


class EventListSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    chef_name = serializers.SerializerMethodField()
    chef_color = serializers.SerializerMethodField()
    display_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'display_name', 'name', 'date', 'start_time', 'end_time',
            'client', 'client_name', 'chef', 'chef_name', 'chef_color',
            'guest_count', 'status', 'client_pay'
        ]
    
    def get_chef_name(self, obj):
        if obj.chef:
            return obj.chef.user.full_name
        return None
    
    def get_chef_color(self, obj):
        if obj.chef:
            return obj.chef.calendar_color
        return '#9E9E9E'


class EventDetailSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    client_email = serializers.CharField(source='client.email', read_only=True)
    client_phone = serializers.CharField(source='client.phone', read_only=True)
    client_allergies = serializers.CharField(source='client.allergies', read_only=True)
    chef_name = serializers.SerializerMethodField()
    chef_email = serializers.SerializerMethodField()
    chef_phone = serializers.SerializerMethodField()
    chef_color = serializers.SerializerMethodField()
    display_name = serializers.CharField(read_only=True)
    profit = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'display_name', 'name', 'date', 'start_time', 'end_time',
            'client', 'client_name', 'client_email', 'client_phone', 'client_allergies',
            'chef', 'chef_name', 'chef_email', 'chef_phone', 'chef_color',
            'location', 'guest_count', 'allergies', 'menu_notes',
            'client_pay', 'chef_pay', 'profit', 'deposit_amount', 'deposit_received', 'payment_received',
            'internal_notes', 'chef_notes', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'profit', 'created_at', 'updated_at']
    
    def get_chef_name(self, obj):
        return obj.chef.user.full_name if obj.chef else None
    
    def get_chef_email(self, obj):
        return obj.chef.user.email if obj.chef else None
    
    def get_chef_phone(self, obj):
        return obj.chef.user.phone if obj.chef else None
    
    def get_chef_color(self, obj):
        return obj.chef.calendar_color if obj.chef else '#9E9E9E'


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'client', 'chef', 'name', 'date', 'start_time', 'end_time',
            'location', 'guest_count', 'allergies', 'menu_notes',
            'client_pay', 'chef_pay', 'deposit_amount', 'deposit_received', 'payment_received',
            'internal_notes', 'chef_notes', 'status'
        ]
    
    def validate_client(self, value):
        request = self.context['request']
        if value.organization != request.organization:
            raise serializers.ValidationError('Invalid client.')
        if value.is_deleted:
            raise serializers.ValidationError('Cannot assign deleted client.')
        return value
    
    def validate_chef(self, value):
        if value is None:
            return value
        request = self.context['request']
        if value.organization != request.organization:
            raise serializers.ValidationError('Invalid chef.')
        if not value.is_active:
            raise serializers.ValidationError('Cannot assign inactive chef.')
        return value


class EventChefViewSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    client_email = serializers.CharField(source='client.email', read_only=True)
    client_phone = serializers.CharField(source='client.phone', read_only=True)
    client_allergies = serializers.CharField(source='client.allergies', read_only=True)
    display_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'display_name', 'name', 'date', 'start_time', 'end_time',
            'client_name', 'client_email', 'client_phone', 'client_allergies',
            'location', 'guest_count', 'allergies', 'menu_notes',
            'chef_pay', 'chef_notes', 'status'
        ]
        read_only_fields = [
            'id', 'display_name', 'name', 'date', 'start_time', 'end_time',
            'client_name', 'client_email', 'client_phone', 'client_allergies',
            'location', 'guest_count', 'allergies', 'menu_notes',
            'chef_pay', 'status'
        ]


class EventCalendarSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='display_name')
    start = serializers.SerializerMethodField()
    end = serializers.SerializerMethodField()
    color = serializers.SerializerMethodField()
    extendedProps = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = ['id', 'title', 'start', 'end', 'color', 'extendedProps']
    
    def get_start(self, obj):
        return f'{obj.date}T{obj.start_time}'
    
    def get_end(self, obj):
        if obj.end_time:
            return f'{obj.date}T{obj.end_time}'
        return None
    
    def get_color(self, obj):
        if obj.chef:
            return obj.chef.calendar_color
        return '#9E9E9E'
    
    def get_extendedProps(self, obj):
        return {
            'client_name': obj.client.name,
            'chef_name': obj.chef.user.full_name if obj.chef else None,
            'guest_count': obj.guest_count,
            'location': obj.location,
            'status': obj.status
        }
```

## `backend/apps/events/views.py`

```python
from django.db.models import Sum, Count
from django.utils import timezone
from rest_framework import generics, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from core.mixins import TenantQuerysetMixin, TenantMixin
from core.permissions import IsAdmin
from core.email import send_event_assignment_email, send_event_update_email
from .models import Event
from .serializers import (
    EventListSerializer,
    EventDetailSerializer,
    EventCreateUpdateSerializer,
    EventChefViewSerializer,
    EventCalendarSerializer
)


class EventListCreateView(TenantQuerysetMixin, generics.ListCreateAPIView):
    queryset = Event.objects.filter(is_deleted=False)
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'client__name']
    ordering_fields = ['date', 'start_time', 'created_at']
    ordering = ['date', 'start_time']
    
    def get_queryset(self):
        qs = super().get_queryset()
        
        # Filter for chefs - only their assigned events
        if self.request.membership and self.request.membership.role == 'chef':
            chef_profile = getattr(self.request.membership, 'chef_profile', None)
            if chef_profile:
                qs = qs.filter(chef=chef_profile)
            else:
                return qs.none()
        
        # Status filter
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        
        # Chef filter (admin only)
        chef_filter = self.request.query_params.get('chef_id')
        if chef_filter and self.request.membership and self.request.membership.role == 'admin':
            qs = qs.filter(chef__membership__id=chef_filter)
        
        return qs.select_related('client', 'chef__membership__user')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventCreateUpdateSerializer
        if self.request.membership and self.request.membership.role == 'chef':
            return EventChefViewSerializer
        return EventListSerializer
    
    def perform_create(self, serializer):
        event = serializer.save(organization=self.request.organization)
        # Send email notification to chef if assigned
        if event.chef:
            try:
                send_event_assignment_email(
                    event.chef.user,
                    event,
                    self.request.organization
                )
            except Exception:
                pass  # Don't fail the request if email fails

    def create(self, request, *args, **kwargs):
        if not request.membership or request.membership.role != 'admin':
            return Response(
                {'detail': 'Only admins can create events.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)


class EventDetailView(TenantQuerysetMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.filter(is_deleted=False)
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        qs = super().get_queryset()
        
        if self.request.membership and self.request.membership.role == 'chef':
            chef_profile = getattr(self.request.membership, 'chef_profile', None)
            if chef_profile:
                qs = qs.filter(chef=chef_profile)
            else:
                return qs.none()
        
        return qs.select_related('client', 'chef__membership__user')
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            if self.request.membership and self.request.membership.role == 'chef':
                return EventChefViewSerializer
            return EventCreateUpdateSerializer
        if self.request.membership and self.request.membership.role == 'chef':
            return EventChefViewSerializer
        return EventDetailSerializer
    
    def update(self, request, *args, **kwargs):
        if request.membership and request.membership.role == 'chef':
            allowed_fields = {'chef_notes'}
            if set(request.data.keys()) - allowed_fields:
                return Response(
                    {'detail': 'Chefs can only update chef_notes.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            return super().update(request, *args, **kwargs)

        # Admin updating - check for chef changes
        instance = self.get_object()
        old_chef = instance.chef

        response = super().update(request, *args, **kwargs)

        # Refresh instance to get updated values
        instance.refresh_from_db()

        # Send notifications
        try:
            if instance.chef:
                if old_chef != instance.chef:
                    # New chef assigned - send assignment email
                    send_event_assignment_email(
                        instance.chef.user,
                        instance,
                        request.organization
                    )
                else:
                    # Same chef - send update email
                    send_event_update_email(
                        instance.chef.user,
                        instance,
                        request.organization
                    )
        except Exception:
            pass  # Don't fail the request if email fails

        return response
    
    def destroy(self, request, *args, **kwargs):
        if not request.membership or request.membership.role != 'admin':
            return Response(
                {'detail': 'Only admins can delete events.'},
                status=status.HTTP_403_FORBIDDEN
            )
        instance = self.get_object()
        instance.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EventCompleteView(TenantMixin, APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def post(self, request, pk):
        try:
            event = Event.objects.get(
                pk=pk,
                organization=request.organization,
                is_deleted=False
            )
            event.status = 'completed'
            event.save()
            return Response({'detail': 'Event marked as completed.'})
        except Event.DoesNotExist:
            return Response(
                {'detail': 'Event not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class EventCancelView(TenantMixin, APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def post(self, request, pk):
        try:
            event = Event.objects.get(
                pk=pk,
                organization=request.organization,
                is_deleted=False
            )
            event.status = 'cancelled'
            event.save()
            return Response({'detail': 'Event cancelled.'})
        except Event.DoesNotExist:
            return Response(
                {'detail': 'Event not found.'},
                status=status.HTTP_404_NOT_FOUND
            )


class EventCalendarView(TenantQuerysetMixin, generics.ListAPIView):
    queryset = Event.objects.filter(is_deleted=False).exclude(status='cancelled')
    serializer_class = EventCalendarSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        qs = super().get_queryset()
        
        if self.request.membership and self.request.membership.role == 'chef':
            chef_profile = getattr(self.request.membership, 'chef_profile', None)
            if chef_profile:
                qs = qs.filter(chef=chef_profile)
            else:
                return qs.none()
        
        # Date range filtering
        start = self.request.query_params.get('start')
        end = self.request.query_params.get('end')
        
        if start:
            qs = qs.filter(date__gte=start)
        if end:
            qs = qs.filter(date__lte=end)
        
        # Chef filter (admin only)
        chef_id = self.request.query_params.get('chef_id')
        if chef_id and self.request.membership and self.request.membership.role == 'admin':
            if chef_id == 'unassigned':
                qs = qs.filter(chef__isnull=True)
            else:
                qs = qs.filter(chef__membership__id=chef_id)

        return qs.select_related('client', 'chef__membership__user')


class DashboardView(TenantMixin, APIView):
    """
    Dashboard API - returns role-aware stats and upcoming events.

    Admin sees: revenue, paid_out, profit, event_count, upcoming_events, recent_completed
    Chef sees: earnings_this_month, earnings_this_year, upcoming_events
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.organization:
            return Response({'detail': 'No organization found.'}, status=400)

        today = timezone.now().date()
        current_month_start = today.replace(day=1)
        current_year_start = today.replace(month=1, day=1)

        if request.membership.role == 'admin':
            return self._admin_dashboard(request, today, current_month_start)
        else:
            return self._chef_dashboard(request, today, current_month_start, current_year_start)

    def _admin_dashboard(self, request, today, current_month_start):
        base_qs = Event.objects.filter(
            organization=request.organization,
            is_deleted=False
        )

        # This month's completed events stats
        month_completed = base_qs.filter(
            status='completed',
            date__gte=current_month_start,
            date__lte=today
        ).aggregate(
            revenue=Sum('client_pay'),
            paid_out=Sum('chef_pay'),
            event_count=Count('id')
        )

        revenue = month_completed['revenue'] or 0
        paid_out = month_completed['paid_out'] or 0
        profit = revenue - paid_out
        event_count = month_completed['event_count'] or 0

        # Upcoming events (next 5)
        upcoming_events = base_qs.filter(
            status='upcoming',
            date__gte=today
        ).select_related('client', 'chef__membership__user').order_by('date', 'start_time')[:5]

        upcoming_data = [
            {
                'id': e.id,
                'display_name': e.display_name,
                'date': e.date,
                'start_time': e.start_time,
                'client_name': e.client.name,
                'chef_name': e.chef.user.full_name if e.chef else None,
                'chef_color': e.chef.calendar_color if e.chef else '#9E9E9E',
                'guest_count': e.guest_count,
                'client_pay': str(e.client_pay),
            }
            for e in upcoming_events
        ]

        # Recently completed (last 5)
        recent_completed = base_qs.filter(
            status='completed'
        ).select_related('client', 'chef__membership__user').order_by('-date')[:5]

        recent_data = [
            {
                'id': e.id,
                'display_name': e.display_name,
                'date': e.date,
                'client_name': e.client.name,
                'chef_name': e.chef.user.full_name if e.chef else None,
                'client_pay': str(e.client_pay),
            }
            for e in recent_completed
        ]

        return Response({
            'stats': {
                'revenue': str(revenue),
                'paid_out': str(paid_out),
                'profit': str(profit),
                'event_count': event_count,
            },
            'upcoming_events': upcoming_data,
            'recent_completed': recent_data,
        })

    def _chef_dashboard(self, request, today, current_month_start, current_year_start):
        chef_profile = getattr(request.membership, 'chef_profile', None)
        if not chef_profile:
            return Response({'detail': 'Chef profile not found.'}, status=404)

        base_qs = Event.objects.filter(
            organization=request.organization,
            chef=chef_profile,
            is_deleted=False
        )

        # This month's earnings (completed events)
        month_earnings = base_qs.filter(
            status='completed',
            date__gte=current_month_start,
            date__lte=today
        ).aggregate(total=Sum('chef_pay'))['total'] or 0

        # This year's earnings (completed events)
        year_earnings = base_qs.filter(
            status='completed',
            date__gte=current_year_start,
            date__lte=today
        ).aggregate(total=Sum('chef_pay'))['total'] or 0

        # Upcoming events
        upcoming_events = base_qs.filter(
            status='upcoming',
            date__gte=today
        ).select_related('client').order_by('date', 'start_time')[:5]

        upcoming_data = [
            {
                'id': e.id,
                'display_name': e.display_name,
                'date': e.date,
                'start_time': e.start_time,
                'end_time': e.end_time,
                'client_name': e.client.name,
                'location': e.location,
                'guest_count': e.guest_count,
                'chef_pay': str(e.chef_pay) if e.chef_pay else None,
            }
            for e in upcoming_events
        ]

        return Response({
            'earnings': {
                'this_month': str(month_earnings),
                'this_year': str(year_earnings),
            },
            'upcoming_events': upcoming_data,
        })


class FinancesView(TenantMixin, APIView):
    """
    Finances API - returns financial summary with date filtering.
    Admin only.

    Query params:
    - start_date: YYYY-MM-DD (defaults to first day of current month)
    - end_date: YYYY-MM-DD (defaults to today)
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        if not request.organization:
            return Response({'detail': 'No organization found.'}, status=400)

        today = timezone.now().date()

        # Parse date filters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if start_date:
            try:
                from datetime import datetime
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            except ValueError:
                return Response({'detail': 'Invalid start_date format. Use YYYY-MM-DD.'}, status=400)
        else:
            start_date = today.replace(day=1)

        if end_date:
            try:
                from datetime import datetime
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            except ValueError:
                return Response({'detail': 'Invalid end_date format. Use YYYY-MM-DD.'}, status=400)
        else:
            end_date = today

        # Get completed events in date range
        completed_events = Event.objects.filter(
            organization=request.organization,
            is_deleted=False,
            status='completed',
            date__gte=start_date,
            date__lte=end_date
        )

        # Aggregate totals
        totals = completed_events.aggregate(
            revenue=Sum('client_pay'),
            paid_out=Sum('chef_pay'),
            event_count=Count('id')
        )

        revenue = totals['revenue'] or 0
        paid_out = totals['paid_out'] or 0
        profit = revenue - paid_out
        event_count = totals['event_count'] or 0

        return Response({
            'period': {
                'start_date': str(start_date),
                'end_date': str(end_date),
            },
            'summary': {
                'revenue': str(revenue),
                'paid_out': str(paid_out),
                'profit': str(profit),
                'event_count': event_count,
            }
        })


class FinancesByChefView(TenantMixin, APIView):
    """
    Finances by chef breakdown - returns earnings per chef.
    Admin only.

    Query params:
    - start_date: YYYY-MM-DD (defaults to first day of current month)
    - end_date: YYYY-MM-DD (defaults to today)
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        if not request.organization:
            return Response({'detail': 'No organization found.'}, status=400)

        today = timezone.now().date()

        # Parse date filters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if start_date:
            try:
                from datetime import datetime
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            except ValueError:
                return Response({'detail': 'Invalid start_date format. Use YYYY-MM-DD.'}, status=400)
        else:
            start_date = today.replace(day=1)

        if end_date:
            try:
                from datetime import datetime
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            except ValueError:
                return Response({'detail': 'Invalid end_date format. Use YYYY-MM-DD.'}, status=400)
        else:
            end_date = today

        # Get completed events grouped by chef
        chef_breakdown = Event.objects.filter(
            organization=request.organization,
            is_deleted=False,
            status='completed',
            date__gte=start_date,
            date__lte=end_date,
            chef__isnull=False
        ).values(
            'chef__id',
            'chef__membership__user__first_name',
            'chef__membership__user__last_name',
            'chef__calendar_color'
        ).annotate(
            total_paid=Sum('chef_pay'),
            event_count=Count('id')
        ).order_by('-total_paid')

        breakdown_data = [
            {
                'chef_id': item['chef__id'],
                'chef_name': f"{item['chef__membership__user__first_name']} {item['chef__membership__user__last_name']}",
                'chef_color': item['chef__calendar_color'],
                'total_paid': str(item['total_paid'] or 0),
                'event_count': item['event_count'],
            }
            for item in chef_breakdown
        ]

        return Response({
            'period': {
                'start_date': str(start_date),
                'end_date': str(end_date),
            },
            'by_chef': breakdown_data,
        })
```

## `backend/apps/events/urls.py`

```python
from django.urls import path
from .views import (
    EventListCreateView,
    EventDetailView,
    EventCompleteView,
    EventCancelView,
    EventCalendarView
)

urlpatterns = [
    path('', EventListCreateView.as_view(), name='event_list_create'),
    path('calendar/', EventCalendarView.as_view(), name='event_calendar'),
    path('<int:pk>/', EventDetailView.as_view(), name='event_detail'),
    path('<int:pk>/complete/', EventCompleteView.as_view(), name='event_complete'),
    path('<int:pk>/cancel/', EventCancelView.as_view(), name='event_cancel'),
]
```

## `backend/apps/events/admin.py`

```python
from django.contrib import admin
from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'client', 'chef_name', 'date', 'status', 'client_pay', 'is_deleted']
    list_filter = ['status', 'is_deleted', 'organization', 'date']
    search_fields = ['name', 'client__name']
    date_hierarchy = 'date'
    
    def chef_name(self, obj):
        return obj.chef.user.full_name if obj.chef else '-'
    chef_name.short_description = 'Chef'
```

## `backend/apps/notifications/models.py`

```python
from django.db import models
```

---

# Frontend Code

## `frontend/package.json`

```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "next": "16.0.10",
    "react": "19.2.1",
    "react-dom": "19.2.1"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "babel-plugin-react-compiler": "1.0.0",
    "eslint": "^9",
    "eslint-config-next": "16.0.10",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

## `frontend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

## `frontend/next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
```

## `frontend/postcss.config.mjs`

```text
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

## `frontend/src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chef Bawss",
  description: "Private chef business management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

## `frontend/src/app/page.tsx`

```tsx
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">Chef Bawss</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Manage Your Private Chef Business Like a Pro
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Schedule events, track clients, manage your chef team, and grow your revenue — all in one place.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Everything You Need to Run Your Business
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              title="Event Management"
              description="Schedule and track all your private chef events with ease. Never double-book again."
              icon={<CalendarIcon />}
            />
            <FeatureCard
              title="Client Database"
              description="Keep track of client preferences, allergies, and event history in one place."
              icon={<UsersIcon />}
            />
            <FeatureCard
              title="Chef Scheduling"
              description="Assign chefs to events and manage your team's availability effortlessly."
              icon={<ChefIcon />}
            />
            <FeatureCard
              title="Financial Tracking"
              description="Monitor revenue, chef payouts, and profit margins with detailed reports."
              icon={<DollarIcon />}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Streamline Your Business?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join private chef businesses already using Chef Bawss to manage their operations.
          </p>
          <Link
            href="/register"
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-lg"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold">Chef Bawss</span>
              <p className="text-gray-400 mt-1">Private chef business management</p>
            </div>
            <div className="flex gap-8">
              <Link href="/login" className="text-gray-400 hover:text-white">
                Login
              </Link>
              <Link href="/register" className="text-gray-400 hover:text-white">
                Sign Up
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Chef Bawss. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function ChefIcon() {
  return (
    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
```

## `frontend/src/app/globals.css`

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}

/* Ensure form inputs always have dark text on light background */
input, textarea, select {
  color: #171717 !important;
  background-color: #ffffff !important;
}

input::placeholder, textarea::placeholder {
  color: #9ca3af !important;
}
```

## `frontend/src/app/login/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Invalid email or password');
      } else {
        setError('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
              Chef Bawss
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900">
              Sign in to your account
            </h2>
          </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">Don&apos;t have an account? </span>
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Register your business
            </Link>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
```

## `frontend/src/app/register/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    business_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        business_name: formData.business_name,
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
              Chef Bawss
            </Link>
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Log in
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900">
              Register your business
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Start managing your private chef business today
            </p>
          </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <input
                id="business_name"
                name="business_name"
                type="text"
                required
                value={formData.business_name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Your Chef Business"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
```

## `frontend/src/app/forgot-password/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.requestPasswordReset(email);
      setSubmitted(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
              Chef Bawss
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900">
              Reset your password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-6 rounded-md text-center">
              <h3 className="font-medium mb-2">Check your email</h3>
              <p className="text-sm">
                If an account with that email exists, we&apos;ve sent a password reset link.
                Please check your inbox and spam folder.
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 text-sm font-medium text-green-700 hover:text-green-600"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </div>

              <div className="text-center text-sm">
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
```

## `frontend/src/app/reset-password/page.tsx`

```tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await api.confirmPasswordReset(token!, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password. The link may have expired.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
              Chef Bawss
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900">
              Set your new password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter a new password for your account.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
                {error.includes('expired') && (
                  <div className="mt-2">
                    <Link href="/forgot-password" className="font-medium underline">
                      Request a new reset link
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter new password"
                  disabled={!token}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirm new password"
                  disabled={!token}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>

            <div className="text-center text-sm">
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
```

## `frontend/src/app/accept-invite/page.tsx`

```tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface InviteInfo {
  email: string;
  first_name: string;
  last_name: string;
  organization_name: string;
}

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided.');
      setLoading(false);
      return;
    }

    const fetchInviteInfo = async () => {
      try {
        const info = await api.getInviteInfo(token);
        setInviteInfo(info);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid or expired invitation.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchInviteInfo();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await api.acceptInvite(token!, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to accept invitation.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!inviteInfo) {
    return (
      <div className="max-w-md w-full space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error || 'Invalid invitation.'}
        </div>
        <div className="text-center">
          <Link href="/login" className="text-blue-600 hover:text-blue-500">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Welcome to Chef Bawss!
        </h2>
        <p className="mt-2 text-gray-600">
          You&apos;ve been invited to join <strong>{inviteInfo.organization_name}</strong> as a chef.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600">
          <p><strong>Name:</strong> {inviteInfo.first_name} {inviteInfo.last_name}</p>
          <p><strong>Email:</strong> {inviteInfo.email}</p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Create Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Re-enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Setting up account...
            </span>
          ) : (
            'Accept Invitation'
          )}
        </button>
      </form>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
              Chef Bawss
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          <AcceptInviteForm />
        </Suspense>
      </div>
    </div>
  );
}
```

## `frontend/src/app/(dashboard)/layout.tsx`

```tsx
'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
```

## `frontend/src/app/(dashboard)/dashboard/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { AdminDashboard, ChefDashboard, DashboardEvent } from '@/types';
import Link from 'next/link';

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <p className="text-xs sm:text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1 sm:mt-2 text-xl sm:text-3xl font-semibold text-gray-900">{value}</p>
      {subtitle && <p className="mt-1 text-xs sm:text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

function AdminEventCard({ event }: { event: DashboardEvent }) {
  return (
    <Link href={`/events/${event.id}`} className="block">
      <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900">{event.display_name}</h3>
            <p className="text-sm text-gray-500">{event.client_name}</p>
          </div>
          {event.chef_color && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: event.chef_color }}
              title={event.chef_name || 'No chef assigned'}
            />
          )}
        </div>
        <div className="mt-2 text-sm text-gray-500">
          <p>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          {event.start_time && <p>{event.start_time}{event.end_time ? ` - ${event.end_time}` : ''}</p>}
        </div>
        {event.client_pay && (
          <p className="mt-2 text-sm font-medium text-gray-900">
            ${Number(event.client_pay).toLocaleString()}
          </p>
        )}
      </div>
    </Link>
  );
}

function ChefEventCard({ event }: { event: DashboardEvent }) {
  return (
    <Link href={`/events/${event.id}/chef-view`} className="block">
      <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{event.display_name}</h3>
            <p className="text-sm text-gray-500">{event.client_name}</p>
          </div>
          {event.chef_pay && (
            <p className="text-sm font-semibold text-green-600">
              ${Number(event.chef_pay).toLocaleString()}
            </p>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <p className="font-medium text-gray-700">
              {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            {event.start_time && <p>{event.start_time}{event.end_time ? ` - ${event.end_time}` : ''}</p>}
          </div>
          {event.guest_count && (
            <div className="text-right text-sm">
              <p className="text-gray-500">{event.guest_count} guests</p>
            </div>
          )}
        </div>
        {event.location && (
          <p className="mt-2 text-xs text-gray-400 truncate">{event.location}</p>
        )}
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { isAdmin, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminData, setAdminData] = useState<AdminDashboard | null>(null);
  const [chefData, setChefData] = useState<ChefDashboard | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.getDashboard();
        if (isAdmin) {
          setAdminData(data as AdminDashboard);
        } else {
          setChefData(data as ChefDashboard);
        }
      } catch (err) {
        setError('Failed to load dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  if (isAdmin && adminData) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user?.first_name}</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link
              href="/events/new"
              className="px-3 py-2 text-sm sm:px-4 sm:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + New Event
            </Link>
            <Link
              href="/clients/new"
              className="px-3 py-2 text-sm sm:px-4 sm:text-base bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              + New Client
            </Link>
            <Link
              href="/chefs"
              className="px-3 py-2 text-sm sm:px-4 sm:text-base bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              + Invite Chef
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatCard
            title="Total Revenue"
            value={`$${Number(adminData.stats.revenue).toLocaleString()}`}
          />
          <StatCard
            title="Paid to Chefs"
            value={`$${Number(adminData.stats.paid_out).toLocaleString()}`}
          />
          <StatCard
            title="Profit"
            value={`$${Number(adminData.stats.profit).toLocaleString()}`}
          />
          <StatCard
            title="Total Events"
            value={adminData.stats.event_count.toString()}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
              <Link href="/events" className="text-sm text-blue-600 hover:text-blue-500">
                View all
              </Link>
            </div>
            {adminData.upcoming_events.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming events</p>
            ) : (
              <div className="space-y-4">
                {adminData.upcoming_events.map((event) => (
                  <AdminEventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recently Completed</h2>
            </div>
            {adminData.recent_completed.length === 0 ? (
              <p className="text-gray-500 text-sm">No recently completed events</p>
            ) : (
              <div className="space-y-4">
                {adminData.recent_completed.map((event) => (
                  <AdminEventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (chefData) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.first_name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Earnings This Month"
            value={`$${Number(chefData.earnings.this_month).toLocaleString()}`}
          />
          <StatCard
            title="Earnings This Year"
            value={`$${Number(chefData.earnings.this_year).toLocaleString()}`}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Upcoming Events</h2>
            <Link href="/events" className="text-sm text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>
          {chefData.upcoming_events.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming events</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chefData.upcoming_events.map((event) => (
                <ChefEventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
```

## `frontend/src/app/(dashboard)/calendar/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { CalendarEvent } from '@/types';

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

export default function CalendarPage() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const getEventLink = (eventId: number) =>
    isAdmin ? `/events/${eventId}` : `/events/${eventId}/chef-view`;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
        const data = await api.getCalendarEvents(startDate, endDate);
        setEvents(data);
      } catch (err) {
        setError('Failed to load calendar events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [year, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((event) => event.start.startsWith(dateStr));
  };

  const getDateString = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  const isToday = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === month &&
    today.getFullYear() === year;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - stacks on mobile */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500 hidden sm:block">View your scheduled events</p>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
          {isAdmin && (
            <Link
              href="/events/new"
              className="hidden sm:block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + New Event
            </Link>
          )}
          <button
            onClick={goToToday}
            className="px-2 py-1 text-xs sm:text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md"
          >
            Today
          </button>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={previousMonth}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-md"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm sm:text-lg font-semibold text-gray-900 min-w-[120px] sm:min-w-[180px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-md"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 border-b border-gray-200">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="px-1 sm:px-2 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase"
                >
                  {/* Show single letter on mobile */}
                  <span className="sm:hidden">{day[0]}</span>
                  <span className="hidden sm:inline">{day}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="min-h-[60px] sm:min-h-[120px] border-b border-r border-gray-200 bg-gray-50"
                />
              ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const dayEvents = getEventsForDay(day);

                return (
                  <div
                    key={day}
                    className={`min-h-[60px] sm:min-h-[120px] border-b border-r border-gray-200 p-1 sm:p-2 group ${
                      isToday(day) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`text-xs sm:text-sm font-medium ${
                        isToday(day) ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {day}
                      </div>
                      {isAdmin && (
                        <Link
                          href={`/events/new?date=${getDateString(day)}`}
                          className="hidden sm:flex opacity-0 group-hover:opacity-100 w-5 h-5 items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-opacity"
                          title="Add event"
                        >
                          +
                        </Link>
                      )}
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 mt-0.5 sm:mt-1">
                      {/* On mobile: show dot indicators, on desktop: show event details */}
                      {/* Mobile view - just colored dots */}
                      <div className="sm:hidden flex flex-wrap gap-0.5">
                        {dayEvents.slice(0, 4).map((event) => (
                          <Link
                            key={event.id}
                            href={getEventLink(event.id)}
                            className={`w-2 h-2 rounded-full ${statusColors[event.extendedProps.status] || 'bg-gray-500'}`}
                            title={`${event.title} - ${event.extendedProps.client_name}`}
                          />
                        ))}
                        {dayEvents.length > 4 && (
                          <span className="text-[8px] text-gray-500">+{dayEvents.length - 4}</span>
                        )}
                      </div>
                      {/* Desktop view - full event cards */}
                      <div className="hidden sm:block space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <Link
                            key={event.id}
                            href={getEventLink(event.id)}
                            className={`block px-2 py-1 text-xs text-white rounded truncate hover:opacity-80 ${statusColors[event.extendedProps.status] || 'bg-gray-500'}`}
                            title={`${event.title} - ${event.extendedProps.client_name}`}
                          >
                            {event.start?.slice(11, 16)} {event.title}
                          </Link>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="px-2 py-1 text-xs text-gray-500">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-500">Status:</span>
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1">
            <div className={`h-3 w-3 rounded ${color}`} />
            <span className="text-gray-600 capitalize">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## `frontend/src/app/(dashboard)/finances/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FinancesSummary, FinancesByChef } from '@/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

export default function FinancesPage() {
  const [summary, setSummary] = useState<FinancesSummary | null>(null);
  const [byChef, setByChef] = useState<FinancesByChef | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryData, chefData] = await Promise.all([
        api.getFinances(dateRange.start_date || undefined, dateRange.end_date || undefined),
        api.getFinancesByChef(dateRange.start_date || undefined, dateRange.end_date || undefined),
      ]);
      setSummary(summaryData);
      setByChef(chefData);
    } catch (err) {
      setError('Failed to load financial data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  if (loading && !summary) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finances</h1>
            <p className="text-gray-500">Track revenue and chef payouts</p>
          </div>
        </div>

        <form onSubmit={handleFilter} className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Apply Filter'}
            </button>
            {(dateRange.start_date || dateRange.end_date) && (
              <button
                type="button"
                onClick={() => {
                  setDateRange({ start_date: '', end_date: '' });
                  setTimeout(fetchData, 0);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={`$${Number(summary.summary.revenue).toLocaleString()}`}
            />
            <StatCard
              title="Paid to Chefs"
              value={`$${Number(summary.summary.paid_out).toLocaleString()}`}
            />
            <StatCard
              title="Profit"
              value={`$${Number(summary.summary.profit).toLocaleString()}`}
            />
            <StatCard
              title="Total Events"
              value={summary.summary.event_count.toString()}
            />
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Earnings by Chef</h2>
          </div>
          {!byChef || byChef.by_chef.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No earnings data available for the selected period
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chef
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Events
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Earned
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {byChef.by_chef.map((chef) => (
                  <tr key={chef.chef_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: chef.chef_color || '#E5E7EB' }}
                          >
                            <span className="text-xs font-medium text-white">
                              {chef.chef_name?.split(' ').map(n => n[0]).join('') || '??'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {chef.chef_name || 'Unknown Chef'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {chef.event_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${Number(chef.total_paid).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

## `frontend/src/app/(dashboard)/clients/page.tsx`

```tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { formatPhoneNumber } from '@/lib/utils';
import { Client } from '@/types';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await api.getClients();
        setClients(data);
      } catch (err) {
        setError('Failed to load clients');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    if (!search) return clients;
    const searchLower = search.toLowerCase();
    return clients.filter((client) =>
      client.name.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone?.includes(search) ||
      client.address?.toLowerCase().includes(searchLower)
    );
  }, [clients, search]);

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-sm text-gray-500 hidden sm:block">Manage your client list</p>
          </div>
          <Link
            href="/clients/new"
            className="px-3 py-2 text-sm sm:px-4 sm:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors self-start sm:self-auto"
          >
            + Add Client
          </Link>
        </div>

        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search clients by name, email, phone, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {filteredClients.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              {clients.length === 0 ? 'No clients found' : 'No clients match your search'}
            </p>
            {clients.length === 0 && (
              <Link
                href="/clients/new"
                className="mt-4 inline-block text-blue-600 hover:text-blue-500"
              >
                Add your first client
              </Link>
            )}
            {clients.length > 0 && (
              <button
                onClick={() => setSearch('')}
                className="mt-4 text-blue-600 hover:text-blue-500"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="sm:hidden space-y-3">
              {filteredClients.map((client) => (
                <Link key={client.id} href={`/clients/${client.id}`} className="block">
                  <div className="bg-white shadow rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{client.name}</h3>
                        {client.email && <p className="text-sm text-gray-500">{client.email}</p>}
                        {client.phone && <p className="text-sm text-gray-500">{formatPhoneNumber(client.phone)}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${Number(client.total_revenue || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{client.event_count || 0} events</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden sm:block bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Events
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{client.email}</div>
                        {client.phone && (
                          <div className="text-sm text-gray-500">{formatPhoneNumber(client.phone)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {client.address || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {client.event_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${Number(client.total_revenue || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/clients/${client.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <Link
                          href={`/clients/${client.id}/edit`}
                          className="ml-4 text-gray-600 hover:text-gray-900"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
```

## `frontend/src/app/(dashboard)/clients/new/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPhoneNumber } from '@/lib/utils';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.createClient(form);
      router.push('/clients');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create client';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/clients"
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            &larr; Back to Clients
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">New Client</h1>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Client Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Smith"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="client@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: formatPhoneNumber(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Main St, City, State 12345"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Dietary restrictions, preferences, special instructions..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link
                href="/clients"
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Client'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

## `frontend/src/app/(dashboard)/clients/[id]/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPhoneNumber } from '@/lib/utils';
import { Client, Event } from '@/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const clientId = Number(params.id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientData, eventsData] = await Promise.all([
          api.getClient(clientId),
          api.getEvents(),
        ]);
        setClient(clientData);
        setEvents(eventsData.filter((e: Event) => e.client === clientId));
      } catch (err) {
        setError('Failed to load client');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchData();
    }
  }, [clientId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this client? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await api.deleteClient(clientId);
      router.push('/clients');
    } catch (err) {
      console.error(err);
      alert('Failed to delete client');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !client) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error || 'Client not found'}
        </div>
      </ProtectedRoute>
    );
  }

  const statusColors: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  // Sort events: upcoming first (by date asc), then completed/cancelled (by date desc)
  const sortedEvents = [...events].sort((a, b) => {
    if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
    if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
    if (a.status === 'upcoming') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const completedEvents = events.filter(e => e.status === 'completed');

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/clients"
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            &larr; Back to Clients
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{client.name}</h1>
            <div className="flex gap-2">
              <Link
                href={`/clients/${clientId}/edit`}
                className="px-3 sm:px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting || events.length > 0}
                className="px-3 sm:px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
                title={events.length > 0 ? 'Cannot delete client with events' : ''}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-gray-900">
                  {client.email ? (
                    <a href={`mailto:${client.email}`} className="text-blue-600 hover:text-blue-500">
                      {client.email}
                    </a>
                  ) : (
                    '-'
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1 text-gray-900">
                  {client.phone ? (
                    <a href={`tel:${client.phone}`} className="text-blue-600 hover:text-blue-500">
                      {formatPhoneNumber(client.phone)}
                    </a>
                  ) : (
                    '-'
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1 text-gray-900">{client.address || '-'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                <p className="mt-1 text-gray-900 font-semibold">
                  ${Number(client.total_revenue || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {client.allergies && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Allergies</h3>
                <p className="mt-1 text-gray-900">{client.allergies}</p>
              </div>
            )}

            {client.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}

            {/* Client History Summary */}
            {events.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">History Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-semibold text-gray-900">{events.length}</p>
                    <p className="text-xs text-gray-500">Total Events</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-semibold text-blue-600">{upcomingEvents.length}</p>
                    <p className="text-xs text-gray-500">Upcoming</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-semibold text-green-600">{completedEvents.length}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-semibold text-gray-900">
                      ${Number(client.total_revenue || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Total Revenue</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Event History ({events.length})
            </h2>
            <Link
              href="/events/new"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              + New Event
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
              No events for this client yet
            </div>
          ) : (
            <>
              {/* Mobile card view */}
              <div className="sm:hidden space-y-3">
                {sortedEvents.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`} className="block">
                    <div className="bg-white shadow rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{event.display_name}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[event.status]}`}>
                            {event.status}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            ${Number(event.client_pay).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop table view */}
              <div className="hidden sm:block bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <Link
                            href={`/events/${event.id}`}
                            className="text-blue-600 hover:text-blue-500 font-medium"
                          >
                            {event.display_name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[event.status]}`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ${Number(event.client_pay).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

## `frontend/src/app/(dashboard)/clients/[id]/edit/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPhoneNumber } from '@/lib/utils';
import { Client } from '@/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    allergies: '',
    notes: '',
  });

  const clientId = Number(params.id);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const client: Client = await api.getClient(clientId);
        setForm({
          name: client.name,
          email: client.email || '',
          phone: client.phone || '',
          address: client.address || '',
          allergies: client.allergies || '',
          notes: client.notes || '',
        });
      } catch (err) {
        setError('Failed to load client');
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.updateClient(clientId, form);
      router.push(`/clients/${clientId}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update client';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/clients/${clientId}`}
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            &larr; Back to Client
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Edit Client</h1>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Client Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Smith"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="client@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: formatPhoneNumber(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Main St, City, State 12345"
              />
            </div>

            <div>
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                Allergies
              </label>
              <input
                type="text"
                id="allergies"
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nuts, shellfish, dairy..."
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Dietary restrictions, preferences, special instructions..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link
                href={`/clients/${clientId}`}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

## `frontend/src/app/(dashboard)/chefs/page.tsx`

```tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { formatPhoneNumber } from '@/lib/utils';
import { Chef } from '@/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ChefsPage() {
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [inviting, setInviting] = useState(false);

  const fetchChefs = async () => {
    try {
      const data = await api.getChefs();
      setChefs(data);
    } catch (err) {
      setError('Failed to load chefs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChefs();
  }, []);

  const filteredChefs = useMemo(() => {
    return chefs.filter((chef) => {
      const matchesSearch = search === '' ||
        chef.first_name.toLowerCase().includes(search.toLowerCase()) ||
        chef.last_name.toLowerCase().includes(search.toLowerCase()) ||
        chef.email.toLowerCase().includes(search.toLowerCase()) ||
        (chef.phone && chef.phone.includes(search));

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && chef.is_active) ||
        (statusFilter === 'inactive' && !chef.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [chefs, search, statusFilter]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      await api.inviteChef(inviteForm);
      setShowInviteModal(false);
      setInviteForm({ email: '', first_name: '', last_name: '', phone: '' });
      fetchChefs();
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to invite chef';
      alert(errorMessage);
    } finally {
      setInviting(false);
    }
  };

  const handleToggleActive = async (chef: Chef) => {
    try {
      if (chef.is_active) {
        await api.deactivateChef(chef.id);
      } else {
        await api.activateChef(chef.id);
      }
      fetchChefs();
    } catch (err) {
      console.error(err);
      alert('Failed to update chef status');
    }
  };

  const handleResendInvite = async (chef: Chef) => {
    try {
      await api.resendChefInvite(chef.id);
      alert('Invitation resent successfully!');
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend invitation';
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chefs</h1>
            <p className="text-gray-500">Manage your chef team</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors self-start sm:self-auto"
          >
            Invite Chef
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search chefs by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {filteredChefs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              {chefs.length === 0 ? 'No chefs found' : 'No chefs match your search'}
            </p>
            {chefs.length === 0 && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="mt-4 text-blue-600 hover:text-blue-500"
              >
                Invite your first chef
              </button>
            )}
            {chefs.length > 0 && (
              <button
                onClick={() => { setSearch(''); setStatusFilter('all'); }}
                className="mt-4 text-blue-600 hover:text-blue-500"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chef
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Events
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChefs.map((chef) => (
                  <tr key={chef.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: chef.calendar_color || '#E5E7EB' }}
                          >
                            <span className="text-sm font-medium text-white">
                              {chef.first_name?.[0]}{chef.last_name?.[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {chef.first_name} {chef.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{chef.email}</div>
                      {chef.phone && (
                        <div className="text-sm text-gray-500">{formatPhoneNumber(chef.phone)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {chef.event_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full inline-block w-fit ${
                            chef.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {chef.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {!chef.has_accepted_invite && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 inline-block w-fit">
                            Invite Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      {!chef.has_accepted_invite && (
                        <button
                          onClick={() => handleResendInvite(chef)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Resend Invite
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleActive(chef)}
                        className={`${
                          chef.is_active
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {chef.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Invite Chef</h2>
            <form onSubmit={handleInvite}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      value={inviteForm.first_name}
                      onChange={(e) => setInviteForm({ ...inviteForm, first_name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      value={inviteForm.last_name}
                      onChange={(e) => setInviteForm({ ...inviteForm, last_name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="chef@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={inviteForm.phone}
                    onChange={(e) => setInviteForm({ ...inviteForm, phone: formatPhoneNumber(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {inviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
```

## `frontend/src/app/(dashboard)/events/page.tsx`

```tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Event } from '@/types';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function EventsPage() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.getEvents();
        setEvents(data);
      } catch (err) {
        setError('Failed to load events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = search === '' ||
        event.display_name.toLowerCase().includes(search.toLowerCase()) ||
        event.client_name.toLowerCase().includes(search.toLowerCase()) ||
        (event.chef_name && event.chef_name.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || event.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, search, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {isAdmin ? 'Events' : 'My Events'}
          </h1>
          <p className="text-sm text-gray-500 hidden sm:block">
            {isAdmin ? 'Manage all events' : 'View your assigned events'}
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/events/new"
            className="px-3 py-2 text-sm sm:px-4 sm:text-base bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors self-start sm:self-auto"
          >
            + New Event
          </Link>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search events, clients, or chefs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {events.length === 0 ? 'No events found' : 'No events match your search'}
          </p>
          {events.length === 0 && isAdmin && (
            <Link
              href="/events/new"
              className="mt-4 inline-block text-blue-600 hover:text-blue-500"
            >
              Create your first event
            </Link>
          )}
          {events.length > 0 && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('all'); }}
              className="mt-4 text-blue-600 hover:text-blue-500"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {filteredEvents.map((event) => (
              <Link key={event.id} href={isAdmin ? `/events/${event.id}` : `/events/${event.id}/chef-view`} className="block">
                <div className="bg-white shadow rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{event.display_name}</h3>
                      <p className="text-sm text-gray-500">{event.client_name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {event.start_time && ` at ${event.start_time}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[event.status] || 'bg-gray-100 text-gray-800'}`}>
                        {event.status}
                      </span>
                      {isAdmin && event.client_pay && (
                        <span className="text-sm font-medium text-gray-900">
                          ${Number(event.client_pay).toLocaleString()}
                        </span>
                      )}
                      {!isAdmin && event.chef_pay && (
                        <span className="text-sm font-medium text-green-600">
                          ${Number(event.chef_pay).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden sm:block bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {isAdmin ? (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                  ) : (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Your Pay
                    </th>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{event.display_name}</div>
                      {event.chef_name && (
                        <div className="text-sm text-gray-500">Chef: {event.chef_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{event.client_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.start_time} - {event.end_time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[event.status] || 'bg-gray-100 text-gray-800'}`}>
                        {event.status}
                      </span>
                    </td>
                    {isAdmin ? (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.client_pay ? `$${Number(event.client_pay).toLocaleString()}` : '-'}
                      </td>
                    ) : (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {event.chef_pay ? `$${Number(event.chef_pay).toLocaleString()}` : '-'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={isAdmin ? `/events/${event.id}` : `/events/${event.id}/chef-view`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                      {isAdmin && (
                        <Link
                          href={`/events/${event.id}/edit`}
                          className="ml-4 text-gray-600 hover:text-gray-900"
                        >
                          Edit
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
```

## `frontend/src/app/(dashboard)/events/new/page.tsx`

```tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Client, Chef } from '@/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SearchableSelect, SearchableSelectOption } from '@/components/SearchableSelect';
import { AddClientModal } from '@/components/AddClientModal';

// Time picker options
const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const minutes = ['00', '15', '30', '45'];
const periods = ['AM', 'PM'];

// Convert 12-hour to 24-hour format for API
function to24Hour(hour: string, minute: string, period: string): string {
  let h = parseInt(hour);
  if (period === 'AM') {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return `${h.toString().padStart(2, '0')}:${minute}`;
}

export default function NewEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  const [form, setForm] = useState({
    client: '',
    chef: '',
    display_name: '',
    date: searchParams.get('date') || '',
    startHour: '',
    startMinute: '00',
    startPeriod: 'PM',
    endHour: '',
    endMinute: '00',
    endPeriod: 'PM',
    location: '',
    guest_count: '',
    client_pay: '',
    chef_pay: '',
    deposit_amount: '',
    deposit_received: false,
    payment_received: false,
    status: 'upcoming',
    allergies: '',
    menu_notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, chefsData] = await Promise.all([
          api.getClients(),
          api.getChefs(),
        ]);
        setClients(clientsData);
        setChefs(chefsData.filter(c => c.is_active));
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const clientOptions: SearchableSelectOption[] = useMemo(() => {
    return clients.map((client) => ({
      value: client.id.toString(),
      label: client.name,
      sublabel: client.email || undefined,
    }));
  }, [clients]);

  const handleClientCreated = (newClient: Client) => {
    setClients((prev) => [...prev, newClient]);
    setForm((prev) => ({ ...prev, client: newClient.id.toString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const start_time = form.startHour ? to24Hour(form.startHour, form.startMinute, form.startPeriod) : '';
      const end_time = form.endHour ? to24Hour(form.endHour, form.endMinute, form.endPeriod) : '';

      await api.createEvent({
        client: Number(form.client),
        chef: form.chef ? Number(form.chef) : undefined,
        display_name: form.display_name,
        date: form.date,
        start_time,
        end_time: end_time || undefined,
        location: form.location,
        guest_count: form.guest_count ? Number(form.guest_count) : undefined,
        client_pay: form.client_pay ? form.client_pay : undefined,
        chef_pay: form.chef_pay ? form.chef_pay : undefined,
        deposit_amount: form.deposit_amount ? form.deposit_amount : undefined,
        deposit_received: form.deposit_received,
        payment_received: form.payment_received,
        status: form.status as 'upcoming' | 'completed' | 'cancelled',
        allergies: form.allergies,
        menu_notes: form.menu_notes,
      });
      router.push('/events');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/events"
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            &larr; Back to Events
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">New Event</h1>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                id="display_name"
                required
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Birthday Dinner, Corporate Event, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="client" className="block text-sm font-medium text-gray-700">
                    Client *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddClientModal(true)}
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                  >
                    + Add New
                  </button>
                </div>
                <SearchableSelect
                  id="client"
                  required
                  options={clientOptions}
                  value={form.client}
                  onChange={(value) => setForm({ ...form, client: value })}
                  placeholder="Select a client"
                  emptyMessage="No clients yet"
                />
              </div>

              <div>
                <label htmlFor="chef" className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Chef
                </label>
                <select
                  id="chef"
                  value={form.chef}
                  onChange={(e) => setForm({ ...form, chef: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Unassigned</option>
                  {chefs.map((chef) => (
                    <option key={chef.id} value={chef.id}>
                      {chef.first_name} {chef.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                id="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <div className="flex gap-1">
                  <select
                    required
                    value={form.startHour}
                    onChange={(e) => setForm({ ...form, startHour: e.target.value })}
                    className="flex-1 min-w-0 px-1 sm:px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">--</option>
                    {hours.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <select
                    value={form.startMinute}
                    onChange={(e) => setForm({ ...form, startMinute: e.target.value })}
                    className="flex-1 min-w-0 px-1 sm:px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {minutes.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={form.startPeriod}
                    onChange={(e) => setForm({ ...form, startPeriod: e.target.value })}
                    className="flex-1 min-w-0 px-1 sm:px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {periods.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <div className="flex gap-1">
                  <select
                    value={form.endHour}
                    onChange={(e) => setForm({ ...form, endHour: e.target.value })}
                    className="flex-1 min-w-0 px-1 sm:px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">--</option>
                    {hours.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <select
                    value={form.endMinute}
                    onChange={(e) => setForm({ ...form, endMinute: e.target.value })}
                    className="flex-1 min-w-0 px-1 sm:px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {minutes.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={form.endPeriod}
                    onChange={(e) => setForm({ ...form, endPeriod: e.target.value })}
                    className="flex-1 min-w-0 px-1 sm:px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {periods.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Main St, City, State 12345"
              />
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              <div>
                <label htmlFor="guest_count" className="block text-sm font-medium text-gray-700 mb-1">
                  Guests
                </label>
                <input
                  type="number"
                  id="guest_count"
                  min="1"
                  value={form.guest_count}
                  onChange={(e) => setForm({ ...form, guest_count: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="10"
                />
              </div>

              <div>
                <label htmlFor="client_pay" className="block text-sm font-medium text-gray-700 mb-1">
                  Client $
                </label>
                <input
                  type="number"
                  id="client_pay"
                  min="0"
                  step="0.01"
                  value={form.client_pay}
                  onChange={(e) => setForm({ ...form, client_pay: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="500"
                />
              </div>

              <div>
                <label htmlFor="chef_pay" className="block text-sm font-medium text-gray-700 mb-1">
                  Chef $
                </label>
                <input
                  type="number"
                  id="chef_pay"
                  min="0"
                  step="0.01"
                  value={form.chef_pay}
                  onChange={(e) => setForm({ ...form, chef_pay: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="200"
                />
              </div>

              <div>
                <label htmlFor="deposit_amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Deposit $
                </label>
                <input
                  type="number"
                  id="deposit_amount"
                  min="0"
                  step="0.01"
                  value={form.deposit_amount}
                  onChange={(e) => setForm({ ...form, deposit_amount: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {form.deposit_amount && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="deposit_received"
                    checked={form.deposit_received}
                    onChange={(e) => setForm({ ...form, deposit_received: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="deposit_received" className="ml-2 text-sm text-gray-700">
                    Deposit received
                  </label>
                </div>
              )}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="payment_received"
                  checked={form.payment_received}
                  onChange={(e) => setForm({ ...form, payment_received: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="payment_received" className="ml-2 text-sm text-gray-700">
                  Paid in full
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                Allergies / Dietary Restrictions
              </label>
              <input
                type="text"
                id="allergies"
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Nut allergy, Gluten-free, Vegetarian..."
              />
            </div>

            <div>
              <label htmlFor="menu_notes" className="block text-sm font-medium text-gray-700 mb-1">
                Menu / Notes
              </label>
              <textarea
                id="menu_notes"
                rows={3}
                value={form.menu_notes}
                onChange={(e) => setForm({ ...form, menu_notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Menu details, special requests..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link
                href="/events"
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || clients.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>

        <AddClientModal
          isOpen={showAddClientModal}
          onClose={() => setShowAddClientModal(false)}
          onClientCreated={handleClientCreated}
        />
      </div>
    </ProtectedRoute>
  );
}
```

## `frontend/src/app/(dashboard)/events/[id]/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPhoneNumber } from '@/lib/utils';
import { Event } from '@/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function formatTime(time: string | null): string {
  if (!time) return '-';
  const [h, m] = time.split(':');
  let hour = parseInt(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${m} ${period}`;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const eventId = Number(params.id);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await api.getEvent(eventId);
        setEvent(data);
      } catch (err) {
        setError('Failed to load event');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await api.deleteEvent(eventId);
      router.push('/events');
    } catch (err) {
      console.error(err);
      alert('Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !event) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error || 'Event not found'}
        </div>
      </ProtectedRoute>
    );
  }

  const statusColors: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/events"
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            &larr; Back to Events
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{event.display_name}</h1>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[event.status]}`}>
                {event.status}
              </span>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/events/${eventId}/edit`}
                className="px-3 sm:px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 sm:px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Date & Time */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="mt-1 text-gray-900 font-medium">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Start Time</h3>
                <p className="mt-1 text-gray-900">{formatTime(event.start_time)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">End Time</h3>
                <p className="mt-1 text-gray-900">{formatTime(event.end_time)}</p>
              </div>
            </div>

            {/* Client Info */}
            <div className="border-t pt-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Client</h3>
                  <p className="mt-1">
                    <Link href={`/clients/${event.client}`} className="text-blue-600 hover:text-blue-500">
                      {event.client_name}
                    </Link>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-gray-900">
                    {event.client_email ? (
                      <a href={`mailto:${event.client_email}`} className="text-blue-600 hover:text-blue-500">
                        {event.client_email}
                      </a>
                    ) : '-'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                  <p className="mt-1 text-gray-900">
                    {event.client_phone ? (
                      <a href={`tel:${event.client_phone}`} className="text-blue-600 hover:text-blue-500">
                        {formatPhoneNumber(event.client_phone)}
                      </a>
                    ) : '-'}
                  </p>
                </div>
              </div>
              {event.client_allergies && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500">Client Allergies</h3>
                  <p className="mt-1 text-red-600">{event.client_allergies}</p>
                </div>
              )}
            </div>

            {/* Chef & Event Details */}
            <div className="border-t pt-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Assigned Chef</h3>
                  <p className="mt-1 text-gray-900">
                    {event.chef_name ? (
                      <span className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: event.chef_color }}
                        />
                        {event.chef_name}
                      </span>
                    ) : (
                      <span className="text-gray-500">Unassigned</span>
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location</h3>
                  <p className="mt-1 text-gray-900">{event.location || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Guest Count</h3>
                  <p className="mt-1 text-gray-900">{event.guest_count || '-'}</p>
                </div>
              </div>
            </div>

            {/* Financial */}
            <div className="border-t pt-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Financial</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Client Pays</h3>
                  <p className="mt-1 text-gray-900 font-semibold text-lg">
                    ${Number(event.client_pay).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Chef Pay</h3>
                  <p className="mt-1 text-gray-900">
                    {event.chef_pay ? `$${Number(event.chef_pay).toLocaleString()}` : '-'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Profit</h3>
                  <p className="mt-1 text-green-600 font-semibold">
                    {event.profit ? `$${Number(event.profit).toLocaleString()}` : '-'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Deposit</h3>
                  <p className="mt-1 text-gray-900">
                    {event.deposit_amount ? (
                      <span className={event.deposit_received ? 'text-green-600' : ''}>
                        ${Number(event.deposit_amount).toLocaleString()}
                        {event.deposit_received ? ' (Received)' : ' (Pending)'}
                      </span>
                    ) : '-'}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
                <p className="mt-1">
                  {event.payment_received ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Paid in Full
                    </span>
                  ) : event.deposit_received ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Deposit Received
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Unpaid
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Notes */}
            {(event.menu_notes || event.allergies) && (
              <div className="border-t pt-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                {event.allergies && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Event Allergies</h3>
                    <p className="mt-1 text-red-600">{event.allergies}</p>
                  </div>
                )}
                {event.menu_notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Menu Notes</h3>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{event.menu_notes}</p>
                  </div>
                )}
              </div>
            )}

            {event.internal_notes && (
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium text-gray-500">Internal Notes</h3>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{event.internal_notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

## `frontend/src/app/(dashboard)/events/[id]/edit/page.tsx`

```tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Client, Chef, Event } from '@/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SearchableSelect, SearchableSelectOption } from '@/components/SearchableSelect';

// Time picker options
const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const minutes = ['00', '15', '30', '45'];
const periods = ['AM', 'PM'];

// Convert 12-hour to 24-hour format for API
function to24Hour(hour: string, minute: string, period: string): string {
  let h = parseInt(hour);
  if (period === 'AM') {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return `${h.toString().padStart(2, '0')}:${minute}`;
}

// Convert 24-hour to 12-hour parts
function from24Hour(time: string | null): { hour: string; minute: string; period: string } {
  if (!time) return { hour: '', minute: '00', period: 'PM' };
  const [h, m] = time.split(':');
  let hour = parseInt(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  // Round minute to nearest 15
  const mins = parseInt(m);
  const roundedMin = Math.round(mins / 15) * 15;
  const minute = roundedMin === 60 ? '00' : roundedMin.toString().padStart(2, '0');
  return { hour: hour.toString(), minute, period };
}

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [chefs, setChefs] = useState<Chef[]>([]);

  const [form, setForm] = useState({
    client: '',
    chef: '',
    display_name: '',
    date: '',
    startHour: '',
    startMinute: '00',
    startPeriod: 'PM',
    endHour: '',
    endMinute: '00',
    endPeriod: 'PM',
    location: '',
    guest_count: '',
    client_pay: '',
    chef_pay: '',
    deposit_amount: '',
    deposit_received: false,
    payment_received: false,
    status: 'upcoming',
    allergies: '',
    menu_notes: '',
  });

  const eventId = Number(params.id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventData, clientsData, chefsData] = await Promise.all([
          api.getEvent(eventId),
          api.getClients(),
          api.getChefs(),
        ]);

        const startTime = from24Hour(eventData.start_time);
        const endTime = from24Hour(eventData.end_time);

        setForm({
          client: eventData.client.toString(),
          chef: eventData.chef?.toString() || '',
          display_name: eventData.name || '',
          date: eventData.date,
          startHour: startTime.hour,
          startMinute: startTime.minute,
          startPeriod: startTime.period,
          endHour: endTime.hour,
          endMinute: endTime.minute,
          endPeriod: endTime.period,
          location: eventData.location || '',
          guest_count: eventData.guest_count?.toString() || '',
          client_pay: eventData.client_pay || '',
          chef_pay: eventData.chef_pay || '',
          deposit_amount: eventData.deposit_amount || '',
          deposit_received: eventData.deposit_received || false,
          payment_received: eventData.payment_received || false,
          status: eventData.status,
          allergies: eventData.allergies || '',
          menu_notes: eventData.menu_notes || '',
        });

        setClients(clientsData);
        setChefs(chefsData.filter((c: Chef) => c.is_active));
      } catch (err) {
        setError('Failed to load event');
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    if (eventId) {
      fetchData();
    }
  }, [eventId]);

  const clientOptions: SearchableSelectOption[] = useMemo(() => {
    return clients.map((client) => ({
      value: client.id.toString(),
      label: client.name,
      sublabel: client.email || undefined,
    }));
  }, [clients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const start_time = form.startHour ? to24Hour(form.startHour, form.startMinute, form.startPeriod) : '';
      const end_time = form.endHour ? to24Hour(form.endHour, form.endMinute, form.endPeriod) : '';

      await api.updateEvent(eventId, {
        client: Number(form.client),
        chef: form.chef ? Number(form.chef) : null,
        name: form.display_name,
        date: form.date,
        start_time,
        end_time: end_time || null,
        location: form.location,
        guest_count: form.guest_count ? Number(form.guest_count) : undefined,
        client_pay: form.client_pay ? form.client_pay : undefined,
        chef_pay: form.chef_pay ? form.chef_pay : null,
        deposit_amount: form.deposit_amount ? form.deposit_amount : null,
        deposit_received: form.deposit_received,
        payment_received: form.payment_received,
        status: form.status as 'upcoming' | 'completed' | 'cancelled',
        allergies: form.allergies,
        menu_notes: form.menu_notes,
      });
      router.push(`/events/${eventId}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/events/${eventId}`}
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            &larr; Back to Event
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Edit Event</h1>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                id="display_name"
                required
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Birthday Dinner, Corporate Event, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">
                  Client *
                </label>
                <SearchableSelect
                  id="client"
                  required
                  options={clientOptions}
                  value={form.client}
                  onChange={(value) => setForm({ ...form, client: value })}
                  placeholder="Select a client"
                  emptyMessage="No clients available"
                />
              </div>

              <div>
                <label htmlFor="chef" className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Chef
                </label>
                <select
                  id="chef"
                  value={form.chef}
                  onChange={(e) => setForm({ ...form, chef: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Unassigned</option>
                  {chefs.map((chef) => (
                    <option key={chef.id} value={chef.id}>
                      {chef.first_name} {chef.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                id="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <div className="flex gap-1">
                  <select
                    required
                    value={form.startHour}
                    onChange={(e) => setForm({ ...form, startHour: e.target.value })}
                    className="flex-1 min-w-0 px-1 sm:px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">--</option>
                    {hours.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <select
                    value={form.startMinute}
                    onChange={(e) => setForm({ ...form, startMinute: e.target.value })}
                    className="flex-1 min-w-0 px-1 sm:px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {minutes.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={form.startPeriod}
                    onChange={(e) => setForm({ ...form, startPeriod: e.target.value })}
                    className="flex-1 min-w-0 px-1 sm:px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {periods.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <div className="flex gap-1">
                  <select
                    value={form.endHour}
                    onChange={(e) => setForm({ ...form, endHour: e.target.value })}
                    className="flex-1 min-w-0 px-1 sm:px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">--</option>
                    {hours.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <select
                    value={form.endMinute}
                    onChange={(e) => setForm({ ...form, endMinute: e.target.value })}
                    className="flex-1 min-w-0 px-1 sm:px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {minutes.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={form.endPeriod}
                    onChange={(e) => setForm({ ...form, endPeriod: e.target.value })}
                    className="flex-1 min-w-0 px-1 sm:px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {periods.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Main St, City, State 12345"
              />
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              <div>
                <label htmlFor="guest_count" className="block text-sm font-medium text-gray-700 mb-1">
                  Guests
                </label>
                <input
                  type="number"
                  id="guest_count"
                  min="1"
                  value={form.guest_count}
                  onChange={(e) => setForm({ ...form, guest_count: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="10"
                />
              </div>

              <div>
                <label htmlFor="client_pay" className="block text-sm font-medium text-gray-700 mb-1">
                  Client $
                </label>
                <input
                  type="number"
                  id="client_pay"
                  min="0"
                  step="0.01"
                  value={form.client_pay}
                  onChange={(e) => setForm({ ...form, client_pay: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="500"
                />
              </div>

              <div>
                <label htmlFor="chef_pay" className="block text-sm font-medium text-gray-700 mb-1">
                  Chef $
                </label>
                <input
                  type="number"
                  id="chef_pay"
                  min="0"
                  step="0.01"
                  value={form.chef_pay}
                  onChange={(e) => setForm({ ...form, chef_pay: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="200"
                />
              </div>

              <div>
                <label htmlFor="deposit_amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Deposit $
                </label>
                <input
                  type="number"
                  id="deposit_amount"
                  min="0"
                  step="0.01"
                  value={form.deposit_amount}
                  onChange={(e) => setForm({ ...form, deposit_amount: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {form.deposit_amount && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="deposit_received"
                    checked={form.deposit_received}
                    onChange={(e) => setForm({ ...form, deposit_received: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="deposit_received" className="ml-2 text-sm text-gray-700">
                    Deposit received
                  </label>
                </div>
              )}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="payment_received"
                  checked={form.payment_received}
                  onChange={(e) => setForm({ ...form, payment_received: e.target.checked })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="payment_received" className="ml-2 text-sm text-gray-700">
                  Paid in full
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                Allergies / Dietary Restrictions
              </label>
              <input
                type="text"
                id="allergies"
                value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Nut allergy, Gluten-free, Vegetarian..."
              />
            </div>

            <div>
              <label htmlFor="menu_notes" className="block text-sm font-medium text-gray-700 mb-1">
                Menu / Notes
              </label>
              <textarea
                id="menu_notes"
                rows={3}
                value={form.menu_notes}
                onChange={(e) => setForm({ ...form, menu_notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Menu details, special requests..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link
                href={`/events/${eventId}`}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

## `frontend/src/app/(dashboard)/events/[id]/chef-view/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPhoneNumber } from '@/lib/utils';
import { Event } from '@/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function formatTime(time: string | null): string {
  if (!time) return '-';
  const [h, m] = time.split(':');
  let hour = parseInt(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${m} ${period}`;
}

export default function ChefEventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [chefNotes, setChefNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const eventId = Number(params.id);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await api.getEvent(eventId);
        setEvent(data);
        setChefNotes(data.chef_notes || '');
      } catch (err) {
        setError('Failed to load event');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleSaveNotes = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateEvent(eventId, { chef_notes: chefNotes });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !event) {
    return (
      <ProtectedRoute>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error || 'Event not found'}
        </div>
      </ProtectedRoute>
    );
  }

  const statusColors: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/events"
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            &larr; Back to My Events
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{event.display_name}</h1>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[event.status]}`}>
                {event.status}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Date, Time & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Time</h3>
                <p className="mt-1 text-lg font-medium text-gray-900">
                  {formatTime(event.start_time)}
                  {event.end_time && ` - ${formatTime(event.end_time)}`}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Location</h3>
              <p className="mt-1 text-gray-900">{event.location || 'Not specified'}</p>
              {event.location && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1 text-sm text-blue-600 hover:text-blue-500"
                >
                  Open in Maps &rarr;
                </a>
              )}
            </div>

            {/* Client Info */}
            <div className="border-t pt-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Client</h3>
                  <p className="mt-1 text-gray-900">{event.client_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-gray-900">
                    {event.client_email ? (
                      <a href={`mailto:${event.client_email}`} className="text-blue-600 hover:text-blue-500">
                        {event.client_email}
                      </a>
                    ) : '-'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                  <p className="mt-1 text-gray-900">
                    {event.client_phone ? (
                      <a href={`tel:${event.client_phone}`} className="text-blue-600 hover:text-blue-500">
                        {formatPhoneNumber(event.client_phone)}
                      </a>
                    ) : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="border-t pt-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Guest Count</h3>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{event.guest_count}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Your Pay</h3>
                  <p className="mt-1 text-2xl font-semibold text-green-600">
                    {event.chef_pay ? `$${Number(event.chef_pay).toLocaleString()}` : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Allergies */}
            {(event.allergies || event.client_allergies) && (
              <div className="border-t pt-6">
                <h2 className="text-base sm:text-lg font-semibold text-red-600 mb-4">Allergies & Dietary Restrictions</h2>
                {event.client_allergies && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <h3 className="text-sm font-medium text-red-800">Client Allergies</h3>
                    <p className="mt-1 text-red-700">{event.client_allergies}</p>
                  </div>
                )}
                {event.allergies && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <h3 className="text-sm font-medium text-red-800">Event-Specific Allergies</h3>
                    <p className="mt-1 text-red-700">{event.allergies}</p>
                  </div>
                )}
              </div>
            )}

            {/* Menu Notes */}
            {event.menu_notes && (
              <div className="border-t pt-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Menu Notes</h2>
                <p className="text-gray-900 whitespace-pre-wrap">{event.menu_notes}</p>
              </div>
            )}

            {/* Chef Notes - Editable */}
            <div className="border-t pt-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">My Notes</h2>
              <p className="text-sm text-gray-500 mb-2">
                Add your personal notes for this event (shopping lists, prep notes, etc.)
              </p>
              <textarea
                value={chefNotes}
                onChange={(e) => setChefNotes(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add your notes here..."
              />
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={handleSaveNotes}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Notes'}
                </button>
                {saveSuccess && (
                  <span className="text-green-600 text-sm">Notes saved!</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

## `frontend/src/components/Sidebar.tsx`

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const adminNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Events', href: '/events', icon: CalendarIcon },
  { name: 'Clients', href: '/clients', icon: UsersIcon },
  { name: 'Chefs', href: '/chefs', icon: ChefHatIcon },
  { name: 'Calendar', href: '/calendar', icon: CalendarDaysIcon },
  { name: 'Finances', href: '/finances', icon: DollarIcon },
];

const chefNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'My Events', href: '/events', icon: CalendarIcon },
  { name: 'Calendar', href: '/calendar', icon: CalendarDaysIcon },
];

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function CalendarDaysIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function ChefHatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = isAdmin ? adminNavItems : chefNavItems;

  const handleNavClick = () => {
    setIsOpen(false);
  };

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
        <h1 className="text-xl font-bold text-white">Chef Bawss</h1>
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-1 text-gray-400 hover:text-white"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleNavClick}
              className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-400 truncate capitalize">
              {user?.role}
            </p>
          </div>
          <button
            onClick={logout}
            className="ml-2 p-1 text-gray-400 hover:text-white"
            title="Logout"
          >
            <LogoutIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 h-14 flex items-center justify-between px-4">
        <h1 className="text-lg font-bold text-white">Chef Bawss</h1>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-400 hover:text-white"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {sidebarContent}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full w-64 flex-col bg-gray-900">
        {sidebarContent}
      </div>
    </>
  );
}
```

## `frontend/src/components/ProtectedRoute.tsx`

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && requireAdmin && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, loading, requireAdmin, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
```

## `frontend/src/components/AddClientModal.tsx`

```tsx
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { formatPhoneNumber } from '@/lib/utils';
import { Client } from '@/types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: (client: Client) => void;
}

export function AddClientModal({ isOpen, onClose, onClientCreated }: AddClientModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newClient = await api.createClient(form);
      resetForm();
      onClientCreated(newClient);
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create client';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Add New Client</h2>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="modal-name" className="block text-sm font-medium text-gray-700 mb-1">
                Client Name *
              </label>
              <input
                type="text"
                id="modal-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Smith"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="modal-email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="client@example.com"
                />
              </div>

              <div>
                <label htmlFor="modal-phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  id="modal-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: formatPhoneNumber(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label htmlFor="modal-address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                id="modal-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Main St, City, State 12345"
              />
            </div>

            <div>
              <label htmlFor="modal-notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="modal-notes"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Dietary restrictions, preferences, special instructions..."
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Client'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

## `frontend/src/components/SearchableSelect.tsx`

```tsx
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';

export interface SearchableSelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
  emptyMessage?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  required = false,
  id,
  emptyMessage = 'No options available',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const searchLower = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(searchLower) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(searchLower))
    );
  }, [options, search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
    } else if (e.key === 'Enter' && filteredOptions.length === 1) {
      e.preventDefault();
      handleSelect(filteredOptions[0].value);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          required
          value={value}
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      {/* Display button */}
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-left focus:outline-none focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type to search..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Options list */}
          <ul className="max-h-60 overflow-auto py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500">
                {options.length === 0 ? emptyMessage : 'No matches found'}
              </li>
            ) : (
              filteredOptions.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
                      option.value === value ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    {option.sublabel && (
                      <div className="text-xs text-gray-500">{option.sublabel}</div>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
```

## `frontend/src/lib/api.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8007';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_URL}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return false;
      }

      const data = await response.json();
      this.setTokens(data.access, data.refresh || this.refreshToken);
      return true;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (!skipAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // If unauthorized, try refreshing token
    if (response.status === 401 && !skipAuth && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        response = await fetch(`${API_URL}${endpoint}`, {
          ...fetchOptions,
          headers,
        });
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      // Handle DRF validation errors (field-based) or detail messages
      let message = 'Request failed';
      if (error.detail) {
        message = error.detail;
      } else if (typeof error === 'object') {
        // Extract first validation error
        const firstKey = Object.keys(error)[0];
        if (firstKey && Array.isArray(error[firstKey])) {
          message = `${firstKey}: ${error[firstKey][0]}`;
        }
      }
      throw new ApiError(response.status, message, error);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const data = await this.request<{ access: string; refresh: string }>(
      '/api/auth/login/',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true,
      }
    );
    this.setTokens(data.access, data.refresh);
    return data;
  }

  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    business_name: string;
  }) {
    const response = await this.request<{
      user: import('@/types').User;
      tokens: { access: string; refresh: string };
    }>('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });
    this.setTokens(response.tokens.access, response.tokens.refresh);
    return response;
  }

  async logout() {
    try {
      await this.request('/api/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh: this.refreshToken }),
      });
    } finally {
      this.clearTokens();
    }
  }

  async getMe() {
    return this.request<import('@/types').User>('/api/auth/me/');
  }

  async getInviteInfo(token: string) {
    return this.request<{
      email: string;
      first_name: string;
      last_name: string;
      organization_name: string;
    }>(`/api/auth/invite-info/?token=${encodeURIComponent(token)}`, {
      skipAuth: true,
    });
  }

  async acceptInvite(token: string, password: string) {
    const response = await this.request<{
      detail: string;
      user: import('@/types').User;
      tokens: { access: string; refresh: string };
    }>('/api/auth/accept-invite/', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
      skipAuth: true,
    });
    this.setTokens(response.tokens.access, response.tokens.refresh);
    return response;
  }

  async requestPasswordReset(email: string) {
    return this.request<{ detail: string }>('/api/auth/password-reset/', {
      method: 'POST',
      body: JSON.stringify({ email }),
      skipAuth: true,
    });
  }

  async confirmPasswordReset(token: string, password: string) {
    const response = await this.request<{
      detail: string;
      user: import('@/types').User;
      tokens: { access: string; refresh: string };
    }>('/api/auth/password-reset/confirm/', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
      skipAuth: true,
    });
    this.setTokens(response.tokens.access, response.tokens.refresh);
    return response;
  }

  // Clients
  async getClients() {
    return this.request<import('@/types').Client[]>('/api/clients/');
  }

  async getClient(id: number) {
    return this.request<import('@/types').Client>(`/api/clients/${id}/`);
  }

  async createClient(data: Partial<import('@/types').Client>) {
    return this.request<import('@/types').Client>('/api/clients/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(id: number, data: Partial<import('@/types').Client>) {
    return this.request<import('@/types').Client>(`/api/clients/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id: number) {
    return this.request(`/api/clients/${id}/`, { method: 'DELETE' });
  }

  // Chefs
  async getChefs() {
    return this.request<import('@/types').Chef[]>('/api/chefs/');
  }

  async getChef(id: number) {
    return this.request<import('@/types').Chef>(`/api/chefs/${id}/`);
  }

  async inviteChef(data: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    default_pay_rate?: number;
    notes?: string;
  }) {
    return this.request<import('@/types').Chef>('/api/chefs/invite/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateChef(id: number, data: Partial<import('@/types').Chef>) {
    return this.request<import('@/types').Chef>(`/api/chefs/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deactivateChef(id: number) {
    return this.request(`/api/chefs/${id}/deactivate/`, { method: 'POST' });
  }

  async activateChef(id: number) {
    return this.request(`/api/chefs/${id}/activate/`, { method: 'POST' });
  }

  async resendChefInvite(id: number) {
    return this.request<{ detail: string }>(`/api/chefs/${id}/resend-invite/`, { method: 'POST' });
  }

  // Events
  async getEvents(params?: { status?: string; chef_id?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.chef_id) searchParams.set('chef_id', String(params.chef_id));
    const query = searchParams.toString();
    return this.request<import('@/types').Event[]>(`/api/events/${query ? `?${query}` : ''}`);
  }

  async getEvent(id: number) {
    return this.request<import('@/types').Event>(`/api/events/${id}/`);
  }

  async createEvent(data: Partial<import('@/types').Event>) {
    return this.request<import('@/types').Event>('/api/events/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(id: number, data: Partial<import('@/types').Event>) {
    return this.request<import('@/types').Event>(`/api/events/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(id: number) {
    return this.request(`/api/events/${id}/`, { method: 'DELETE' });
  }

  async completeEvent(id: number) {
    return this.request(`/api/events/${id}/complete/`, { method: 'POST' });
  }

  async cancelEvent(id: number) {
    return this.request(`/api/events/${id}/cancel/`, { method: 'POST' });
  }

  async getCalendarEvents(start: string, end: string, chefId?: number) {
    const params = new URLSearchParams({ start, end });
    if (chefId) params.set('chef_id', String(chefId));
    return this.request<import('@/types').CalendarEvent[]>(`/api/events/calendar/?${params}`);
  }

  // Dashboard
  async getDashboard() {
    return this.request<import('@/types').AdminDashboard | import('@/types').ChefDashboard>(
      '/api/dashboard/'
    );
  }

  // Finances
  async getFinances(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const query = params.toString();
    return this.request<import('@/types').FinancesSummary>(`/api/finances/${query ? `?${query}` : ''}`);
  }

  async getFinancesByChef(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const query = params.toString();
    return this.request<import('@/types').FinancesByChef>(`/api/finances/by-chef/${query ? `?${query}` : ''}`);
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = new ApiClient();
```

## `frontend/src/lib/utils.ts`

```typescript
/**
 * Formats a phone number as (XXX) XXX-XXXX
 * Handles partial input for live formatting
 */
export function formatPhoneNumber(value: string): string {
  // Strip all non-digits
  const digits = value.replace(/\D/g, '');

  // Limit to 10 digits
  const limited = digits.slice(0, 10);

  // Format based on length
  if (limited.length === 0) {
    return '';
  } else if (limited.length <= 3) {
    return `(${limited}`;
  } else if (limited.length <= 6) {
    return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  } else {
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
  }
}

/**
 * Strips formatting from phone number, returns just digits
 */
export function stripPhoneNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}
```

## `frontend/src/contexts/AuthContext.tsx`

```tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    business_name: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isChef: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = api.getAccessToken();
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch {
          // Token invalid, clear it
          api.clearTokens();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    await api.login(email, password);
    const userData = await api.getMe();
    setUser(userData);
  };

  const register = async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    business_name: string;
  }) => {
    await api.register(data);
    // Fetch full user data including role and organization
    const userData = await api.getMe();
    setUser(userData);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'admin',
    isChef: user?.role === 'chef',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

## `frontend/src/types/index.ts`

```typescript
// User & Auth types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_email_verified: boolean;
  role: 'admin' | 'chef';
  organization_name: string;
  organization_id: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  business_name: string;
}

// Client types
export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  allergies: string;
  notes: string;
  event_count: number;
  total_revenue?: number;
  created_at: string;
  updated_at: string;
}

// Chef types
export interface Chef {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  address: string;
  default_pay_rate: string | null;
  calendar_color: string;
  notes: string;
  is_active: boolean;
  has_accepted_invite: boolean;
  event_count: number;
  created_at: string;
  updated_at: string;
}

// Event types
export interface Event {
  id: number;
  display_name: string;
  name: string;
  date: string;
  start_time: string;
  end_time: string | null;
  client: number;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_allergies?: string;
  chef: number | null;
  chef_name: string | null;
  chef_email?: string;
  chef_phone?: string;
  chef_color: string;
  location: string;
  guest_count: number;
  allergies: string;
  menu_notes: string;
  client_pay: string;
  chef_pay: string | null;
  profit?: string;
  deposit_amount: string | null;
  deposit_received: boolean;
  payment_received: boolean;
  internal_notes?: string;
  chef_notes: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Calendar event (FullCalendar format)
export interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string | null;
  color: string;
  extendedProps: {
    client_name: string;
    chef_name: string | null;
    guest_count: number;
    location: string;
    status: string;
  };
}

// Dashboard types
export interface AdminDashboard {
  stats: {
    revenue: string;
    paid_out: string;
    profit: string;
    event_count: number;
  };
  upcoming_events: DashboardEvent[];
  recent_completed: DashboardEvent[];
}

export interface ChefDashboard {
  earnings: {
    this_month: string;
    this_year: string;
  };
  upcoming_events: DashboardEvent[];
}

export interface DashboardEvent {
  id: number;
  display_name: string;
  date: string;
  start_time?: string;
  end_time?: string;
  client_name: string;
  chef_name?: string | null;
  chef_color?: string;
  location?: string;
  guest_count?: number;
  client_pay?: string;
  chef_pay?: string | null;
}

// Finances types
export interface FinancesSummary {
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    revenue: string;
    paid_out: string;
    profit: string;
    event_count: number;
  };
}

export interface FinancesByChef {
  period: {
    start_date: string;
    end_date: string;
  };
  by_chef: ChefFinance[];
}

export interface ChefFinance {
  chef_id: number;
  chef_name: string;
  chef_color: string;
  total_paid: string;
  event_count: number;
}
```

---

# Infrastructure

## `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: chefbawss
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5437:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6384:6379"

  backend:
    build: ./backend
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - ./backend:/app
    ports:
      - "8007:8000"
    depends_on:
      - db
      - redis
    env_file:
      - ./backend/.env

  celery:
    build: ./backend
    command: celery -A config worker -l info
    volumes:
      - ./backend:/app
    depends_on:
      - db
      - redis
    env_file:
      - ./backend/.env

volumes:
  postgres_data:
```

## `railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "backend/Dockerfile",
    "watchPatterns": ["backend/**"]
  },
  "deploy": {
    "startCommand": "gunicorn --bind 0.0.0.0:8000 config.wsgi:application"
  }
}
```

## `backend/Dockerfile`

```dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Collect static files for WhiteNoise
RUN python manage.py collectstatic --noinput --settings=config.settings.production || true

EXPOSE 8000

# start.sh is already copied with backend/ above
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
```

## `backend/Procfile`

```text
web: gunicorn --bind 0.0.0.0:8000 config.wsgi:application
worker: celery -A config worker -l info
```

## `backend/start.sh`

```bash
#!/bin/bash
set -e

echo "=== Starting Chef Bawss Backend ==="
echo "PORT: $PORT"
echo "DJANGO_SETTINGS_MODULE: $DJANGO_SETTINGS_MODULE"

echo "Running migrations..."
python manage.py migrate --noinput

echo "Starting gunicorn on port ${PORT:-8000}..."
exec gunicorn --bind 0.0.0.0:${PORT:-8000} --workers 2 --log-level info --access-logfile - --error-logfile - config.wsgi:application
```

## `backend/requirements.txt`

```text
Django==5.2.1
djangorestframework==3.16.0
djangorestframework-simplejwt==5.4.0
django-cors-headers==4.6.0
django-ses==4.3.0
celery[redis]==5.5.3
redis==5.2.1
psycopg[binary]==3.2.4
python-dotenv==1.0.1
gunicorn==23.0.0
whitenoise==6.8.2

# trigger
```

## `.gitignore`

```text
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
.env
.venv
env/
venv/
*.egg-info/
dist/
build/

# Django
*.log
local_settings.py
db.sqlite3
staticfiles/
media/

# Node
node_modules/
.next/
out/
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*

# IDE
.idea/
.vscode/
*.swp
*.swo
.DS_Store

# Docker
postgres_data/

# Environment
.env
*.env.local
```
