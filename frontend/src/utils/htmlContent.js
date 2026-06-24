/** Detect & sanitize CMS HTML for public display. */

export function isHtmlContent(text) {
  if (!text || typeof text !== 'string') return false;
  return /<[a-z][\s\S]*>/i.test(text.trim());
}

export function sanitizeHtml(html) {
  if (!html) return '';
  if (typeof document === 'undefined') return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style, iframe, object, embed, form').forEach((el) => el.remove());
  doc.querySelectorAll('*').forEach((el) => {
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const val = (attr.value || '').trim().toLowerCase();
      if (name.startsWith('on') || (name === 'href' && val.startsWith('javascript:'))) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return doc.body.innerHTML;
}

/** Plain text (legacy) → breaks; HTML → sanitized. */
export function cmsContentToHtml(content) {
  if (!content) return '';
  if (isHtmlContent(content)) return sanitizeHtml(content);
  return sanitizeHtml(
    content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
  );
}
