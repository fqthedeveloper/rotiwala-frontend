// src/components/Home/VideoSlideshow.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getApprovedVideos, getMediaUrl } from '../../service/videoApi';
import {
  FaPlay,
  FaPause,
  FaVolumeMute,
  FaVolumeUp,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaCompress,
  FaRedo,
} from 'react-icons/fa';

const VideoSlideshow = () => {
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Default muted for browser autoplay policy
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  const fallbackTimerRef = useRef(null);

  // Fetch approved videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await getApprovedVideos();
        const rawList = res.data || [];
        const processed = rawList.map((v) => ({
          ...v,
          full_video_src: v.video_src ? getMediaUrl(v.video_src) : null,
          full_poster: v.poster ? getMediaUrl(v.poster) : null,
        }));
        setVideos(processed);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // Handler: When a video finishes playing
  const handleVideoEnded = useCallback(() => {
    if (videos.length === 0) return;

    if (videos.length === 1) {
      // Single video: Loop and replay from start
      const video = videoRef.current;
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else if (iframeRef.current && videos[0]?.video_type === 'youtube') {
        // Re-trigger YouTube embed
        const yt = videos[0];
        iframeRef.current.src = buildYouTubeUrl(yt.embed_url, isMuted);
      }
      return;
    }

    // Multiple videos: Slide to next video; if at end, loop back to first (index 0)
    setIsTransitioning(true);
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);

    transitionTimeoutRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
      setIsTransitioning(false);
      setProgress(0);
    }, 400);
  }, [videos, isMuted]);

  // Build YouTube Embed URL with JS API & Autoplay
  const buildYouTubeUrl = useCallback((baseEmbedUrl, muted) => {
    if (!baseEmbedUrl) return '';
    const origin = window.location.origin;
    const muteParam = muted ? '1' : '0';
    return `${baseEmbedUrl}?autoplay=1&mute=${muteParam}&enablejsapi=1&origin=${encodeURIComponent(
      origin
    )}&rel=0&modestbranding=1&controls=1&playsinline=1`;
  }, []);

  // Listen for YouTube iframe messages (stateChange: 0 means ENDED)
  useEffect(() => {
    const handleYouTubeMessage = (event) => {
      try {
        let data = event.data;
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
        // YouTube API info: 0 = ended, 1 = playing, 2 = paused
        if (
          data &&
          (data.event === 'onStateChange' || typeof data.info === 'number') &&
          data.info === 0
        ) {
          handleVideoEnded();
        }
      } catch {
        // Not a JSON message from YouTube iframe
      }
    };

    window.addEventListener('message', handleYouTubeMessage);
    return () => window.removeEventListener('message', handleYouTubeMessage);
  }, [handleVideoEnded]);

  // HTML5 Video source change & autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (!video || videos.length === 0 || !videos[currentIndex]) return;

    const currentVideo = videos[currentIndex];

    if (currentVideo.video_type === 'upload' && currentVideo.full_video_src) {
      if (video.src !== currentVideo.full_video_src) {
        video.src = currentVideo.full_video_src;
        video.poster = currentVideo.full_poster || '';
        video.load();
      }

      video.muted = isMuted;

      if (isPlaying) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Autoplay prevented or interrupted:', err);
          });
        }
      } else {
        video.pause();
      }
    }
  }, [currentIndex, videos, isPlaying, isMuted]);

  // YouTube source update when index or mute state changes
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || videos.length === 0 || !videos[currentIndex]) return;

    const currentVideo = videos[currentIndex];
    if (currentVideo.video_type === 'youtube' && currentVideo.embed_url) {
      const targetUrl = buildYouTubeUrl(currentVideo.embed_url, isMuted);
      if (iframe.src !== targetUrl) {
        iframe.src = targetUrl;
      }
    }
  }, [currentIndex, videos, isMuted, buildYouTubeUrl]);

  // HTML5 Video timeupdate for progress bar
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  };

  // HTML5 Video error fallback: if video fails to play, auto-skip after 3s
  const handleVideoError = () => {
    console.error('Video failed to play, scheduling advance...');
    if (videos.length > 1) {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = setTimeout(() => {
        handleVideoEnded();
      }, 3000);
    }
  };

  // Controls: Manual Prev
  const handlePrev = () => {
    if (videos.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
      setIsTransitioning(false);
      setIsPlaying(true);
      setProgress(0);
    }, 300);
  };

  // Controls: Manual Next
  const handleNext = () => {
    if (videos.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
      setIsTransitioning(false);
      setIsPlaying(true);
      setProgress(0);
    }, 300);
  };

  // Controls: Toggle Play/Pause
  const togglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    const video = videoRef.current;
    if (video) {
      if (nextState) video.play().catch(() => {});
      else video.pause();
    }
  };

  // Controls: Toggle Mute/Unmute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    const video = videoRef.current;
    if (video) {
      video.muted = nextMuted;
    }
  };

  // Controls: Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="video-slideshow-placeholder text-center py-5">
        <div className="spinner-border text-warning" style={{ width: '2.5rem', height: '2.5rem' }} />
        <p className="mt-2 text-muted fw-semibold">Loading kitchen stories...</p>
      </div>
    );
  }

  if (error || videos.length === 0) {
    return null; // Gracefully hide section if no approved videos available
  }

  const currentVideo = videos[currentIndex];
  const isYouTube = currentVideo?.video_type === 'youtube';

  return (
    <div className="video-slideshow-wrapper">
      <style>{`
        .video-slideshow-wrapper {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .video-slideshow-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #000;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.25);
        }
        .video-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
          background: #000;
        }
        .video-wrapper video,
        .video-wrapper iframe {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border: none;
          transition: opacity 0.4s ease;
        }
        .video-wrapper.transitioning video,
        .video-wrapper.transitioning iframe {
          opacity: 0.2;
        }
        /* Top Progress Bar */
        .video-progress-bar-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          z-index: 15;
        }
        .video-progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #f59e0b, #fbbf24);
          transition: width 0.25s linear;
        }
        /* Video Details Overlay */
        .video-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 24px 24px 68px;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 60%, transparent 100%);
          color: #fff;
          pointer-events: none;
          z-index: 5;
        }
        .video-overlay h3 {
          margin: 0;
          font-size: clamp(1.05rem, 2.2vw, 1.45rem);
          font-weight: 800;
          text-shadow: 0 2px 4px rgba(0,0,0,0.6);
        }
        .video-overlay p {
          margin: 4px 0 0;
          font-size: clamp(0.8rem, 1.4vw, 0.95rem);
          opacity: 0.9;
          max-width: 700px;
          line-height: 1.4;
          text-shadow: 0 1px 3px rgba(0,0,0,0.6);
        }
        /* Navigation Arrows */
        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.45);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          font-size: 1.1rem;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }
        .nav-btn:hover {
          background: rgba(245, 158, 11, 0.85);
          color: #fff;
          transform: translateY(-50%) scale(1.08);
          border-color: #f59e0b;
        }
        .nav-btn-prev { left: 14px; }
        .nav-btn-next { right: 14px; }
        /* Bottom Controls Bar */
        .bottom-controls {
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 10;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          padding: 6px 16px;
          border-radius: 50px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .bottom-controls button {
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          font-size: 1rem;
          padding: 6px;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .bottom-controls button:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #fbbf24;
        }
        .indicators {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.35);
          cursor: pointer;
          padding: 0;
          transition: all 0.25s ease;
        }
        .indicator.active {
          background: #f59e0b;
          width: 22px;
          border-radius: 50px;
        }
        .video-counter {
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.78rem;
          font-weight: 700;
          white-space: nowrap;
        }
        /* Mobile Breakpoints */
        @media (max-width: 768px) {
          .nav-btn {
            width: 36px;
            height: 36px;
            font-size: 0.9rem;
          }
          .nav-btn-prev { left: 8px; }
          .nav-btn-next { right: 8px; }
          .bottom-controls {
            padding: 4px 12px;
            gap: 8px;
            bottom: 10px;
          }
          .bottom-controls button {
            width: 28px;
            height: 28px;
            font-size: 0.85rem;
          }
          .video-overlay {
            padding: 16px 16px 54px;
          }
        }
        @media (max-width: 480px) {
          .video-slideshow-wrapper {
            padding: 0 8px;
          }
          .video-slideshow-container {
            border-radius: 14px;
          }
          .nav-btn {
            display: none; /* Hide side arrows on small screens; use indicators & swipe */
          }
          .bottom-controls {
            gap: 6px;
            padding: 4px 10px;
          }
        }
      `}</style>

      <div className="video-slideshow-container" ref={containerRef}>
        {/* Real-Time Progress Bar */}
        <div className="video-progress-bar-container">
          <div
            className="video-progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className={`video-wrapper${isTransitioning ? ' transitioning' : ''}`}>
          {isYouTube ? (
            <iframe
              ref={iframeRef}
              src={buildYouTubeUrl(currentVideo.embed_url, isMuted)}
              title={currentVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              playsInline
              preload="auto"
              autoPlay={isPlaying}
              muted={isMuted}
              loop={videos.length === 1} // Continuous loop if single video
              onEnded={handleVideoEnded} // Automatic slide to next video when current finishes
              onTimeUpdate={handleTimeUpdate}
              onError={handleVideoError}
            />
          )}

          {/* Video Title & Subtitle Overlay */}
          <div className="video-overlay">
            <h3>{currentVideo.title}</h3>
            {currentVideo.description && <p>{currentVideo.description}</p>}
          </div>

          {/* Previous & Next Navigation Arrows (for multiple videos) */}
          {videos.length > 1 && (
            <>
              <button
                type="button"
                className="nav-btn nav-btn-prev"
                onClick={handlePrev}
                aria-label="Previous Video"
              >
                <FaChevronLeft />
              </button>
              <button
                type="button"
                className="nav-btn nav-btn-next"
                onClick={handleNext}
                aria-label="Next Video"
              >
                <FaChevronRight />
              </button>
            </>
          )}

          {/* Bottom Floating Control Bar */}
          <div className="bottom-controls">
            {/* Play / Pause Toggle */}
            <button
              type="button"
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            {/* Mute / Unmute Audio Toggle */}
            <button
              type="button"
              onClick={toggleMute}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>

            {/* Slide Indicators */}
            {videos.length > 1 && (
              <div className="indicators">
                {videos.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`indicator ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => {
                      setIsTransitioning(true);
                      setTimeout(() => {
                        setCurrentIndex(idx);
                        setIsTransitioning(false);
                        setIsPlaying(true);
                        setProgress(0);
                      }, 250);
                    }}
                    title={`Go to video ${idx + 1}`}
                    aria-label={`Go to video ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Video Counter Pill */}
            <span className="video-counter">
              {currentIndex + 1} / {videos.length}
            </span>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSlideshow;