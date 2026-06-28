import FaIcon from '../FaIcon';

const emptyTimelineEntry = () => ({ duration: '', organization: '' });

/**
 * BPT/MPT, certifications, and experience timeline fields for doctor profile edit.
 *
 * @param {{ form: object, set: (key: string, value: unknown) => void, setForm: (fn: (f: object) => object) => void }} props
 */
export default function DoctorProfessionalFields({ form, set, setForm }) {
  const certifications = Array.isArray(form.certifications) ? form.certifications : [];
  const timeline = Array.isArray(form.experience_timeline) ? form.experience_timeline : [];

  const setCertification = (index, value) => {
    setForm((f) => {
      const next = [...(f.certifications || [])];
      next[index] = value;
      return { ...f, certifications: next };
    });
  };

  const addCertification = () => {
    setForm((f) => ({ ...f, certifications: [...(f.certifications || []), ''] }));
  };

  const removeCertification = (index) => {
    setForm((f) => ({
      ...f,
      certifications: (f.certifications || []).filter((_, i) => i !== index),
    }));
  };

  const setTimelineEntry = (index, key, value) => {
    setForm((f) => {
      const next = [...(f.experience_timeline || [])];
      next[index] = { ...next[index], [key]: value };
      return { ...f, experience_timeline: next };
    });
  };

  const addTimelineEntry = () => {
    setForm((f) => ({
      ...f,
      experience_timeline: [...(f.experience_timeline || []), emptyTimelineEntry()],
    }));
  };

  const removeTimelineEntry = (index) => {
    setForm((f) => ({
      ...f,
      experience_timeline: (f.experience_timeline || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-5 pt-2 border-t border-slate-100">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Qualifications</h3>
        <p className="text-xs text-slate-500 mb-3">Shown prominently on your public profile.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">BPT</label>
            <input
              className="input-field"
              placeholder="e.g. BPT — Delhi University, 2018"
              value={form.degree_bpt || ''}
              onChange={(e) => set('degree_bpt', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">MPT</label>
            <input
              className="input-field"
              placeholder="e.g. MPT — Sports Physio, 2020"
              value={form.degree_mpt || ''}
              onChange={(e) => set('degree_mpt', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <label className="text-sm font-medium text-slate-700">Certifications</label>
          <button type="button" onClick={addCertification} className="text-xs font-semibold text-primary-600 hover:text-primary-700">
            + Add certification
          </button>
        </div>
        {certifications.length === 0 ? (
          <p className="text-xs text-slate-500">Add professional certifications (e.g. Manual Therapy, Dry Needling).</p>
        ) : (
          <div className="space-y-2">
            {certifications.map((cert, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  className="input-field flex-1"
                  placeholder="Certification name"
                  value={cert}
                  onChange={(e) => setCertification(idx, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeCertification(idx)}
                  className="shrink-0 px-3 rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  aria-label="Remove certification"
                >
                  <FaIcon icon="fa-trash-can" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <label className="text-sm font-medium text-slate-700">Experience timeline</label>
          <button type="button" onClick={addTimelineEntry} className="text-xs font-semibold text-primary-600 hover:text-primary-700">
            + Add experience
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-2">Most recent first. Example: 1.2 Years — Fortis Noida</p>
        {timeline.length === 0 ? (
          <p className="text-xs text-slate-500">No experience entries yet.</p>
        ) : (
          <div className="space-y-2">
            {timeline.map((entry, idx) => (
              <div key={idx} className="grid sm:grid-cols-[1fr_1.4fr_auto] gap-2 items-start">
                <input
                  className="input-field"
                  placeholder="Duration (e.g. 2 Years)"
                  value={entry.duration || ''}
                  onChange={(e) => setTimelineEntry(idx, 'duration', e.target.value)}
                />
                <input
                  className="input-field"
                  placeholder="Organization (e.g. Fortis Noida)"
                  value={entry.organization || ''}
                  onChange={(e) => setTimelineEntry(idx, 'organization', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeTimelineEntry(idx)}
                  className="shrink-0 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  aria-label="Remove experience"
                >
                  <FaIcon icon="fa-trash-can" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
