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
