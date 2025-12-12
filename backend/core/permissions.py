from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.membership:
            return False
        return request.membership.role == 'admin'


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.membership:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.membership.role == 'admin'


class IsChefOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.membership:
            return False
        return request.membership.role in ['admin', 'chef']
