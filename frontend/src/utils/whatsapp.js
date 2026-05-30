/** Digits only for wa.me links (expects country code, e.g. 919876543210). */
export function whatsappDigits(raw) {
  if (!raw) return '';
  let digits = String(raw).replace(/\D/g, '');
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return digits;
}

export function whatsappChatUrl(raw, message = '') {
  const digits = whatsappDigits(raw);
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  const text = message.trim();
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
