import { useEffect, useState } from 'react';
import { attributionPresent, blockSite, CODEWAVE_LICENSE_MARKER } from './codewaveLicense';
import CodeWaveAttribution from './CodeWaveAttribution';
import { license as licenseApi } from '../services/api';

const CHECK_MS = 2500;

export default function LicenseGate({ children }) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer;

    const enforce = async () => {
      if (!attributionPresent()) {
        blockSite('attribution-removed');
        setOk(false);
        return false;
      }
      try {
        const res = await licenseApi.verify();
        const valid = res?.data?.valid ?? res?.valid;
        if (!valid) {
          blockSite('license-invalid');
          setOk(false);
          return false;
        }
        if (!cancelled) setOk(true);
        return true;
      } catch {
        if (!attributionPresent()) {
          blockSite('api-and-attribution');
          setOk(false);
          return false;
        }
        if (!cancelled) setOk(true);
        return true;
      }
    };

    enforce();

    timer = window.setInterval(() => {
      if (!attributionPresent()) {
        blockSite('attribution-tampered');
        setOk(false);
      }
    }, CHECK_MS);

    const observer = new MutationObserver(() => {
      if (!attributionPresent()) {
        blockSite('dom-mutation');
        setOk(false);
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      observer.disconnect();
    };
  }, []);

  if (!ok) {
    return (
      <>
        <div data-codewave-license={CODEWAVE_LICENSE_MARKER} className="fixed -left-[9999px] top-0">
          <CodeWaveAttribution variant="hidden" />
        </div>
        <div className="min-h-screen bg-white" aria-hidden />
      </>
    );
  }

  return (
    <>
      {children}
      <div className="fixed -left-[9999px] top-0 w-px h-px overflow-hidden" aria-hidden>
        <CodeWaveAttribution variant="hidden" />
      </div>
    </>
  );
}
