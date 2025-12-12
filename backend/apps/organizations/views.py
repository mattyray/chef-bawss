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