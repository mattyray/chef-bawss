class TenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Initialize - will be populated after DRF auth
        request.organization = None
        request.membership = None
        return self.get_response(request)