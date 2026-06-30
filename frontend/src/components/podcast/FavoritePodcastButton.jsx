import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import FaIcon from '../FaIcon';
import { isFavoritePodcast, toggleFavoritePodcast } from '../../utils/favoritePodcasts';

export default function FavoritePodcastButton({ post, className = '', compact = false }) {
  const [saved, setSaved] = useState(() => isFavoritePodcast(post?.slug));

  useEffect(() => {
    const sync = () => setSaved(isFavoritePodcast(post?.slug));
    sync();
    window.addEventListener('favorite-podcasts-changed', sync);
    return () => window.removeEventListener('favorite-podcasts-changed', sync);
  }, [post?.slug]);

  const toggle = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const { saved: next } = toggleFavoritePodcast(post);
    setSaved(next);
    toast.success(next ? 'Saved to favorite podcasts' : 'Removed from favorites', { duration: 2000 });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center justify-center rounded-full border transition-colors touch-manipulation ${
        compact ? 'w-9 h-9' : 'w-10 h-10'
      } ${
        saved
          ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
          : 'bg-white border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200'
      } ${className}`}
      aria-label={saved ? 'Remove from favorite podcasts' : 'Save to favorite podcasts'}
      title={saved ? 'Saved' : 'Save podcast'}
    >
      <FaIcon icon={saved ? 'fa-heart' : 'fa-heart'} className={compact ? 'text-sm' : 'text-base'} />
    </button>
  );
}
