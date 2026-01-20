import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

const AUDIO_TRACKS = [
  '/audio/marvin_Gzy01.mp3',
  '/audio/marvin_Gzy02.mp3',
  '/audio/marvin_Gzy03.mp3',
];

interface HeroAudioPlayerProps {
  isHeroVisible?: boolean;
}

export const HeroAudioPlayer = ({ isHeroVisible = true }: HeroAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.src = AUDIO_TRACKS[0];
    audio.volume = volume;
    audio.preload = 'auto';
    audioRef.current = audio;
    
    console.log('🎵 Audio player initialized');
    console.log('Audio src:', audio.src);
    
    audio.addEventListener('canplay', () => {
      console.log('✅ Audio can play');
    });
    
    audio.addEventListener('error', () => {
      console.error('❌ Audio error:', audio.error);
    });
    
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

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePlayerClick = () => {
    console.log('🎯 Player clicked!');
    const audio = audioRef.current;
    
    if (!audio) {
      console.error('❌ No audio element');
      return;
    }
    
    console.log('Current state - isPlaying:', isPlaying, 'paused:', audio.paused);
    
    if (isPlaying) {
      console.log('⏸️ Pausing and resetting...');
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    } else {
      console.log('▶️ Playing from start...');
      audio.currentTime = 0;
      
      audio.play()
        .then(() => {
          console.log('✅ Playing successfully');
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error('❌ Play error:', err);
        });
    }
  };

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  }, []);

  return (
    <div 
      className="flex items-center justify-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg cursor-pointer relative z-50"
      onMouseEnter={() => setShowVolumeSlider(true)}
      onMouseLeave={() => setShowVolumeSlider(false)}
      onClick={(e) => {
        console.log('🎯 Container clicked!', e.target);
      }}
    >
      {/* Play/Pause button */}
      <button
        onClick={handlePlayerClick}
        className="text-white hover:text-gray-300 transition-colors p-2 focus:outline-none focus:ring-2 focus:ring-white rounded"
        aria-label={isPlaying ? 'Stop' : 'Play'}
        type="button"
      >
        {isPlaying ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6" />
        )}
      </button>

      {/* Volume slider - shown on hover or when interacting */}
      <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${showVolumeSlider ? 'w-24 opacity-100' : 'w-0 opacity-0'}`}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
          aria-label="Volume"
        />
      </div>

      {/* Volume icon */}
      <div className="text-white">
        {volume === 0 ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </div>

      {/* Status indicator */}
      {isPlaying && (
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
