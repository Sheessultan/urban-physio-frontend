import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import FaIcon from '../../components/FaIcon';
import PatientReportsPanel from '../../components/PatientReportsPanel';
import { patientReports } from '../../services/api';
import { PATIENT_NAV } from '../../constants/patientNav';
import toast from 'react-hot-toast';

export default function PatientReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    patientReports
      .list()
      .then((res) => setReports(res.data || []))
      .catch((e) => toast.error(e.message || 'Could not load reports'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onUpload = async (formData) => {
    await patientReports.upload(formData);
    toast.success('Report uploaded — your doctor can view it on your next visit');
    load();
  };

  const onDelete = async (id) => {
    await patientReports.remove(id);
    toast.success('Report deleted');
    load();
  };

  return (
    <DashboardLayout links={PATIENT_NAV} variant="patient">
      <div className="mb-5 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Medical Reports</h1>
        <p className="text-slate-600 text-sm mt-1 max-w-2xl">
          Upload X-rays, MRI, blood tests, or prescriptions. Share securely with your physiotherapist.
        </p>
      </div>

      <div className="glass-card !p-4 md:!p-6">
        <PatientReportsPanel
          reports={reports}
          loading={loading}
          canUpload
          canDelete
          onUpload={onUpload}
          onDelete={onDelete}
          onRefresh={load}
        />
      </div>

      <div className="mt-4 md:mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-slate-500 flex items-start gap-2 max-w-2xl">
          <FaIcon icon="fa-shield-halved" className="text-primary-600 mt-0.5 shrink-0" />
          Reports are only visible to you, Urban Physio admins, and doctors you have booked with.
        </p>
        <Link
          to="/patient"
          className="inline-flex items-center gap-1 text-sm text-primary-600 font-medium hover:underline shrink-0"
        >
          <FaIcon icon="fa-arrow-left" />
          Back to dashboard
        </Link>
      </div>
    </DashboardLayout>
  );
}
