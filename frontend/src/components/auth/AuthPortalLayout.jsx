import { Link } from 'react-router-dom';
import Navbar from '../Navbar';
import FaIcon from '../FaIcon';

/**
 * @param {{ portal: object, children: React.ReactNode, footer?: React.ReactNode }} props
 */
export default function AuthPortalLayout({ portal, children, footer }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/20 to-white">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-10 sm:py-14">
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${portal.accent} text-white shadow-lg mb-4`}
          >
            <FaIcon icon={portal.icon} className="text-xl" />
          </div>
          <p className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border mb-3 ${portal.softAccent}`}>
            <FaIcon icon={portal.icon} className="text-[10px]" />
            {portal.pickerTitle}
          </p>
        </div>
        {children}
        {footer}
        <p className="mt-6 text-center">
          <Link to="/login" className="text-xs text-slate-400 hover:text-slate-600 transition">
            Not sure which account? Choose account type
          </Link>
        </p>
      </div>
    </div>
  );
}
