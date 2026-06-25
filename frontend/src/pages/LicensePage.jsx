import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FaIcon from '../components/FaIcon';
import CodeWaveAttribution from '../core/CodeWaveAttribution';
import { CODEWAVE_ATTRIBUTION, CODEWAVE_DEVELOPER, CODEWAVE_URL } from '../core/codewaveLicense';
import { license as licenseApi } from '../services/api';

export default function LicensePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    licenseApi
      .show()
      .then((res) => setData(res?.data ?? res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 text-orange-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-4">
          <FaIcon icon="fa-certificate" /> Software License
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Product License</h1>
        <p className="text-slate-600 mt-2 leading-relaxed">
          This website is licensed software. The developer attribution below is mandatory and protected by license terms.
        </p>

        {loading ? (
          <div className="mt-8 h-40 animate-pulse bg-slate-200 rounded-2xl" />
        ) : (
          <div className="mt-8 glass-strong rounded-2xl p-6 md:p-8 space-y-4 text-sm text-slate-700">
            <p>
              <span className="font-semibold text-slate-900">Licensee:</span>{' '}
              {data?.licensee || 'The Urban Physio'}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Developer:</span>{' '}
              <a href={CODEWAVE_URL} target="_blank" rel="noreferrer" className="text-primary-600 font-semibold hover:underline">
                {CODEWAVE_DEVELOPER}
              </a>
            </p>
            <p>
              <span className="font-semibold text-slate-900">Status:</span>{' '}
              <span className={data?.valid ? 'text-emerald-700 font-semibold' : 'text-red-700 font-semibold'}>
                {data?.valid ? 'Active' : 'Invalid'}
              </span>
            </p>
            {data?.issued_at && (
              <p>
                <span className="font-semibold text-slate-900">Issued:</span> {data.issued_at}
              </p>
            )}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
              <p className="font-semibold flex items-center gap-2">
                <FaIcon icon="fa-shield-halved" /> Protected attribution
              </p>
              <p className="mt-2 leading-relaxed">
                The footer credit &ldquo;{CODEWAVE_ATTRIBUTION}&rdquo; is part of the license. Removing or hiding it
                disables the website across frontend and API.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <CodeWaveAttribution className="text-slate-800 text-center" variant="footer" />
            </div>
          </div>
        )}

        <p className="mt-8 text-center">
          <Link to="/" className="text-primary-600 font-semibold hover:underline inline-flex items-center gap-1">
            <FaIcon icon="fa-arrow-left" /> Back to home
          </Link>
        </p>
      </div>
      <Footer />
    </div>
  );
}
