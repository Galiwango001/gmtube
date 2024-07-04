// utils.js
import axios from 'axios';

export const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  export const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  export const handleSearch = async (videoUrl, setVideoInfo, setVideoDuration, setError) => {
    setError(null);
    try {
      const response = await axios.get('http://192.168.76.89:8000/api/serve_video_info/', {
        params: { url: videoUrl }
      });
      if (response && response.data) {
        setVideoInfo(response.data);
        setVideoDuration(formatDuration(response.data.duration));
      } else {
        setError('No response data');
      }
    } catch (error) {
      setError(error.response ? error.response.data.error : 'An error occurred');
    }
  };
  


 

  export const downloadFile = async (url, type) => {
    try {
      const endpoint = type === 'video' ? 'download_video' : 'download_audio';
      const encodedUrl = encodeURIComponent(url); // Encode the URL
      const response = await axios.get(`http://192.168.76.89:8000/api/${endpoint}/`, {
        params: { url: encodedUrl },
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Downloading... ${percentCompleted}% completed`);
        }
      });
  
      if (response.data) {
        const blob = new Blob([response.data], { type: type === 'video' ? 'video/mp4' : 'audio/mp3' });
        const fileUrl = URL.createObjectURL(blob);
  
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = type === 'video' ? 'video.mp4' : 'audio.mp3';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(fileUrl);
      } else {
        console.error('No file data received');
      }
    } catch (error) {
      console.error('Error downloading file:', error.message);
    }
  };
  