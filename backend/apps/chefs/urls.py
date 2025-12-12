from django.urls import path
from .views import (
    ChefListView, 
    ChefInviteView, 
    ChefDetailView, 
    ChefDeactivateView,
    ChefActivateView,
    ChefMeView
)

urlpatterns = [
    path('', ChefListView.as_view(), name='chef_list'),
    path('invite/', ChefInviteView.as_view(), name='chef_invite'),
    path('me/', ChefMeView.as_view(), name='chef_me'),
    path('<int:pk>/', ChefDetailView.as_view(), name='chef_detail'),
    path('<int:pk>/deactivate/', ChefDeactivateView.as_view(), name='chef_deactivate'),
    path('<int:pk>/activate/', ChefActivateView.as_view(), name='chef_activate'),
]
