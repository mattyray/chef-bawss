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