import toast from 'react-hot-toast';
import FaIcon from './FaIcon';

export default function ShareProfileButton({ title, className = '' }) {
  const share = async () => {
    const url = window.location.href;
    const text = title || 'The Urban Physio';
    try {
      if (navigator.share) {
        await navigator.share({ title: text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success('Profile link copied');
    } catch {
      /* user cancelled */
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition ${className}`}
    >
      <FaIcon icon="fa-share-nodes" />
      Share profile
    </button>
  );
}
