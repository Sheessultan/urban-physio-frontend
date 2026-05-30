import { useCallback, useEffect, useState } from 'react';
import AdminDashboardLayout from '../../layouts/AdminDashboardLayout';
import FaIcon from '../../components/FaIcon';
import { admin } from '../../services/api';
import toast from 'react-hot-toast';

const empty = () => ({
  business_name: '',
  tagline: '',
  address: '',
  city_state: '',
  phone: '',
  email: '',
  website: '',
  gstin: '',
  pan: '',
  logo_url: '',
  footer_note: '',
  terms_text: '',
  bank_name: '',
  bank_account: '',
  bank_ifsc: '',
  show_gst: false,
  tax_percent: 0,
});

export default function AdminInvoiceSettings() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    admin
      .invoiceSettings()
      .then((res) => setForm({ ...empty(), ...(res.data || res) }))
      .catch((e) => toast.error(e.message || 'Could not load settings'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await admin.updateInvoiceSettings({
        ...form,
        show_gst: !!form.show_gst,
        tax_percent: Number(form.tax_percent) || 0,
      });
      toast.success('Invoice settings saved — new invoices will use these details');
      load();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Invoice settings</h1>
        <p className="text-slate-600 text-sm mb-8">
          Control business name, address, GST, bank details, and footer text on every patient invoice.
        </p>

        {loading ? (
          <div className="glass-card h-64 animate-pulse bg-white/40" />
        ) : (
          <form onSubmit={save} className="glass-card !p-6 md:!p-8 space-y-6">
            <section>
              <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <FaIcon icon="fa-building" className="text-primary-600" />
                Business details
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  className="input-field sm:col-span-2"
                  placeholder="Business name *"
                  value={form.business_name}
                  onChange={(e) => set('business_name', e.target.value)}
                  required
                />
                <input
                  className="input-field sm:col-span-2"
                  placeholder="Tagline"
                  value={form.tagline}
                  onChange={(e) => set('tagline', e.target.value)}
                />
                <textarea
                  className="input-field sm:col-span-2"
                  rows={2}
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                />
                <input
                  className="input-field"
                  placeholder="City, State"
                  value={form.city_state}
                  onChange={(e) => set('city_state', e.target.value)}
                />
                <input
                  className="input-field"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                />
                <input
                  className="input-field"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                />
                <input
                  className="input-field"
                  placeholder="Website URL"
                  value={form.website}
                  onChange={(e) => set('website', e.target.value)}
                />
                <input
                  className="input-field sm:col-span-2"
                  placeholder="Logo URL (optional)"
                  value={form.logo_url}
                  onChange={(e) => set('logo_url', e.target.value)}
                />
              </div>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <FaIcon icon="fa-file-invoice" className="text-violet-600" />
                Tax & legal
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  className="input-field"
                  placeholder="GSTIN"
                  value={form.gstin}
                  onChange={(e) => set('gstin', e.target.value)}
                />
                <input
                  className="input-field"
                  placeholder="PAN"
                  value={form.pan}
                  onChange={(e) => set('pan', e.target.value)}
                />
                <label className="sm:col-span-2 flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.show_gst}
                    onChange={(e) => set('show_gst', e.target.checked)}
                    className="rounded border-slate-300 text-primary-600"
                  />
                  Show GST on invoices
                </label>
                {form.show_gst && (
                  <input
                    className="input-field"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="GST %"
                    value={form.tax_percent}
                    onChange={(e) => set('tax_percent', e.target.value)}
                  />
                )}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <FaIcon icon="fa-building-columns" className="text-emerald-600" />
                Bank (optional)
              </h2>
              <div className="grid sm:grid-cols-3 gap-3">
                <input
                  className="input-field"
                  placeholder="Bank name"
                  value={form.bank_name}
                  onChange={(e) => set('bank_name', e.target.value)}
                />
                <input
                  className="input-field"
                  placeholder="Account number"
                  value={form.bank_account}
                  onChange={(e) => set('bank_account', e.target.value)}
                />
                <input
                  className="input-field"
                  placeholder="IFSC"
                  value={form.bank_ifsc}
                  onChange={(e) => set('bank_ifsc', e.target.value)}
                />
              </div>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-800 mb-3">Footer & terms</h2>
              <textarea
                className="input-field mb-3"
                rows={2}
                placeholder="Footer note (thank you message)"
                value={form.footer_note}
                onChange={(e) => set('footer_note', e.target.value)}
              />
              <textarea
                className="input-field"
                rows={3}
                placeholder="Terms on invoice"
                value={form.terms_text}
                onChange={(e) => set('terms_text', e.target.value)}
              />
            </section>

            <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
              {saving ? 'Saving…' : 'Save invoice settings'}
            </button>
          </form>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
