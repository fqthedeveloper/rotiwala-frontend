// src/components/Home/VideoSlideshow.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getApprovedVideos, getMediaUrl } from '../../service/videoApi';
import {
  FaPlay,
  FaPause,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaCompress,
} from 'react-icons/fa';

const VideoSlideshow = () => {
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState(null);
  const [isYouTubeReady, setIsYouTubeReady] = useState(false);

  const intervalRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  // Fetch videos
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getApprovedVideos();
        const processed = (res.data || []).map(v => ({
          ...v,
          full_video_src: v.video_src ? getMediaUrl(v.video_src) : null,
          full_poster: v.poster ? getMediaUrl(v.poster) : null,
        }));
        setVideos(processed);
      } catch (err) {
        console.error(err);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Auto-slide timer
  useEffect(() => {
    if (videos.length === 0) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setIsTransitioning(true);
        transitionTimeoutRef.current = setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % videos.length);
          setIsTransitioning(false);
        }, 700);
      }, 7500);
    }
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(transitionTimeoutRef.current);
    };
  }, [videos, isPlaying]);

  // Handle video source change & autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (!video || videos.length === 0 || !videos[currentIndex]) return;

    const currentVideo = videos[currentIndex];

    if (currentVideo.video_type === 'upload' && currentVideo.full_video_src) {
      video.src = currentVideo.full_video_src;
      video.poster = currentVideo.full_poster || '';
      video.load();

      if (isPlaying) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            setIsPlaying(false);
          });
        }
      }
    }
  }, [currentIndex, videos, isPlaying]);

  // Play/Pause toggle for uploaded videos
  useEffect(() => {
    const video = videoRef.current;
    if (!video || videos.length === 0 || !videos[currentIndex]) return;
    if (videos[currentIndex].video_type === 'upload') {
      if (isPlaying) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }, [isPlaying, currentIndex, videos]);

  // YouTube iframe load & autoplay
  useEffect(() => {
    if (!isYouTubeReady) return;
    // YouTube autoplay is handled via URL param; we just re-trigger if needed
    const iframe = iframeRef.current;
    if (iframe && isPlaying) {
      // Re-load iframe with autoplay when video changes
      const currentVideo = videos[currentIndex];
      if (currentVideo?.video_type === 'youtube') {
        const url = currentVideo.embed_url + '?autoplay=1&mute=1&rel=0&modestbranding=1';
        iframe.src = url;
      }
    }
  }, [currentIndex, videos, isPlaying, isYouTubeReady]);

  const handlePrev = () => {
    if (videos.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (videos.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % videos.length);
    setIsPlaying(true);
  };

  const togglePlay = () => setIsPlaying((prev) => !prev);
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading videos...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>{error}</div>;
  if (videos.length === 0) return <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No videos available.</div>;

  const currentVideo = videos[currentIndex];
  const isYouTube = currentVideo?.video_type === 'youtube';

  return (
    <div className="video-slideshow-wrapper" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px' }}>
      <style>{`
        .video-slideshow-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #000;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
        .video-wrapper { width: 100%; height: 100%; }
        .video-wrapper iframe,
        .video-wrapper video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #1a1a2e;
          display: block;
          opacity: 1;
          transition: opacity 0.7s ease;
        }
        .video-wrapper.transitioning iframe,
        .video-wrapper.transitioning video {
          opacity: 0.3;
        }
        .video-wrapper iframe { border: none; }
        .video-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 20px 24px 32px;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          color: #fff;
          pointer-events: none;
        }
        .video-overlay h3 { margin: 0; font-size: clamp(1rem, 2vw, 1.4rem); }
        .video-overlay p { margin: 4px 0 0; font-size: clamp(0.8rem, 1.2vw, 1rem); opacity: 0.8; }
        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0,0,0,0.5);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          font-size: 1.1rem;
          backdrop-filter: blur(4px);
          transition: background 0.2s;
        }
        .nav-btn:hover { background: rgba(0,0,0,0.8); }
        .nav-btn-prev { left: 12px; }
        .nav-btn-next { right: 12px; }
        .bottom-controls {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 10;
          background: rgba(0,0,0,0.5);
          padding: 8px 16px;
          border-radius: 30px;
          backdrop-filter: blur(4px);
        }
        .bottom-controls button {
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          font-size: 1.1rem;
          padding: 6px;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bottom-controls button:hover { background: rgba(255,255,255,0.15); }
        .indicators { display: flex; gap: 8px; align-items: center; }
        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.3);
          cursor: pointer;
          padding: 0;
          transition: all 0.3s;
        }
        .indicator.active { background: #fbbf24; width: 24px; border-radius: 4px; }
        .video-counter { color: rgba(255,255,255,0.7); font-size: 0.8rem; font-weight: 500; }
        @media (max-width: 768px) {
          .nav-btn { width: 36px; height: 36px; font-size: 0.9rem; }
          .nav-btn-prev { left: 8px; }
          .nav-btn-next { right: 8px; }
          .bottom-controls { padding: 6px 12px; gap: 8px; }
          .bottom-controls button { width: 30px; height: 30px; font-size: 0.9rem; }
          .indicator { width: 6px; height: 6px; }
          .indicator.active { width: 18px; }
          .video-counter { font-size: 0.7rem; }
          .video-overlay { padding: 12px 16px 20px; }
        }
        @media (max-width: 480px) {
          .video-slideshow-wrapper { padding: 0 8px; }
          .video-slideshow-container { border-radius: 10px; }
          .nav-btn { width: 32px; height: 32px; font-size: 0.8rem; }
          .bottom-controls { gap: 6px; padding: 4px 10px; }
          .bottom-controls button { width: 26px; height: 26px; font-size: 0.8rem; }
          .indicator { width: 5px; height: 5px; }
          .indicator.active { width: 14px; }
          .video-counter { font-size: 0.6rem; }
        }
      `}</style>

      <div className="video-slideshow-container" ref={containerRef}>
        <div className={`video-wrapper${isTransitioning ? ' transitioning' : ''}`}>
          {isYouTube ? (
            <iframe
              ref={iframeRef}
              src={currentVideo.embed_url + '?autoplay=1&mute=1&rel=0&modestbranding=1'}
              title={currentVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsYouTubeReady(true)}
            />
          ) : (
            <video
              ref={videoRef}
              muted
              playsInline
              preload="metadata"
              controls={!isPlaying}
              autoPlay={isPlaying}
            />
          )}

          <div className="video-overlay">
            <h3>{currentVideo.title}</h3>
            <p>{currentVideo.description}</p>
          </div>

          <button className="nav-btn nav-btn-prev" onClick={handlePrev}><FaChevronLeft /></button>
          <button className="nav-btn nav-btn-next" onClick={handleNext}><FaChevronRight /></button>

          <div className="bottom-controls">
            <button onClick={togglePlay}>{isPlaying ? <FaPause /> : <FaPlay />}</button>
            <div className="indicators">
              {videos.map((_, idx) => (
                <button
                  key={idx}
                  className={`indicator ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => { setCurrentIndex(idx); setIsPlaying(true); }}
                />
              ))}
            </div>
            <span className="video-counter">{currentIndex + 1} / {videos.length}</span>
            <button onClick={toggleFullscreen}>{isFullscreen ? <FaCompress /> : <FaExpand />}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSlideshow;