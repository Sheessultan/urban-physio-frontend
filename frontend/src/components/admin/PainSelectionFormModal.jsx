import { useEffect, useState, useCallback } from 'react';
import FaIcon from '../FaIcon';
import GlassModal, { GlassModalHeader, GlassModalFooter } from '../GlassModal';

function Field({ label, hint, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="flex items-center gap-1 text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-xs text-slate-500 mt-0.5 mb-1.5">{hint}</p>}
      {!hint && <div className="mt-1.5" />}
      {children}
    </div>
  );
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function PainSelectionFormModal({
  open,
  onClose,
  onSubmit,
  form,
  patch,
  editingId,
  saving,
  loadingEdit,
  treatments = [],
}) {
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    if (open) {
      setSlugManual(!!form.slug);
    }
  }, [open, editingId]);

  const handleChipLabelChange = (chipLabel) => {
    if (!slugManual && !editingId) {
      patch({ chip_label: chipLabel, slug: slugify(chipLabel) });
    } else {
      patch({ chip_label: chipLabel });
    }
  };

  return (
    <GlassModal open={open} onClose={onClose} preventClose={saving} size="lg" titleId="pain-selection-modal-title">
      <GlassModalHeader
        title={editingId ? 'Edit body area' : 'Add body area'}
        subtitle="Homepage pain map — accordion text & Know more treatment link"
        onClose={onClose}
        disabled={saving}
      />

      {loadingEdit ? (
        <div className="p-8 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : (
        <form id="pain-selection-form" onSubmit={onSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-4 md:px-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Chip label" required hint="Short name on pills & accordion title">
                <input
                  className="input-field"
                  value={form.chip_label}
                  onChange={(e) => handleChipLabelChange(e.target.value)}
                  placeholder="Neck"
                  required
                />
              </Field>
              <Field label="Full label" required hint="Accessibility / screen reader label">
                <input
                  className="input-field"
                  value={form.label}
                  onChange={(e) => patch({ label: e.target.value })}
                  placeholder="Neck Pain"
                  required
                />
              </Field>
            </div>

            <Field label="Slug" hint="Unique ID — used in URLs & data. Auto-generated from chip label.">
              <input
                className="input-field font-mono text-sm"
                value={form.slug}
                onChange={(e) => {
                  setSlugManual(true);
                  patch({ slug: e.target.value });
                }}
                placeholder="neck"
              />
            </Field>

            <Field label="Headline" hint="Short summary (optional)">
              <input
                className="input-field"
                value={form.headline}
                onChange={(e) => patch({ headline: e.target.value })}
                placeholder="Cervical stiffness, posture & tech-neck relief"
              />
            </Field>

            <Field label="Accordion description" required hint="Shown in the detail card on homepage">
              <textarea
                className="input-field min-h-[100px] resize-y"
                value={form.accordion_description}
                onChange={(e) => patch({ accordion_description: e.target.value })}
                placeholder="Describe treatments for this body area..."
                required
              />
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Hotspot left (%)" hint="Body figure highlight position">
                <input
                  className="input-field"
                  value={form.highlight_left}
                  onChange={(e) => patch({ highlight_left: e.target.value })}
                  placeholder="52%"
                />
              </Field>
              <Field label="Hotspot top (%)" hint="Body figure highlight position">
                <input
                  className="input-field"
                  value={form.highlight_top}
                  onChange={(e) => patch({ highlight_top: e.target.value })}
                  placeholder="27%"
                />
              </Field>
            </div>

            <Field
              label="Know more — linked treatment"
              hint="Dropdown lists all treatments. Selected treatment opens when user clicks Know more."
            >
              <select
                className="input-field"
                value={form.treatment_id ?? ''}
                onChange={(e) => patch({ treatment_id: e.target.value ? Number(e.target.value) : '' })}
              >
                <option value="">— Select treatment (optional) —</option>
                {treatments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                    {t.is_active ? '' : ' (inactive)'}
                  </option>
                ))}
              </select>
              {form.treatment_id && (
                <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <FaIcon icon="fa-link" className="text-orange-500" />
                  Know more will open:{' '}
                  <span className="font-medium text-slate-700">
                    /treatments/
                    {treatments.find((t) => t.id === Number(form.treatment_id))?.slug || '…'}
                  </span>
                </p>
              )}
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Sort order">
                <input
                  type="number"
                  className="input-field"
                  value={form.sort_order}
                  onChange={(e) => patch({ sort_order: e.target.value })}
                />
              </Field>
              <Field label="Status">
                <label className="inline-flex items-center gap-2 mt-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={!!form.is_active}
                    onChange={(e) => patch({ is_active: e.target.checked ? 1 : 0 })}
                  />
                  Active on homepage
                </label>
              </Field>
            </div>
          </div>

          <GlassModalFooter>
            <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" form="pain-selection-form" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Update area' : 'Add area'}
            </button>
          </GlassModalFooter>
        </form>
      )}
    </GlassModal>
  );
}
