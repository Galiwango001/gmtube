import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Import the CSS file
import { formatBytes, formatDuration } from './utils';
import { instructionsText, instructionsSteps, featuresList, privacyText, termsText, legalText } from './texts'; // Import your text content

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
        responseType: 'blob', // Important for file download
        onDownloadProgress: (progressEvent) => {
          // Display download progress using browser's native download icon
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Download Progress: ${percentCompleted}%`);
        }
      });
  
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${videoInfo.title}.${type === 'video' ? 'mp4' : 'mp3'}`; // Include title in download filename
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
        alertText = 'Text not available';
    }
    alert(alertText);
  };

  return (
    <div className="App">
      <h1>GMTUBE free online YouTube audio and video downloader</h1>
      
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          placeholder="Enter YouTube Video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <div className="loading-dots"><span></span><span></span><span></span></div>}
      <div className="row">
        <div className="left-column">
          <div className="video-info">
            {videoInfo && (
              <>
                <h2>{videoInfo.title}</h2>
                <p>Duration: {videoDuration}</p>
                <img src={videoInfo.thumbnail_url} alt="Thumbnail" className="thumbnail" />
              </>
            )}
          </div>
        </div>
        <div className="right-column">
          <div className="tabs">
            {videoInfo && (
              <>
                <button onClick={() => setActiveTab('video')} className={activeTab === 'video' ? 'tab active' : 'tab'}>Video</button>
                <button onClick={() => setActiveTab('audio')} className={activeTab === 'audio' ? 'tab active' : 'tab'}>Audio</button>
              </>
            )}
          </div>
          {renderQualitySection()}
        </div>
      </div>
      <h1>YouTube Video Search</h1>
      <p>{instructionsText}</p>
      <div className="instructions-features">
        <div className="instructions">
          <h2>Instructions</h2>
          <ul>
            {instructionsSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
        <div className="features">
          <h2>Features</h2>
          <ul>
            {featuresList.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      </div>
      <h6>@2024 GMTUBE</h6>
      <footer className="footer">
        <a href="#" onClick={(e) => handleLinkClick('privacy', e)}>Privacy Policy</a>
        <a href="#" onClick={(e) => handleLinkClick('terms', e)}>Terms of Use</a>
        <a href="#" onClick={(e) => handleLinkClick('legal', e)}>Legal Disclaimer</a>
      </footer>
    </div>
  );
}

export default App;
