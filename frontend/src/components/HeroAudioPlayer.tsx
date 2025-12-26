import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

const AUDIO_TRACKS = [
  '/audio/marvin_Gzy01.mp3',
  '/audio/marvin_Gzy02.mp3',
  '/audio/marvin_Gzy03.mp3',
];

interface HeroAudioPlayerProps {
  isHeroVisible: boolean;
}

export const HeroAudioPlayer = ({ isHeroVisible }: HeroAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
  const [volume, setVolume] = useState(0.5);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = 0; // Start muted
      audioRef.current.muted = true;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle track ended - play next track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const nextIndex = (currentTrackIndex + 1) % AUDIO_TRACKS.length;
      setCurrentTrackIndex(nextIndex);
      audio.src = AUDIO_TRACKS[nextIndex];
      audio.load();
      if (isPlaying && isHeroVisible) {
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [currentTrackIndex, isPlaying, isHeroVisible]);

  // Autoplay muted on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const attemptAutoplay = async () => {
      try {
        audio.src = AUDIO_TRACKS[0];
        audio.muted = true;
        audio.volume = 0;
        await audio.play();
        setIsPlaying(true);
        console.log('Autoplay started (muted)');
      } catch (error) {
        console.log('Autoplay failed:', error);
        setIsPlaying(false);
      }
    };

    // Small delay to ensure component is mounted
    const timer = setTimeout(attemptAutoplay, 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle hero visibility changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isHeroVisible && isPlaying) {
      audio.play().catch(() => {});
    } else if (!isHeroVisible && isPlaying) {
      audio.pause();
    }
  }, [isHeroVisible, isPlaying]);

  // Update volume and muted state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error('Play failed:', error);
        });
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  return (
    <div 
      className="flex items-center justify-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg"
      onMouseEnter={() => setShowVolumeSlider(true)}
      onMouseLeave={() => setShowVolumeSlider(false)}
    >
      {/* Play/Pause button - always shown for control */}
      <button
        onClick={togglePlay}
        className="text-white hover:text-gray-300 transition-colors p-1"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </button>

      {/* Volume slider - shown on hover or when interacting */}
      <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${showVolumeSlider ? 'w-24 opacity-100' : 'w-0 opacity-0'}`}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
          aria-label="Volume"
        />
      </div>

      {/* Mute/Unmute button */}
      <button
        onClick={toggleMute}
        className="text-white hover:text-gray-300 transition-colors p-1"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted || volume === 0 ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>

      {/* Status indicator */}
      {isPlaying && !isMuted && (
        <div className="flex items-center gap-0.5 ml-1">
          <span className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
          <span className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
          <span className="w-1 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
        </div>
      )}
    </div>
  );
};

export default HeroAudioPlayer;
