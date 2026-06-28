import { Link } from 'react-router-dom';
import FaIcon from '../FaIcon';

/**
 * Visual breadcrumbs for SEO landing pages.
 *
 * @param {{ items: Array<{ label: string, href?: string }> }} props
 */
export default function SeoBreadcrumbs({ items }) {
  if (!items?.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-white/80 mb-6 flex-wrap">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={`${item.label}-${idx}`} className="inline-flex items-center gap-2">
            {idx > 0 && <FaIcon icon="fa-chevron-right" className="text-xs opacity-60" />}
            {item.href && !isLast ? (
              <Link to={item.href} className="hover:text-white transition">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-white font-medium' : 'text-white/90'}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
