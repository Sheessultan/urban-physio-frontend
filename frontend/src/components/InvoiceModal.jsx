import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import FaIcon from './FaIcon';
import { buildInvoiceHtml } from '../utils/invoiceDocument';
import { payments } from '../services/api';
import toast from 'react-hot-toast';

/**
 * In-app invoice viewer (no pop-up window — works when browser blocks pop-ups).
 */
export default function InvoiceModal({ appointmentId, open, onClose }) {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!open || !appointmentId) {
      setHtml('');
      return;
    }
    let cancelled = false;
    setLoading(true);
    payments
      .invoice(appointmentId)
      .then((res) => {
        if (cancelled) return;
        const data = res.data || res;
        setHtml(buildInvoiceHtml(data));
      })
      .catch((err) => {
        if (!cancelled) toast.error(err.message || 'Could not load invoice');
        onClose?.();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, appointmentId, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handlePrint = () => {
    try {
      iframeRef.current?.contentWindow?.print();
    } catch {
      toast.error('Could not open print dialog');
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10050] flex flex-col bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Invoice"
    >
      <div className="flex items-center justify-between gap-2 mb-2 shrink-0 max-w-4xl w-full mx-auto">
        <p className="text-white font-semibold text-sm sm:text-base flex items-center gap-2">
          <FaIcon icon="fa-file-invoice" />
          Invoice
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrint}
            disabled={loading || !html}
            className="btn-primary text-sm !py-2 !px-3 inline-flex items-center gap-1.5"
          >
            <FaIcon icon="fa-print" />
            Print / PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/90 text-slate-800 px-3 py-2 text-sm font-medium hover:bg-white"
          >
            <FaIcon icon="fa-xmark" />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 max-w-4xl w-full mx-auto bg-white rounded-xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-500">
            <FaIcon icon="fa-spinner" className="fa-spin text-2xl text-primary-600 mr-2" />
            Loading invoice…
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            title="Invoice"
            srcDoc={html}
            className="w-full h-full border-0 min-h-[70vh]"
            sandbox="allow-same-origin allow-scripts allow-modals"
          />
        )}
      </div>
    </div>,
    document.body
  );
}
