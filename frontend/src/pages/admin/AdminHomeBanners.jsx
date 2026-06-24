import { useCallback, useEffect, useState } from 'react';
import AdminDashboardLayout from '../../layouts/AdminDashboardLayout';
import FaIcon from '../../components/FaIcon';
import MediaUrlOrUpload from '../../components/admin/MediaUrlOrUpload';
import { admin, uploadCmsImage } from '../../services/api';
import { unwrapApiData } from '../../utils/contactText';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import toast from 'react-hot-toast';

const MAX_SLIDES = 20;
const MIN_SLIDES = 2;

const DESKTOP_HINT = 'Desktop: 1920 × 480 px (4:1 wide) · JPG, PNG or WebP · max 4 MB';
const MOBILE_HINT = 'Mobile: 828 × 420 px (~2:1) · JPG, PNG or WebP · max 4 MB';

function newSlide(order = 0) {
  return {
    id: `slide_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    desktop_image: '',
    mobile_image: '',
    alt_text: '',
    link_url: '',
    sort_order: order,
  };
}

export default function AdminHomeBanners() {
  const [enabled, setEnabled] = useState(false);
  const [slides, setSlides] = useState([newSlide(0), newSlide(1)]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    admin
      .homeBannerSettings()
      .then((res) => {
        const d = unwrapApiData(res);
        setEnabled(!!d.is_enabled);
        const list = Array.isArray(d.slides) && d.slides.length ? d.slides : [newSlide(0), newSlide(1)];
        setSlides(list);
      })
      .catch((e) => toast.error(e.message || 'Could not load banner settings'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setSlide = (index, key, value) => {
    setSlides((list) => list.map((s, i) => (i === index ? { ...s, [key]: value } : s)));
  };

  const addSlide = () => {
    if (slides.length >= MAX_SLIDES) {
      toast.error(`Maximum ${MAX_SLIDES} slides`);
      return;
    }
    setSlides((list) => [...list, newSlide(list.length)]);
  };

  const removeSlide = (index) => {
    setSlides((list) => list.filter((_, i) => i !== index));
  };

  const moveSlide = (index, dir) => {
    setSlides((list) => {
      const next = [...list];
      const j = index + dir;
      if (j < 0 || j >= next.length) return list;
      [next[index], next[j]] = [next[j], next[index]];
      return next.map((s, i) => ({ ...s, sort_order: i }));
    });
  };

  const completeSlides = slides.filter((s) => s.desktop_image?.trim() && s.mobile_image?.trim());

  const save = async (e) => {
    e.preventDefault();
    if (enabled && completeSlides.length < MIN_SLIDES) {
      toast.error(`When banner is ON, add at least ${MIN_SLIDES} slides with desktop + mobile images`);
      return;
    }
    setSaving(true);
    try {
      await admin.updateHomeBannerSettings({
        is_enabled: enabled,
        slides: slides.map((s, i) => ({ ...s, sort_order: i })),
      });
      toast.success(enabled ? 'Homepage banner published' : 'Homepage banner saved (hidden)');
      load();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FaIcon icon="fa-images" className="text-orange-600" />
            Homepage banner
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Carousel below the hero on the home page. Min {MIN_SLIDES} slides, max {MAX_SLIDES}. Use separate images for
            desktop and mobile.
          </p>
        </div>

        {loading ? (
          <div className="glass-card h-72 animate-pulse bg-white/40" />
        ) : (
          <form onSubmit={save} className="glass-card !p-6 md:!p-8 space-y-6">
            <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4 text-sm text-sky-900 space-y-1">
              <p className="font-bold flex items-center gap-2">
                <FaIcon icon="fa-ruler-combined" />
                Recommended image sizes
              </p>
              <p>
                <strong>Desktop:</strong> {DESKTOP_HINT}
              </p>
              <p>
                <strong>Mobile:</strong> {MOBILE_HINT}
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <span>
                <span className="font-semibold text-slate-900 block">Show banner on homepage</span>
                <span className="text-xs text-slate-500">
                  When off, banner is hidden even if slides are saved. When on, at least {MIN_SLIDES} complete slides
                  required.
                </span>
              </span>
            </label>

            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-800">
                Slides ({completeSlides.length}/{slides.length} ready)
              </h2>
              <button
                type="button"
                onClick={addSlide}
                disabled={slides.length >= MAX_SLIDES}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-40"
              >
                + Add slide
              </button>
            </div>

            <div className="space-y-5">
              {slides.map((slide, index) => (
                <div key={slide.id || index} className="rounded-2xl border border-slate-200 bg-white/80 p-4 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-slate-800 text-sm">Slide {index + 1}</p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveSlide(index, -1)}
                        disabled={index === 0}
                        className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <FaIcon icon="fa-chevron-up" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSlide(index, 1)}
                        disabled={index === slides.length - 1}
                        className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <FaIcon icon="fa-chevron-down" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSlide(index)}
                        disabled={slides.length <= MIN_SLIDES}
                        className="p-2 text-slate-400 hover:text-red-600 disabled:opacity-30"
                        aria-label="Remove slide"
                      >
                        <FaIcon icon="fa-trash" />
                      </button>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-4">
                    <MediaUrlOrUpload
                      label="Desktop banner"
                      hint={DESKTOP_HINT}
                      icon="fa-desktop"
                      urlValue={slide.desktop_image}
                      onUrlChange={(v) => setSlide(index, 'desktop_image', v)}
                      onUpload={uploadCmsImage}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      preview="image"
                      accent="rose"
                    />
                    <MediaUrlOrUpload
                      label="Mobile banner"
                      hint={MOBILE_HINT}
                      icon="fa-mobile-screen"
                      urlValue={slide.mobile_image}
                      onUrlChange={(v) => setSlide(index, 'mobile_image', v)}
                      onUpload={uploadCmsImage}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      preview="image"
                      accent="violet"
                    />
                  </div>

                  {(slide.desktop_image || slide.mobile_image) && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {slide.desktop_image && (
                        <div className="rounded-xl overflow-hidden border border-slate-200 aspect-[4/1] bg-slate-100">
                          <img
                            src={resolveMediaUrl(slide.desktop_image) || slide.desktop_image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {slide.mobile_image && (
                        <div className="rounded-xl overflow-hidden border border-slate-200 aspect-[828/420] bg-slate-100 max-w-xs">
                          <img
                            src={resolveMediaUrl(slide.mobile_image) || slide.mobile_image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      className="input-field text-sm"
                      placeholder="Alt text (accessibility)"
                      value={slide.alt_text || ''}
                      onChange={(e) => setSlide(index, 'alt_text', e.target.value)}
                    />
                    <input
                      className="input-field text-sm"
                      placeholder="Optional link (https://… or /book)"
                      value={slide.link_url || ''}
                      onChange={(e) => setSlide(index, 'link_url', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
              {saving ? 'Saving…' : 'Save homepage banner'}
            </button>
          </form>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
