import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import PersistentPodcastPlayer from '../components/podcast/PersistentPodcastPlayer';

const PodcastPlayerContext = createContext(null);

export function usePodcastPlayer() {
  const ctx = useContext(PodcastPlayerContext);
  if (!ctx) {
    throw new Error('usePodcastPlayer must be used within PodcastPlayerProvider');
  }
  return ctx;
}

export function usePodcastPlayerOptional() {
  return useContext(PodcastPlayerContext);
}

export function PodcastPlayerProvider({ children }) {
  const audioRef = useRef(null);
  const pendingSeek = useRef(0);
  const [episode, setEpisode] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState({ current: 0, duration: 0 });

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--podcast-player-height',
      episode ? '3.75rem' : '0px',
    );
    return () => {
      document.documentElement.style.setProperty('--podcast-player-height', '0px');
    };
  }, [episode]);

  const playEpisode = useCallback((ep, seek = 0) => {
    if (!ep?.audioSrc) return;
    pendingSeek.current = Math.max(0, seek || 0);
    setEpisode(ep);
    setPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !episode) return;
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }
  }, [episode]);

  const closePlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    setEpisode(null);
    setPlaying(false);
    setProgress({ current: 0, duration: 0 });
    pendingSeek.current = 0;
  }, []);

  const seekTo = useCallback((ratio) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = ratio * audio.duration;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !episode?.audioSrc) return undefined;

    const start = () => {
      if (pendingSeek.current > 0) {
        audio.currentTime = pendingSeek.current;
        pendingSeek.current = 0;
      }
      audio.play().catch(() => setPlaying(false));
    };

    audio.src = episode.audioSrc;
    audio.load();

    if (audio.readyState >= 2) {
      start();
    } else {
      audio.addEventListener('canplay', start, { once: true });
    }

    return () => {
      audio.removeEventListener('canplay', start);
    };
  }, [episode?.slug, episode?.audioSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onTimeUpdate = () => {
      setProgress({ current: audio.currentTime, duration: audio.duration || 0 });
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onTimeUpdate);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onTimeUpdate);
    };
  }, []);

  const value = {
    episode,
    playing,
    progress,
    playEpisode,
    togglePlay,
    closePlayer,
    seekTo,
    audioRef,
  };

  return (
    <PodcastPlayerContext.Provider value={value}>
      {children}
      <PersistentPodcastPlayer />
      <audio ref={audioRef} className="sr-only" preload="metadata" playsInline />
    </PodcastPlayerContext.Provider>
  );
}
