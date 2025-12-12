from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from core.mixins import TenantQuerysetMixin
from core.permissions import IsAdmin, IsAdminOrReadOnly
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
