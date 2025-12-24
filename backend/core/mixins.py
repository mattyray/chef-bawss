class TenantMixin:
    """
    Mixin that sets organization/membership after DRF authentication
    but before permission checks.
    """
    def initial(self, request, *args, **kwargs):
        # Standard DRF setup
        self.format_kwarg = self.get_format_suffix(**kwargs)
        neg = self.perform_content_negotiation(request)
        request.accepted_renderer, request.accepted_media_type = neg
        version, scheme = self.determine_version(request, *args, **kwargs)
        request.version, request.versioning_scheme = version, scheme

        # Authenticate first
        self.perform_authentication(request)

        # Always initialize tenant attributes
        request.organization = None
        request.membership = None

        # Set tenant AFTER auth, BEFORE permissions
        if request.user.is_authenticated:
            membership = request.user.memberships.filter(is_active=True).first()
            if membership:
                request.organization = membership.organization
                request.membership = membership

        # Now check permissions with tenant available
        self.check_permissions(request)
        self.check_throttles(request)


class TenantQuerysetMixin(TenantMixin):
    """
    Filters queryset by organization. Includes TenantMixin behavior.
    """
    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.organization:
            return qs.filter(organization=self.request.organization)
        return qs.none()
    



    









    