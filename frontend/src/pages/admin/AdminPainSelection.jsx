import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminDashboardLayout from '../../layouts/AdminDashboardLayout';
import FaIcon from '../../components/FaIcon';
import PainSelectionFormModal from '../../components/admin/PainSelectionFormModal';
import { admin } from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  slug: '',
  chip_label: '',
  label: '',
  headline: '',
  accordion_description: '',
  highlight_left: '50%',
  highlight_top: '50%',
  icon: 'fa-bone',
  treatment_id: '',
  sort_order: 0,
  is_active: 1,
};

export default function AdminPainSelection() {
  const [list, setList] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([admin.painSelectionList(), admin.treatmentsList()])
      .then(([painRes, treatRes]) => {
        setList(painRes.data || []);
        setTreatments(treatRes.data || []);
      })
      .catch((err) => toast.error(err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = useMemo(
    () =>
      [...list].sort((a, b) => {
        const ao = Number(a.sort_order ?? 0);
        const bo = Number(b.sort_order ?? 0);
        if (ao !== bo) return ao - bo;
        return String(a.chip_label || '').localeCompare(String(b.chip_label || ''));
      }),
    [list],
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setLoadingEdit(false);
    setModalOpen(true);
  };

  const openEdit = async (id) => {
    setModalOpen(true);
    setLoadingEdit(true);
    setEditingId(id);
    try {
      const res = await admin.painSelectionGet(id);
      const row = res.data;
      setForm({
        slug: row.slug || '',
        chip_label: row.chip_label || '',
        label: row.label || '',
        headline: row.headline || '',
        accordion_description: row.accordion_description || '',
        highlight_left: row.highlight_left || '50%',
        highlight_top: row.highlight_top || '50%',
        icon: row.icon || 'fa-bone',
        treatment_id: row.treatment_id || '',
        sort_order: row.sort_order ?? 0,
        is_active: row.is_active ? 1 : 0,
      });
    } catch (err) {
      toast.error(err.message || 'Could not load item');
      setModalOpen(false);
      setEditingId(null);
    } finally {
      setLoadingEdit(false);
    }
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setLoadingEdit(false);
  };

  const patch = (fields) => setForm((f) => ({ ...f, ...fields }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.chip_label.trim() || !form.label.trim()) {
      toast.error('Chip label and full label are required');
      return;
    }
    if (!form.accordion_description.trim()) {
      toast.error('Accordion description is required');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      treatment_id: form.treatment_id ? Number(form.treatment_id) : null,
      sort_order: parseInt(form.sort_order, 10) || 0,
      is_active: form.is_active ? 1 : 0,
    };
    try {
      if (editingId) {
        await admin.painSelectionUpdate(editingId, payload);
        toast.success('Body area updated');
      } else {
        await admin.painSelectionCreate(payload);
        toast.success('Body area added');
      }
      closeModal();
      load();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, permanent = false) => {
    const msg = permanent
      ? 'Permanently delete this body area?'
      : 'Deactivate this body area on the homepage?';
    if (!confirm(msg)) return;
    try {
      await admin.painSelectionDelete(id, permanent);
      toast.success(permanent ? 'Deleted' : 'Deactivated');
      load();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Homepage pain selection</h1>
            <p className="text-slate-600 text-sm max-w-xl">
              Manage body areas on the homepage “Where does it hurt?” section — edit accordion text,
              hotspot position, and which treatment opens from Know more.
            </p>
          </div>
          <button type="button" onClick={openCreate} className="btn-primary shrink-0 inline-flex items-center gap-2">
            <FaIcon icon="fa-plus" />
            Add body area
          </button>
        </div>

        {loading ? (
          <div className="glass-card h-48 animate-pulse bg-white/30" />
        ) : sorted.length === 0 ? (
          <div className="glass-card text-center py-12">
            <FaIcon icon="fa-person-running" className="text-3xl text-slate-400 mb-3" />
            <p className="text-slate-600">No body areas yet. Add your first item.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((row) => (
              <div
                key={row.id}
                className={`glass-card !p-4 md:!p-5 ${row.is_active ? '' : 'opacity-60'}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-lg">{row.chip_label}</h3>
                      {!row.is_active && (
                        <span className="badge bg-slate-200 text-slate-700 text-[10px]">Inactive</span>
                      )}
                      <span className="text-xs text-slate-500 font-mono">#{row.slug}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{row.accordion_description}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>
                        <FaIcon icon="fa-crosshairs" className="text-orange-500 mr-1" />
                        {row.highlight_left}, {row.highlight_top}
                      </span>
                      <span>
                        <FaIcon icon="fa-link" className="text-orange-500 mr-1" />
                        {row.treatment_title ? (
                          <span className="text-slate-700 font-medium">{row.treatment_title}</span>
                        ) : (
                          <span className="italic">No treatment linked</span>
                        )}
                      </span>
                      <span>Sort: {row.sort_order ?? 0}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button type="button" className="btn-outline !px-4 text-sm" onClick={() => openEdit(row.id)}>
                      Edit
                    </button>
                    {row.is_active ? (
                      <button
                        type="button"
                        className="btn-outline !px-4 text-sm text-amber-700 border-amber-300"
                        onClick={() => handleDelete(row.id, false)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-danger !px-4 text-sm"
                        onClick={() => handleDelete(row.id, true)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PainSelectionFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        form={form}
        patch={patch}
        editingId={editingId}
        saving={saving}
        loadingEdit={loadingEdit}
        treatments={treatments}
      />
    </AdminDashboardLayout>
  );
}
