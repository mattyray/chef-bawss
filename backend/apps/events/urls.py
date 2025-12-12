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
