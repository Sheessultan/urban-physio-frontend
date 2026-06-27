import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import FaIcon from '../../components/FaIcon';
import { doctors } from '../../services/api';
import { DOCTOR_NAV } from '../../constants/doctorNav';
import toast from 'react-hot-toast';

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-IN');
}

export default function DoctorAdminPackagePrices() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    doctors.adminPackagePrices
      .list()
      .then((res) => setList(res.data || []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (row) => {
    const price = Number(row._price ?? row.price ?? row.catalog_price);
    if (!Number.isFinite(price) || price < 0) {
      toast.error('Enter a valid price');
      return;
    }
    setSavingId(row.package_id);
    try {
      await doctors.adminPackagePrices.update(row.package_id, {
        price,
        mrp_price: Number(row._mrp ?? row.mrp_price ?? price),
        is_enabled: row._enabled ?? row.is_enabled ?? 1,
      });
      toast.success('Price saved');
      load();
    } catch (e) {
      toast.error(e.message || 'Could not save');
    } finally {
      setSavingId(null);
    }
  };

  const patchRow = (packageId, fields) => {
    setList((rows) => rows.map((r) => (r.package_id === packageId ? { ...r, ...fields } : r)));
  };

  return (
    <DashboardLayout links={DOCTOR_NAV} variant="doctor">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Platform package pricing</h1>
        <p className="text-slate-600 text-sm mt-2 max-w-3xl leading-relaxed">
          Admin-created packages are shared across all doctors. You cannot edit package details — only set your own
          price for patients booking with you.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-200/80" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 sm:p-10 text-center text-slate-600 shadow-sm">
          <FaIcon icon="fa-tags" className="text-3xl text-slate-300 mb-3" />
          <p className="font-semibold text-slate-800">No admin packages available yet</p>
          <p className="text-sm mt-1">Platform packages will appear here once the admin publishes them.</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {list.map((row) => {
            const yourPrice = row._price ?? row.price ?? row.catalog_price ?? '';
            const mrp = row._mrp ?? row.mrp_price ?? row.catalog_price ?? '';
            const enabled = Boolean(Number(row._enabled ?? row.is_enabled ?? 1));
            const isSaving = savingId === row.package_id;

            return (
              <article
                key={row.package_id}
                className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden"
              >
                <div className="px-4 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-sky-50/90 via-white to-white border-b border-slate-100">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-sky-800 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-full shrink-0">
                          <FaIcon icon="fa-building-columns" className="text-[9px]" />
                          Admin package
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 break-words leading-snug">
                        {row.name}
                      </h2>
                      {row.short_description && (
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{row.short_description}</p>
                      )}
                    </div>
                    <div className="shrink-0 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Suggested price</p>
                      <p className="text-base font-bold text-slate-800">₹{formatMoney(row.catalog_price)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1">
                      <FaIcon icon="fa-calendar-days" className="text-slate-400 text-[10px]" />
                      {row.total_sessions} sessions
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1">
                      <FaIcon icon="fa-clock" className="text-slate-400 text-[10px]" />
                      {row.duration_days} days
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 capitalize">
                      <FaIcon icon="fa-stethoscope" className="text-slate-400 text-[10px]" />
                      {row.consultation_type?.replace('_', ' ') || 'Any type'}
                    </span>
                  </div>
                </div>

                <div className="px-4 py-4 sm:px-6 sm:py-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Set your price</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                    <div>
                      <label htmlFor={`price-${row.package_id}`} className="block text-sm font-medium text-slate-700 mb-1.5">
                        Your price (₹)
                      </label>
                      <input
                        id={`price-${row.package_id}`}
                        type="number"
                        min={0}
                        step="1"
                        inputMode="decimal"
                        className="input-field w-full"
                        value={yourPrice}
                        onChange={(e) => patchRow(row.package_id, { _price: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor={`mrp-${row.package_id}`} className="block text-sm font-medium text-slate-700 mb-1.5">
                        MRP (₹)
                      </label>
                      <input
                        id={`mrp-${row.package_id}`}
                        type="number"
                        min={0}
                        step="1"
                        inputMode="decimal"
                        className="input-field w-full"
                        value={mrp}
                        onChange={(e) => patchRow(row.package_id, { _mrp: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <label className="inline-flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                        checked={enabled}
                        onChange={(e) => patchRow(row.package_id, { _enabled: e.target.checked ? 1 : 0 })}
                      />
                      Offer this package to my patients
                    </label>
                    <button
                      type="button"
                      className="btn-primary w-full sm:w-auto sm:min-w-[9rem] inline-flex items-center justify-center gap-2 !py-2.5"
                      disabled={isSaving}
                      onClick={() => save(row)}
                    >
                      {isSaving ? (
                        <>
                          <FaIcon icon="fa-spinner" className="fa-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <FaIcon icon="fa-floppy-disk" />
                          Save price
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-6 sm:mt-8 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-xs text-slate-600 flex items-start gap-2">
        <FaIcon icon="fa-circle-info" className="mt-0.5 shrink-0 text-slate-400" />
        <p>
          To create your own packages with custom names and sessions, go to{' '}
          <Link to="/doctor/service-packages" className="font-semibold text-teal-700 hover:underline">
            My packages
          </Link>{' '}
          (requires admin approval).
        </p>
      </div>
    </DashboardLayout>
  );
}
