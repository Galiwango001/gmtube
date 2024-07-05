import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import { formatBytes, formatDuration } from './utils';
import { instructionsText, instructionsSteps, featuresList, privacyText, termsText, legalText } from './texts';

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [videoDuration, setVideoDuration] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('video');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await axios.get('https://medimenz.pythonanywhere.com/api/serve_video_info/', {
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
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (itag, type) => {
    try {
      alert(`Downloading ${type === 'video' ? 'video' : 'audio'}: ${videoInfo.title}`);
  
      const response = await axios.get('https://medimenz.pythonanywhere.com/api/download_video/', {
        params: { url: videoUrl, itag, type },
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Download Progress: ${percentCompleted}%`);
        }
      });
  
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${videoInfo.title}.${type === 'video' ? 'mp4' : 'mp3'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      setError(error.response ? error.response.data.error : 'An error occurred during download');
    }
  };

  const renderQualitySection = () => {
    if (!videoInfo) return null;

    return (
      <div className="quality-section">
        {activeTab === 'video' && (
          <div className="video-quality box">
            <div className="stream-row stream-header">
              <div className="stream-column">Resolution</div>
              <div className="stream-column">File Size</div>
              <div className="stream-column">Download</div>
            </div>
            {videoInfo.video_streams.map((stream, index) => (
              <div key={index} className="stream-row">
                <div className="stream-column">{stream.resolution}</div>
                <div className="stream-column">{formatBytes(stream.filesize)}</div>
                <div className="stream-column">
                  <button onClick={() => handleDownload(stream.itag, 'video')} className="download-button">Download</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'audio' && (
          <div className="audio-quality box">
            <div className="stream-row stream-header">
              <div className="stream-column">Bitrate</div>
              <div className="stream-column">File Size</div>
              <div className="stream-column">Download</div>
            </div>
            {videoInfo.audio_streams.map((stream, index) => (
              <div key={index} className="stream-row">
                <div className="stream-column">{stream.abr}</div>
                <div className="stream-column">{formatBytes(stream.filesize)}</div>
                <div className="stream-column">
                  <button onClick={() => handleDownload(stream.itag, 'audio')} className="download-button">Download</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleLinkClick = (type, e) => {
    e.preventDefault();
    let alertText = '';
    switch (type) {
      case 'privacy':
        alertText = privacyText;
        break;
      case 'terms':
        alertText = termsText;
        break;
      case 'legal':
        alertText = legalText;
        break;
      default:
        break;
    }
    alert(alertText); // You can customize this handling as needed
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>YouTube Downloader</h1>
        <form onSubmit={handleSubmit} className="video-form">
          <input
            type="text"
            placeholder="Enter YouTube URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Get Video Info'}</button>
        </form>
        {error && <div className="error">{error}</div>}
        {videoInfo && (
          <div className="video-info">
            <h2>{videoInfo.title}</h2>
            <div className="info-row">
              <img src={videoInfo.thumbnail_url} alt="Video Thumbnail" />
              <div className="info-details">
                <p>Duration: {videoDuration}</p>
                <p>Available Streams: {videoInfo.video_streams.length + videoInfo.audio_streams.length}</p>
              </div>
            </div>
            <div className="tabs">
              <button className={activeTab === 'video' ? 'active' : ''} onClick={() => setActiveTab('video')}>Video</button>
              <button className={activeTab === 'audio' ? 'active' : ''} onClick={() => setActiveTab('audio')}>Audio</button>
            </div>
            {renderQualitySection()}
          </div>
        )}
        <div className="footer">
          <h3>Instructions</h3>
          <p>{instructionsText}</p>
          <ul>
            {instructionsSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
          <h3>Features</h3>
          <ul>
            {featuresList.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          <div className="legal-links">
            <a href="#" onClick={(e) => handleLinkClick('privacy', e)}>Privacy Policy</a>
            <a href="#" onClick={(e) => handleLinkClick('terms', e)}>Terms of Use</a>
            <a href="#" onClick={(e) => handleLinkClick('legal', e)}>Legal Disclaimer</a>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
