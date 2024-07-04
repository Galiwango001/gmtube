from django.db import models

class DownloadedVideo(models.Model):
    title = models.CharField(max_length=200)
    video_id = models.CharField(max_length=50)
    download_url = models.URLField()

    def __str__(self):
        return self.title
