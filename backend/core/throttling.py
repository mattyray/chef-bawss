from rest_framework.throttling import AnonRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """
    Throttle for authentication endpoints (login, register, password reset).
    More restrictive than general anon throttle to prevent brute force attacks.
    """
    scope = 'auth'
