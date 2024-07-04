from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from pytube import YouTube
from urllib.parse import unquote
import logging
import urllib.parse
import requests
from rest_framework.decorators import api_view
import os
from django.conf import settings
logger = logging.getLogger(__name__)

def add_cors_headers(response):
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type"
    return response

@csrf_exempt
def serve_video_info(request):
    url = request.GET.get('url')
    try:
        yt = YouTube(url)
        
        video_streams = []
        audio_streams = []

        for stream in yt.streams.filter(file_extension='mp4'):
            if stream.video_codec and stream.resolution:
                video_streams.append({
                    'itag': stream.itag,
                    'resolution': stream.resolution,
                    'filesize': stream.filesize
                })
            elif stream.abr:
                audio_streams.append({
                    'itag': stream.itag,
                    'abr': stream.abr,
                    'filesize': stream.filesize
                })

        video_info = {
            'title': yt.title,
            'thumbnail_url': yt.thumbnail_url,
            'duration': yt.length,
            'video_streams': video_streams,
            'audio_streams': audio_streams,
        }

        return JsonResponse(video_info)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def download_video(request):
    url = request.GET.get('url')
    itag = request.GET.get('itag')
    type = request.GET.get('type')
    try:
        yt = YouTube(url)
        stream = yt.streams.get_by_itag(itag)
        if not stream:
            return JsonResponse({'error': 'Stream not found'}, status=400)

        file_path = stream.download()
        with open(file_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
        os.remove(file_path)
        return response
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)