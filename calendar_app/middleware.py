from django.shortcuts import redirect


class TwoFactorRequiredMiddleware:
    """Force every logged-in user to have a verified second factor.

    Runs after AuthenticationMiddleware + OTPMiddleware (so ``is_verified()``
    is available) and after LoginRequiredMiddleware (so anonymous users are
    already being redirected to login). A user who has authenticated with a
    password but not yet passed/enrolled 2FA is sent to the setup wizard; until
    they do, the only pages they can reach are the account/2FA pages, the admin
    (which enforces its own 2FA), and static assets.
    """

    # Path prefixes reachable without a verified second factor.
    ALLOWED_PREFIXES = ("/account/", "/admin/", "/static/")

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = getattr(request, "user", None)
        if (
            user is not None
            and user.is_authenticated
            and not user.is_verified()
            and not request.path.startswith(self.ALLOWED_PREFIXES)
        ):
            return redirect("two_factor:setup")
        return self.get_response(request)
