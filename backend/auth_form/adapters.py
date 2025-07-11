from allauth.socialaccount.adapter import DefaultSocialAccountAdapter

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def populate_user(self, request, sociallogin, data):
        user = super().populate_user(request, sociallogin, data)

        first_name = data.get("first_name", "")
        last_name = data.get("last_name", "")
        user.first_name = first_name
        user.last_name = last_name
        user.full_name = f"{first_name} {last_name}".strip()
        return user