import { useEffect, useState } from 'react';
import AdminDashboardLayout from '../../layouts/AdminDashboardLayout';
import FaIcon from '../../components/FaIcon';
import { admin } from '../../services/api';
import toast from 'react-hot-toast';

function formatWhen(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin
      .logs()
      .then((res) => setLogs(res.data || []))
      .catch((e) => toast.error(e.message || 'Could not load audit logs'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminDashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-slate-600 text-sm mt-1">Track admin actions across the platform.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-card h-16 animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-card text-center py-12 px-6">
          <FaIcon icon="fa-clipboard-list" className="text-4xl text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">No audit logs yet.</p>
          <p className="text-sm text-slate-500 mt-1">Admin actions will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((l) => (
            <article
              key={l.id}
              className="glass-card !p-3 md:!p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-white/80"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {l.first_name} {l.last_name}
                </p>
                <p className="text-sm text-slate-600 mt-0.5">{l.action}</p>
                {l.entity_type && (
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    {l.entity_type}
                    {l.entity_id ? ` #${l.entity_id}` : ''}
                  </p>
                )}
              </div>
              <time className="text-xs text-slate-500 shrink-0 sm:text-right">{formatWhen(l.created_at)}</time>
            </article>
          ))}
        </div>
      )}
    </AdminDashboardLayout>
  );
}
