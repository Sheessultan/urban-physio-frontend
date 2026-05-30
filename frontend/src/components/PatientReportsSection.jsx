import { useCallback, useEffect, useState } from 'react';
import FaIcon from './FaIcon';
import PatientReportsPanel from './PatientReportsPanel';
import { patientReports } from '../services/api';
import toast from 'react-hot-toast';

/** Read-only reports for doctor/admin when viewing a patient */
export default function PatientReportsSection({ patientId, title = 'Medical reports' }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!patientId) return;
    setLoading(true);
    patientReports
      .byPatient(patientId)
      .then((res) => setReports(res.data || []))
      .catch((e) => toast.error(e.message || 'Could not load reports'))
      .finally(() => setLoading(false));
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!patientId) return null;

  return (
    <div className="glass-card !p-4 md:!p-5">
      <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
        <FaIcon icon="fa-file-medical" className="text-sky-600" />
        {title}
        <span className="text-xs font-normal text-slate-500">(view & download)</span>
      </h3>
      <PatientReportsPanel
        reports={reports}
        loading={loading}
        onRefresh={load}
        emptyHint="This patient has not uploaded any reports yet."
      />
    </div>
  );
}
