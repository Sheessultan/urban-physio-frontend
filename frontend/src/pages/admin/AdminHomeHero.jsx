import { useCallback, useEffect, useState } from 'react';
import AdminDashboardLayout from '../../layouts/AdminDashboardLayout';
import FaIcon from '../../components/FaIcon';
import { admin } from '../../services/api';
import { unwrapApiData } from '../../utils/contactText';
import toast from 'react-hot-toast';

const DEFAULT_PILLS = [
  { label: 'Online Meet', icon: 'fa-video' },
  { label: 'Clinic Visit', icon: 'fa-hospital' },
  { label: 'Home Care', icon: 'fa-house-medical' },
  { label: 'Rehab Plans', icon: 'fa-notes-medical' },
];

const empty = () => ({
  badge_text: '',
  title_prefix: '',
  title_highlight: '',
  subtitle: '',
  popular_tags: [],
  feature_pills: DEFAULT_PILLS,
});

export default function AdminHomeHero() {
  const [form, setForm] = useState(empty);
  const [tagsText, setTagsText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    admin
      .heroSettings()
      .then((res) => {
        const d = unwrapApiData(res);
        const tags = Array.isArray(d.popular_tags) ? d.popular_tags : [];
        const pills = Array.isArray(d.feature_pills) && d.feature_pills.length ? d.feature_pills : DEFAULT_PILLS;
        setForm({
          badge_text: d.badge_text || '',
          title_prefix: d.title_prefix || '',
          title_highlight: d.title_highlight || '',
          subtitle: d.subtitle || '',
          popular_tags: tags,
          feature_pills: pills,
        });
        setTagsText(tags.join('\n'));
      })
      .catch((e) => toast.error(e.message || 'Could not load hero settings'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const setPill = (index, key, value) => {
    setForm((f) => {
      const pills = [...(f.feature_pills || [])];
      pills[index] = { ...pills[index], [key]: value };
      return { ...f, feature_pills: pills };
    });
  };

  const addPill = () => {
    setForm((f) => ({
      ...f,
      feature_pills: [...(f.feature_pills || []), { label: '', icon: 'fa-circle' }],
    }));
  };

  const removePill = (index) => {
    setForm((f) => ({
      ...f,
      feature_pills: (f.feature_pills || []).filter((_, i) => i !== index),
    }));
  };

  const save = async (e) => {
    e.preventDefault();
    const tags = tagsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    setSaving(true);
    try {
      await admin.updateHeroSettings({
        ...form,
        popular_tags: tags,
        feature_pills: (form.feature_pills || []).filter((p) => p.label?.trim()),
      });
      toast.success('Homepage hero saved');
      load();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FaIcon icon="fa-house-medical-circle-check" className="text-orange-600" />
            Homepage hero
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Edit the main banner on the home page — badge, headline, search tags, and feature pills.
          </p>
        </div>

        {loading ? (
          <div className="glass-card h-72 animate-pulse bg-white/40" />
        ) : (
          <form onSubmit={save} className="glass-card !p-6 md:!p-8 space-y-6">
            <section>
              <h2 className="text-sm font-bold text-slate-800 mb-3">Top badge</h2>
              <input
                className="input-field"
                placeholder="#1 Physio Platform in India"
                value={form.badge_text}
                onChange={(e) => set('badge_text', e.target.value)}
              />
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-800 mb-3">Headline</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  className="input-field"
                  placeholder="Heal Faster with"
                  value={form.title_prefix}
                  onChange={(e) => set('title_prefix', e.target.value)}
                />
                <input
                  className="input-field"
                  placeholder="Premium Care (highlighted)"
                  value={form.title_highlight}
                  onChange={(e) => set('title_highlight', e.target.value)}
                />
              </div>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-800 mb-3">Subtitle</h2>
              <textarea
                className="input-field"
                rows={3}
                value={form.subtitle}
                onChange={(e) => set('subtitle', e.target.value)}
              />
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-800 mb-3">Popular search tags</h2>
              <p className="text-xs text-slate-500 mb-2">One tag per line — shown below the search bar.</p>
              <textarea
                className="input-field font-mono text-sm"
                rows={4}
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
              />
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-800">Feature pills</h2>
                <button type="button" onClick={addPill} className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                  + Add pill
                </button>
              </div>
              <div className="space-y-2">
                {(form.feature_pills || []).map((pill, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      className="input-field flex-1"
                      placeholder="Label"
                      value={pill.label}
                      onChange={(e) => setPill(i, 'label', e.target.value)}
                    />
                    <input
                      className="input-field w-36"
                      placeholder="fa-video"
                      value={pill.icon}
                      onChange={(e) => setPill(i, 'icon', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removePill(i)}
                      className="p-2 text-slate-400 hover:text-red-600"
                      aria-label="Remove"
                    >
                      <FaIcon icon="fa-trash" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
              {saving ? 'Saving…' : 'Save homepage hero'}
            </button>
          </form>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
