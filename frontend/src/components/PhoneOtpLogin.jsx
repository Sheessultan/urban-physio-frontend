import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import FaIcon from './FaIcon';
import { auth } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { navigateAfterAuth } from '../utils/authRedirect';

const RESEND_COOLDOWN = 60;

function deliveryHint(channel, phoneMasked, emailMasked) {
  if (channel === 'sms') {
    return `OTP sent via SMS to ${phoneMasked || 'your mobile'}`;
  }
  if (channel === 'whatsapp') {
    return `OTP sent via WhatsApp to ${phoneMasked || 'your mobile'}`;
  }
  return `OTP sent to ${emailMasked || 'your registered email'}`;
}

export default function PhoneOtpLogin({ redirectTo, defaultRole = 'patient', fixedRole = null }) {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(fixedRole || defaultRole);
  const [emailMasked, setEmailMasked] = useState('');
  const [phoneMasked, setPhoneMasked] = useState('');
  const [deliveryChannel, setDeliveryChannel] = useState('sms');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef([]);
  const { phoneVerifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (fixedRole) setRole(fixedRole);
  }, [fixedRole]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const applyDeliveryMeta = (res) => {
    const data = res?.data ?? res ?? {};
    const channel = data.delivery_channel || 'sms';
    setDeliveryChannel(channel);
    if (data.phone_masked) setPhoneMasked(data.phone_masked);
    if (data.email_masked) setEmailMasked(data.email_masked);
    return deliveryHint(channel, data.phone_masked, data.email_masked);
  };

  const sendOtp = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await auth.phoneSendOtp({ phone, role });
      const hint = applyDeliveryMeta(res);
      toast.success(res?.message || hint);
      setStep('otp');
      setCooldown(RESEND_COOLDOWN);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.message || 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Enter 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const user = await phoneVerifyOtp(phone, code, role);
      toast.success('Welcome back!');
      navigateAfterAuth(navigate, user, redirectTo || location.state?.from);
    } catch (err) {
      toast.error(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      const res = await auth.phoneResendOtp({ phone, role });
      const hint = applyDeliveryMeta(res);
      toast.success(res?.message || hint);
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const otpDestination = phoneMasked || `+91 ${phone.replace(/\D/g, '').slice(-10)}`;

  if (step === 'otp') {
    return (
      <form onSubmit={verifyOtp} className="space-y-4">
        <p className="text-sm text-slate-600">
          OTP sent to your mobile <strong>{otpDestination}</strong>
          {deliveryChannel === 'whatsapp' && (
            <span className="block text-xs text-slate-500 mt-1">Delivered via WhatsApp</span>
          )}
          <button type="button" className="mt-2 text-primary-600 text-xs font-medium" onClick={() => setStep('phone')}>
            Change number
          </button>
        </p>
        <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
          {otp.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="w-11 h-12 text-center text-lg font-bold input-field !py-2"
              value={d}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
              }}
            />
          ))}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Verifying…' : 'Verify & Sign In'}
        </button>
        <p className="text-center text-sm text-slate-500">
          {cooldown > 0 ? (
            <>Resend in {cooldown}s</>
          ) : (
            <button type="button" className="text-primary-600 font-medium" onClick={resend} disabled={loading}>
              Resend OTP
            </button>
          )}
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={sendOtp} className="space-y-4">
      {!fixedRole && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">I am a</label>
          <div className="grid grid-cols-2 gap-2">
            {['patient', 'doctor'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2.5 rounded-xl text-sm font-semibold border transition capitalize ${
                  role === r
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-primary-300'
                }`}
              >
                <FaIcon icon={r === 'doctor' ? 'fa-user-doctor' : 'fa-user'} className="mr-1.5" />
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Mobile number</label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-600 text-sm">
            +91
          </span>
          <input
            type="tel"
            className="input-field rounded-l-none flex-1"
            placeholder="10-digit mobile"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            required
            maxLength={10}
            pattern="[0-9]{10}"
          />
        </div>
      </div>
      <button type="submit" disabled={loading || phone.replace(/\D/g, '').length !== 10} className="btn-primary w-full">
        {loading ? 'Sending OTP…' : 'Send OTP to mobile'}
      </button>
      <p className="text-xs text-slate-500 text-center">
        A 6-digit OTP is sent only to your registered mobile number (SMS or WhatsApp).
      </p>
    </form>
  );
}
