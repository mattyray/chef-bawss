from rest_framework import generics, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from core.mixins import TenantQuerysetMixin, TenantMixin
from core.permissions import IsAdmin
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
        serializer.save(organization=self.request.organization)
    
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