from django.contrib import admin
from django.urls import path, include
from subjects.views import index

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('auth_form.urls')),
    path('subjects/', include('subjects.urls')),
    path('', index),
]
