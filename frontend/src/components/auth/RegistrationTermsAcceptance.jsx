import { Link } from 'react-router-dom';
import FaIcon from '../FaIcon';

const MEDICO_LEGAL_PATH = '/medico-legal-terms';

/**
 * @param {{
 *   portal: object,
 *   accepted: boolean,
 *   onChange: (checked: boolean) => void,
 *   medicoAccepted?: boolean,
 *   onMedicoChange?: (checked: boolean) => void,
 * }} props
 */
export default function RegistrationTermsAcceptance({
  portal,
  accepted,
  onChange,
  medicoAccepted = false,
  onMedicoChange,
}) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Legal agreement</p>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          className="mt-1 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          checked={accepted}
          onChange={(e) => onChange(e.target.checked)}
          required
        />
        <span className="text-sm text-slate-700 leading-relaxed">
          I have read and agree to the{' '}
          <Link to={portal.termsPath} target="_blank" className="font-semibold text-primary-600 hover:underline">
            {portal.termsLabel}
          </Link>
          ,{' '}
          <Link to="/terms-and-conditions" target="_blank" className="font-semibold text-primary-600 hover:underline">
            Terms &amp; Conditions
          </Link>
          , and{' '}
          <Link to="/privacy-policy" target="_blank" className="font-semibold text-primary-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      {portal.requireMedicoLegal && onMedicoChange && (
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="mt-1 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            checked={medicoAccepted}
            onChange={(e) => onMedicoChange(e.target.checked)}
            required
          />
          <span className="text-sm text-slate-700 leading-relaxed">
            I accept the{' '}
            <Link to={MEDICO_LEGAL_PATH} target="_blank" className="font-semibold text-primary-600 hover:underline">
              Medico-Legal Terms
            </Link>{' '}
            governing clinical practice, patient data, and professional liability on this platform.
            <FaIcon icon="fa-scale-balanced" className="ml-1 text-slate-400 text-xs" />
          </span>
        </label>
      )}
    </div>
  );
}

export function registrationTermsValid(portal, accepted, medicoAccepted) {
  if (!accepted) return false;
  if (portal.requireMedicoLegal && !medicoAccepted) return false;
  return true;
}
