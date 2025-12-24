from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from core.mixins import TenantMixin
from core.throttling import AuthRateThrottle
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    MeSerializer,
    AcceptInviteSerializer,
    InviteInfoSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)
from core.email import send_password_reset_email

User = get_user_model()


class ThrottledTokenObtainPairView(TokenObtainPairView):
    """Login endpoint with auth throttling to prevent brute force."""
    throttle_classes = [AuthRateThrottle]


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class MeView(TenantMixin, generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MeSerializer
    
    def get_object(self):
        return self.request.user


class ChangePasswordView(TenantMixin, APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        
        return Response({'detail': 'Password updated successfully.'})


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Successfully logged out.'})
        except Exception:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class InviteInfoView(APIView):
    """Get info about an invitation token (for the accept-invite page)."""
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def get(self, request):
        token = request.query_params.get('token')
        if not token:
            return Response(
                {'detail': 'Token is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = InviteInfoSerializer(data={'token': token})
        if serializer.is_valid():
            return Response(serializer.get_info())
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AcceptInviteView(APIView):
    """Accept an invitation and set password."""
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = AcceptInviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens so they're logged in immediately
        refresh = RefreshToken.for_user(user)

        return Response({
            'detail': 'Account activated successfully.',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class PasswordResetRequestView(APIView):
    """Request a password reset email."""
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.save()

        # Send email if user exists (token will be None if user doesn't exist)
        if token:
            try:
                send_password_reset_email(token.user, token.token)
            except Exception:
                pass  # Don't reveal email sending errors

        # Always return success to not reveal if email exists
        return Response({
            'detail': 'If an account with that email exists, we have sent a password reset link.'
        })


class PasswordResetConfirmView(APIView):
    """Confirm password reset with token and new password."""
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens so they're logged in immediately
        refresh = RefreshToken.for_user(user)

        return Response({
            'detail': 'Password has been reset successfully.',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })