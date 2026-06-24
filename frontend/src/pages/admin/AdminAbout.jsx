import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminDashboardLayout from '../../layouts/AdminDashboardLayout';
import FaIcon from '../../components/FaIcon';
import RichTextEditor from '../../components/admin/RichTextEditor';
import MediaUrlOrUpload from '../../components/admin/MediaUrlOrUpload';
import { admin, uploadCmsImage } from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY_SECTIONS = {
  story_html: '',
  mission_title: 'Our Mission',
  mission_html: '',
  vision_title: 'Our Vision',
  vision_html: '',
  values: [],
  stats: [],
  cta_title: '',
  cta_text: '',
};

const ICON_OPTIONS = [
  'fa-circle-check',
  'fa-heart-pulse',
  'fa-map-location-dot',
  'fa-lock',
  'fa-user-doctor',
  'fa-hospital',
  'fa-hand-holding-medical',
  'fa-star',
];

export default function AdminAbout() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    hero_title: '',
    hero_subtitle: '',
    hero_image: '',
    seo_title: '',
    seo_description: '',
    sections: { ...EMPTY_SECTIONS },
  });

  useEffect(() => {
    admin
      .aboutSettings()
      .then((res) => {
        const d = res.data ?? res;
        setForm({
          hero_title: d.hero_title || '',
          hero_subtitle: d.hero_subtitle || '',
          hero_image: d.hero_image || '',
          seo_title: d.seo_title || '',
          seo_description: d.seo_description || '',
          sections: { ...EMPTY_SECTIONS, ...(d.sections || {}) },
        });
      })
      .catch((e) => toast.error(e.message || 'Could not load About page'))
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setSection = (k, v) => setForm((f) => ({ ...f, sections: { ...f.sections, [k]: v } }));

  const updateValue = (idx, field, value) => {
    const next = [...(form.sections.values || [])];
    next[idx] = { ...next[idx], [field]: value };
    setSection('values', next);
  };

  const updateStat = (idx, field, value) => {
    const next = [...(form.sections.stats || [])];
    next[idx] = { ...next[idx], [field]: value };
    setSection('stats', next);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await admin.updateAboutSettings(form);
      toast.success('About page published to website');
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="glass-card p-12 text-center text-slate-500">
          <FaIcon icon="fa-spinner" className="fa-spin text-2xl mb-2" />
          Loading About page…
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="rounded-3xl border border-orange-200/60 bg-gradient-to-br from-orange-50 via-white to-primary-50/80 p-5 sm:p-7 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-1">Website CMS</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">About Us page</h1>
            <p className="text-sm text-slate-600 mt-1">
              Edit all content on{' '}
              <Link to="/about" target="_blank" className="text-primary-700 font-semibold hover:underline">
                /about
              </Link>
            </p>
          </div>
          <Link to="/about" target="_blank" className="btn-outline text-sm shrink-0 inline-flex items-center gap-2">
            <FaIcon icon="fa-arrow-up-right-from-square" />
            Preview page
          </Link>
        </div>
      </div>

      <form onSubmit={save} className="space-y-6 max-w-4xl">
        <section className="glass-card p-5 sm:p-6 space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <FaIcon icon="fa-flag" className="text-primary-600" />
            Hero section
          </h2>
          <input
            className="input-field"
            placeholder="Page title"
            value={form.hero_title}
            onChange={(e) => set('hero_title', e.target.value)}
          />
          <textarea
            className="input-field min-h-[80px]"
            placeholder="Subtitle / intro"
            value={form.hero_subtitle}
            onChange={(e) => set('hero_subtitle', e.target.value)}
          />
          <MediaUrlOrUpload
            label="Hero background image (optional)"
            hint="Shown behind hero — URL or upload"
            icon="fa-image"
            urlValue={form.hero_image}
            onUrlChange={(v) => set('hero_image', v)}
            onUpload={uploadCmsImage}
            accept="image/jpeg,image/png,image/webp"
            maxMb={4}
            preview="image"
          />
        </section>

        <section className="glass-card p-5 sm:p-6 space-y-3">
          <h2 className="font-bold text-slate-900">Our story</h2>
          <RichTextEditor value={form.sections.story_html} onChange={(v) => setSection('story_html', v)} />
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          <section className="glass-card p-5 sm:p-6 space-y-3">
            <input
              className="input-field font-semibold"
              value={form.sections.mission_title}
              onChange={(e) => setSection('mission_title', e.target.value)}
            />
            <RichTextEditor value={form.sections.mission_html} onChange={(v) => setSection('mission_html', v)} minHeight={140} />
          </section>
          <section className="glass-card p-5 sm:p-6 space-y-3">
            <input
              className="input-field font-semibold"
              value={form.sections.vision_title}
              onChange={(e) => setSection('vision_title', e.target.value)}
            />
            <RichTextEditor value={form.sections.vision_html} onChange={(v) => setSection('vision_html', v)} minHeight={140} />
          </section>
        </div>

        <section className="glass-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-slate-900">Stats</h2>
            <button
              type="button"
              className="btn-outline text-xs !py-1.5"
              onClick={() => setSection('stats', [...(form.sections.stats || []), { label: '', value: '' }])}
            >
              <FaIcon icon="fa-plus" /> Add stat
            </button>
          </div>
          {(form.sections.stats || []).map((s, i) => (
            <div key={i} className="grid sm:grid-cols-[1fr_8rem_auto] gap-2 items-center">
              <input
                className="input-field text-sm"
                placeholder="Label"
                value={s.label}
                onChange={(e) => updateStat(i, 'label', e.target.value)}
              />
              <input
                className="input-field text-sm"
                placeholder="Value"
                value={s.value}
                onChange={(e) => updateStat(i, 'value', e.target.value)}
              />
              <button
                type="button"
                className="text-red-600 text-sm px-2"
                onClick={() => setSection('stats', form.sections.stats.filter((_, j) => j !== i))}
                aria-label="Remove"
              >
                <FaIcon icon="fa-trash" />
              </button>
            </div>
          ))}
        </section>

        <section className="glass-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-slate-900">Core values</h2>
            <button
              type="button"
              className="btn-outline text-xs !py-1.5"
              onClick={() =>
                setSection('values', [
                  ...(form.sections.values || []),
                  { icon: 'fa-circle-check', title: '', description: '' },
                ])
              }
            >
              <FaIcon icon="fa-plus" /> Add value
            </button>
          </div>
          {(form.sections.values || []).map((v, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4 space-y-2 relative">
              <button
                type="button"
                className="absolute top-3 right-3 text-red-500 text-sm"
                onClick={() => setSection('values', form.sections.values.filter((_, j) => j !== i))}
              >
                <FaIcon icon="fa-trash" />
              </button>
              <select
                className="input-field text-sm max-w-[12rem]"
                value={v.icon}
                onChange={(e) => updateValue(i, 'icon', e.target.value)}
              >
                {ICON_OPTIONS.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic.replace('fa-', '')}
                  </option>
                ))}
              </select>
              <input
                className="input-field text-sm"
                placeholder="Title"
                value={v.title}
                onChange={(e) => updateValue(i, 'title', e.target.value)}
              />
              <textarea
                className="input-field text-sm min-h-[60px]"
                placeholder="Description"
                value={v.description}
                onChange={(e) => updateValue(i, 'description', e.target.value)}
              />
            </div>
          ))}
        </section>

        <section className="glass-card p-5 sm:p-6 space-y-3">
          <h2 className="font-bold text-slate-900">Call to action</h2>
          <input
            className="input-field"
            placeholder="CTA heading"
            value={form.sections.cta_title}
            onChange={(e) => setSection('cta_title', e.target.value)}
          />
          <textarea
            className="input-field min-h-[72px]"
            placeholder="CTA text"
            value={form.sections.cta_text}
            onChange={(e) => setSection('cta_text', e.target.value)}
          />
        </section>

        <section className="glass-card p-5 sm:p-6 space-y-3 border-dashed border-violet-200">
          <h2 className="font-bold text-violet-900 text-sm">SEO</h2>
          <input className="input-field text-sm" value={form.seo_title} onChange={(e) => set('seo_title', e.target.value)} placeholder="SEO title" />
          <textarea className="input-field text-sm min-h-[60px]" value={form.seo_description} onChange={(e) => set('seo_description', e.target.value)} placeholder="SEO description" />
        </section>

        <div className="flex flex-wrap gap-3 sticky bottom-4 z-10">
          <button type="submit" disabled={saving} className="btn-primary !px-8">
            {saving ? 'Saving…' : 'Save About page'}
          </button>
        </div>
      </form>
    </AdminDashboardLayout>
  );
}
