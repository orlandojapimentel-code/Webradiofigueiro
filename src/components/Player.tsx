import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RADIO_STREAM_URL } from '../constants';

export const Player: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [metadata, setMetadata] = useState({ title: 'Web Rádio Figueiró', artist: 'A rádio que te acompanha' });
  const [artwork, setArtwork] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    // MutationObserver to watch for metadata changes in hidden elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData' || mutation.type === 'childList') {
          const songElement = document.querySelector('.cc_streaminfo[data-type="song"]');
          if (songElement) {
            const text = songElement.textContent || '';
            if (text && text !== 'Carregando ...') {
              const parts = text.split(' - ');
              const artist = parts[0] || 'Web Rádio Figueiró';
              const title = parts[1] || 'Emissão em Direto';
              setMetadata({ title, artist });
              fetchArtwork(artist, title);
            }
          }
        }
      });
    });

    const target = document.body;
    observer.observe(target, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  const fetchArtwork = async (artist: string, title: string) => {
    try {
      const query = encodeURIComponent(`${artist} ${title}`);
      const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setArtwork(data.results[0].artworkUrl100.replace('100x100', '600x600'));
      } else {
        setArtwork(null);
      }
    } catch (error) {
      console.error('Error fetching artwork:', error);
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
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    } else {
      // Ensure volume is set before playing
      audioRef.current.volume = isMuted ? 0 : volume;
      
      // Cache-busting reconnection
      const cacheBuster = `&t=${Date.now()}`;
      audioRef.current.src = RADIO_STREAM_URL + cacheBuster;
      
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        startSimulatedVisualizer();
      } catch (error) {
        console.error('Playback failed:', error);
        setIsPlaying(false);
      }
    }
  };

  const startSimulatedVisualizer = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = 32;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        // Simulated movement
        barHeight = Math.random() * 40 + 5;
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#f27d26');
        gradient.addColorStop(1, '#ff4e00');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 2;
      }
    };

    renderFrame();
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-6xl mx-auto glass rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row items-center gap-6 p-4 md:p-6">
        {/* Hidden Centova Widgets */}
        <div className="hidden">
          <span className="cc_streaminfo" data-type="song" data-username="orlando"></span>
        </div>

        <audio 
          ref={audioRef} 
          playsInline
          preload="metadata"
        />

        {/* Album Art / Logo Disc */}
        <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
          <motion.div 
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-full h-full rounded-full border-4 border-zinc-800 shadow-xl overflow-hidden bg-zinc-900 flex items-center justify-center relative"
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
          </motion.div>
          
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
              className="w-12 h-12 rounded-full bg-radio-primary text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            >
              {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
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
