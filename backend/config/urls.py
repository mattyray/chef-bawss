from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/organizations/', include('apps.organizations.urls')),
    path('api/clients/', include('apps.clients.urls')),
    path('api/chefs/', include('apps.chefs.urls')),
    path('api/events/', include('apps.events.urls')),
]
