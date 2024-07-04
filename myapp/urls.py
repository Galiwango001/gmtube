# urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('serve_video_info/', views.serve_video_info, name='serve_video_info'),
    path('download_video/', views.download_video, name='download_video'),
    path('download_audio/', views.download_video, name='download_audio'),
]
