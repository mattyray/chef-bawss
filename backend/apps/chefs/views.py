from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from core.mixins import TenantMixin
from core.permissions import IsAdmin
from apps.organizations.models import OrganizationMembership
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
        return generics.get_object_or_404(queryset, membership__id=self.kwargs['pk'])
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ChefProfileUpdateSerializer
        return ChefProfileSerializer


class ChefDeactivateView(TenantMixin, APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def post(self, request, pk):
        try:
            membership = OrganizationMembership.objects.get(
                id=pk,
                organization=request.organization,
                role='chef'
            )
            membership.is_active = False
            membership.save()
            return Response({'detail': 'Chef deactivated successfully.'})
        except OrganizationMembership.DoesNotExist:
            return Response(
                {'detail': 'Chef not found.'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class ChefActivateView(TenantMixin, APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def post(self, request, pk):
        try:
            membership = OrganizationMembership.objects.get(
                id=pk,
                organization=request.organization,
                role='chef'
            )
            membership.is_active = True
            membership.save()
            return Response({'detail': 'Chef activated successfully.'})
        except OrganizationMembership.DoesNotExist:
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