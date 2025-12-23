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