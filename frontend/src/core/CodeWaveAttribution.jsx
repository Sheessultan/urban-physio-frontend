import { CODEWAVE_ATTRIBUTION, CODEWAVE_DEVELOPER, CODEWAVE_LICENSE_MARKER, CODEWAVE_URL } from './codewaveLicense';

/**
 * Mandatory developer attribution — mounted by LicenseGate and Footer.
 * Removing this component or its marker will block the entire site.
 */
export default function CodeWaveAttribution({ className = '', variant = 'footer' }) {
  const isFooter = variant === 'footer';

  return (
    <p
      data-codewave-license={CODEWAVE_LICENSE_MARKER}
      className={
        className ||
        (isFooter
          ? 'text-primary-200/80 text-center sm:text-right'
          : 'sr-only fixed bottom-0 left-0 w-px h-px overflow-hidden opacity-[0.01] pointer-events-none')
      }
      aria-label={CODEWAVE_ATTRIBUTION}
    >
      Designed &amp; Developed by{' '}
      <a href={CODEWAVE_URL} target="_blank" rel="noopener noreferrer" className={isFooter ? 'hover:text-white transition underline-offset-2 hover:underline' : ''}>
        {CODEWAVE_DEVELOPER}
      </a>
    </p>
  );
}
