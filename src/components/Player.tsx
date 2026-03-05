import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RADIO_STREAM_URL } from '../constants';

export const Player: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [metadata, setMetadata] = useState({ title: 'Web Rádio Figueiró', artist: 'A rádio que te acompanha' });
  const [artwork, setArtwork] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);
  const isPlayingRef = useRef(false);
  const widgetContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync ref with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Wake Lock implementation
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('Wake Lock is active');
      } catch (err) {
        if ((err as Error).name === 'NotAllowedError') {
          console.warn('Wake Lock is disallowed by permissions policy in this environment.');
        } else {
          console.error(`${(err as Error).name}, ${(err as Error).message}`);
        }
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isPlaying) {
        // Re-request wake lock if tab becomes visible again
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying]);

  useEffect(() => {
    if (!widgetContainerRef.current) return;

    // MutationObserver to watch for metadata changes in hidden elements
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData' || mutation.type === 'childList') {
          const songElement = widgetContainerRef.current?.querySelector('.cc_streaminfo[data-type="song"]');
          if (songElement) {
            const text = songElement.textContent || '';
            if (text && text !== 'Carregando ...') {
              const parts = text.split(' - ');
              const artist = parts[0] || 'Web Rádio Figueiró';
              const title = parts[1] || 'Emissão em Direto';
              
              // Only update if metadata actually changed to avoid unnecessary renders
              setMetadata(prev => {
                if (prev.title === title && prev.artist === artist) return prev;
                fetchArtwork(artist, title);
                return { title, artist };
              });
            }
          }
        }
      }
    });

    observer.observe(widgetContainerRef.current, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  const fetchArtwork = async (artist: string, title: string) => {
    try {
      const response = await fetch(`/api/artwork?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setArtwork(data.results[0].artworkUrl100.replace('100x100', '600x600'));
      } else {
        setArtwork(null);
      }
    } catch (error) {
      console.error('Error fetching artwork via proxy:', error);
      setArtwork(null);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: metadata.title,
        artist: metadata.artist,
        album: 'Web Rádio Figueiró',
        artwork: artwork ? [
          { src: artwork, sizes: '512x512', type: 'image/jpeg' }
        ] : [
          { src: 'https://ui-avatars.com/api/?name=WRF&background=f27d26&color=fff&size=512', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', togglePlay);
      navigator.mediaSession.setActionHandler('pause', togglePlay);
      navigator.mediaSession.setActionHandler('stop', () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      });
    }
  }, [metadata, artwork]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  const togglePlay = async () => {
    if (!audioRef.current || isLoading) return;

    if (isPlaying) {
      try {
        audioRef.current.pause();
        setIsPlaying(false);
        setIsLoading(false);
        releaseWakeLock();
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      } catch (err) {
        console.error('Pause error:', err);
      }
    } else {
      setIsLoading(true);
      
      try {
        // Ensure volume is set before playing
        audioRef.current.volume = isMuted ? 0 : volume;
        
        // Cache-busting reconnection
        const separator = RADIO_STREAM_URL.includes('?') ? '&' : '?';
        const cacheBuster = `${separator}t=${Date.now()}`;
        audioRef.current.src = RADIO_STREAM_URL + cacheBuster;
        
        // Use a timeout to prevent hanging on play()
        const playPromise = audioRef.current.play();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Playback timeout')), 10000)
        );

        await Promise.race([playPromise, timeoutPromise]);
        
        setIsPlaying(true);
        setIsLoading(false);
        await requestWakeLock();
        startSimulatedVisualizer();
      } catch (error) {
        console.error('Playback failed:', error);
        setIsPlaying(false);
        setIsLoading(false);
        // Reset src on failure
        if (audioRef.current) audioRef.current.src = "";
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    const handleStalled = () => {
      console.warn('Audio stalled, attempting to resume...');
      if (isPlaying) {
        // Don't call load() immediately, just try to play if paused
        if (audio.paused) audio.play().catch(e => console.error('Resume failed:', e));
      }
    };

    const handleError = () => {
      console.error('Audio error occurred, reconnecting...');
      if (isPlaying) {
        setIsLoading(true);
        setTimeout(() => {
          const separator = RADIO_STREAM_URL.includes('?') ? '&' : '?';
          const cacheBuster = `${separator}t=${Date.now()}`;
          audio.src = RADIO_STREAM_URL + cacheBuster;
          audio.play().catch(e => console.error('Reconnection failed:', e));
        }, 3000);
      }
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('error', handleError);
    };
  }, [isPlaying]);

  const startSimulatedVisualizer = () => {
    if (!canvasRef.current || window.innerWidth < 768) return; // Disable on mobile to save CPU
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimization
    if (!ctx) return;

    const bufferLength = 20; // Reduced for performance
    
    const renderFrame = () => {
      if (!isPlayingRef.current) return;
      animationRef.current = requestAnimationFrame(renderFrame);
      
      const isDark = document.documentElement.classList.contains('dark');
      ctx.fillStyle = isDark ? '#18181b' : '#ffffff'; // Match background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = Math.random() * 35 + 5;
        
        ctx.fillStyle = '#f27d26';
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 4;
      }
    };

    renderFrame();
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      releaseWakeLock();
    };
  }, []);

  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-slow-spin {
          animation: slow-spin 12s linear infinite;
        }
        .animate-slow-spin-paused {
          animation-play-state: paused;
        }
      `}} />
      <div className="max-w-6xl mx-auto glass rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row items-center gap-6 p-4 md:p-6">
        {/* Hidden Centova Widgets */}
        <div className="hidden" ref={widgetContainerRef}>
          <span className="cc_streaminfo" data-type="song" data-username="orlando"></span>
        </div>

        <audio 
          ref={audioRef} 
          playsInline
          preload="auto"
        />

        {/* Album Art / Logo Disc */}
        <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
          <div 
            className={`w-full h-full rounded-full border-4 border-zinc-800 shadow-xl overflow-hidden bg-zinc-900 flex items-center justify-center relative ${isPlaying ? 'animate-slow-spin' : 'animate-slow-spin animate-slow-spin-paused'}`}
          >
            {artwork ? (
              <img src={artwork} alt="Capa" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-radio-primary/20 to-zinc-800 p-4">
                <Disc className={`w-full h-full text-radio-primary ${isPlaying ? 'animate-pulse' : ''}`} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-zinc-800 rounded-full border-2 border-zinc-700" />
          </div>
          
          {/* Neon Pulse */}
          <AnimatePresence>
            {isPlaying && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 0.3 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                className="absolute inset-0 rounded-full bg-radio-primary blur-xl -z-10"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Info & Controls */}
        <div className="flex-1 min-w-0 text-center md:text-left">
          <h3 className="text-lg font-bold truncate text-zinc-900 dark:text-white">
            {metadata.title}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
            {metadata.artist}
          </p>
          
          <div className="mt-4 flex items-center justify-center md:justify-start gap-4">
            <button 
              onClick={togglePlay}
              disabled={isLoading}
              className="w-12 h-12 rounded-full bg-radio-primary text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause fill="currentColor" />
              ) : (
                <Play fill="currentColor" className="ml-1" />
              )}
            </button>
            
            <div className="flex items-center gap-2 group">
              <button onClick={() => setIsMuted(!isMuted)} className="text-zinc-500 hover:text-radio-primary">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  if (audioRef.current) audioRef.current.volume = val;
                  if (val > 0) setIsMuted(false);
                }}
                className="w-24 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-radio-primary"
              />
            </div>
          </div>
        </div>

        {/* Visualizer */}
        <div className="hidden lg:block w-48 h-16">
          <canvas ref={canvasRef} width={200} height={60} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};
