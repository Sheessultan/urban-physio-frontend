/** Legal & policy pages — content for The Urban Physio (India) */

export const POLICY_LAST_UPDATED = '23 May 2026';

export const ALL_POLICIES = [
  { key: 'privacy', path: '/privacy-policy', label: 'Privacy Policy', icon: 'fa-shield-halved' },
  { key: 'terms', path: '/terms-and-conditions', label: 'Terms & Conditions', icon: 'fa-file-contract' },
  { key: 'refund', path: '/refund-policy', label: 'Refund & Cancellation', icon: 'fa-rotate-left' },
  { key: 'medical', path: '/medical-disclaimer', label: 'Medical Disclaimer', icon: 'fa-heart-pulse' },
  { key: 'data-security', path: '/data-security', label: 'Data Security', icon: 'fa-lock' },
  { key: 'service', path: '/service-policy', label: 'Service Policy', icon: 'fa-handshake' },
  { key: 'cookie', path: '/cookie-policy', label: 'Cookie Policy', icon: 'fa-cookie-bite' },
];

export const POLICY_PAGES = {
  privacy: {
    key: 'privacy',
    path: '/privacy-policy',
    title: 'Privacy Policy',
    subtitle: 'How we collect, use, and protect your personal information on The Urban Physio platform.',
    icon: 'fa-shield-halved',
    accent: 'from-orange-600 to-primary-600',
    sections: [
      {
        id: 'introduction',
        title: '1. Introduction',
        paragraphs: [
          'The Urban Physio ("we", "us", "our") operates a digital healthcare platform connecting patients with licensed physiotherapists across India. This Privacy Policy explains how we handle personal data when you use our website, mobile experiences, and booking services.',
          'By registering, booking, or browsing our platform, you agree to the practices described here. If you do not agree, please discontinue use of our services.',
        ],
      },
      {
        id: 'data-we-collect',
        title: '2. Information We Collect',
        bullets: [
          'Identity & contact: name, email, phone number, city/location',
          'Account credentials: encrypted password, role (patient, doctor, admin)',
          'Health-related booking data: pain type, session preferences, appointment notes you provide',
          'Payment metadata: transaction IDs, amounts, status (processed via Razorpay — we do not store full card numbers)',
          'Technical data: IP address, browser type, device information, cookies (see Cookie Policy)',
          'Doctor profiles: license details, specialization, fees, availability, practice address',
        ],
      },
      {
        id: 'how-we-use',
        title: '3. How We Use Your Data',
        bullets: [
          'Facilitate appointment booking, confirmations, and reminders',
          'Process payments and generate invoices',
          'Verify doctor credentials and manage platform safety',
          'Improve our services, analytics, and customer support',
          'Comply with applicable Indian laws and lawful requests',
          'Send service-related communications (you may opt out of marketing where applicable)',
        ],
      },
      {
        id: 'sharing',
        title: '4. Sharing & Disclosure',
        paragraphs: [
          'We share necessary information with physiotherapists you book, payment partners (Razorpay), video session links for online consultations (e.g. Jitsi Meet), and infrastructure providers hosting our platform.',
          'We do not sell your personal data. We may disclose information when required by law, court order, or to protect rights, safety, and fraud prevention.',
        ],
      },
      {
        id: 'retention',
        title: '5. Data Retention',
        paragraphs: [
          'We retain account and booking records for as long as your account is active and as needed for legal, tax, and dispute-resolution purposes. You may request deletion subject to obligations we must keep (e.g. payment records).',
        ],
      },
      {
        id: 'rights',
        title: '6. Your Rights (India)',
        paragraphs: [
          'Under applicable Indian law including the Digital Personal Data Protection Act, 2023, you may have rights to access, correct, erase, and withdraw consent for certain processing. Contact us at support@theurbanphysio.com to exercise these rights.',
        ],
      },
      {
        id: 'children',
        title: '7. Children',
        paragraphs: [
          'Our services are intended for users 18 years and older. Minors may use the platform only with parental/guardian consent and supervision where permitted by law.',
        ],
      },
      {
        id: 'contact',
        title: '8. Contact Us',
        paragraphs: [
          'Data protection queries: support@theurbanphysio.com',
          'Postal address: The Urban Physio, India (full registered address to be updated on incorporation documents).',
        ],
      },
    ],
  },

  terms: {
    key: 'terms',
    path: '/terms-and-conditions',
    title: 'Terms & Conditions',
    subtitle: 'Rules governing your use of The Urban Physio website and services.',
    icon: 'fa-file-contract',
    accent: 'from-slate-700 to-primary-800',
    sections: [
      {
        id: 'acceptance',
        title: '1. Acceptance of Terms',
        paragraphs: [
          'These Terms & Conditions ("Terms") form a binding agreement between you and The Urban Physio. By accessing our platform, creating an account, or booking a session, you accept these Terms and our Privacy Policy.',
        ],
      },
      {
        id: 'services',
        title: '2. Platform Services',
        paragraphs: [
          'We provide an online marketplace connecting patients with independent, verified physiotherapists. We facilitate booking, payments, and session logistics but are not a hospital or clinical establishment unless explicitly stated for a partner clinic.',
          'Treatment is delivered by licensed professionals; outcomes depend on individual health conditions and adherence to care plans.',
        ],
      },
      {
        id: 'accounts',
        title: '3. User Accounts',
        bullets: [
          'You must provide accurate registration information and keep credentials confidential',
          'You are responsible for activity under your account',
          'Doctors must submit truthful credentials; false information may lead to termination and legal action',
          'We may suspend accounts for fraud, abuse, or policy violations',
        ],
      },
      {
        id: 'bookings',
        title: '4. Bookings & Payments',
        bullets: [
          'Appointment slots are subject to doctor availability and confirmation',
          'Fees are displayed before payment; applicable taxes may apply per Indian law',
          'Payments are processed through Razorpay; you agree to their terms as well',
          'Cancellations and refunds are governed by our Refund & Cancellation Policy',
        ],
      },
      {
        id: 'conduct',
        title: '5. Acceptable Use',
        bullets: [
          'No harassment, hate speech, or misuse of patient/doctor data',
          'No unauthorized scraping, hacking, or interference with platform operations',
          'No false reviews or manipulation of ratings',
          'Compliance with all applicable healthcare and telemedicine guidelines in your jurisdiction',
        ],
      },
      {
        id: 'ip',
        title: '6. Intellectual Property',
        paragraphs: [
          'All platform content, branding, software, and design are owned by The Urban Physio or licensors. You may not copy, modify, or distribute without written permission.',
        ],
      },
      {
        id: 'liability',
        title: '7. Limitation of Liability',
        paragraphs: [
          'To the maximum extent permitted by Indian law, we are not liable for indirect, incidental, or consequential damages. Our total liability for any claim relating to the platform shall not exceed the fees paid by you for the specific booking giving rise to the claim, except where liability cannot be limited by law.',
        ],
      },
      {
        id: 'disputes',
        title: '8. Governing Law & Disputes',
        paragraphs: [
          'These Terms are governed by the laws of India. Courts at Mumbai, Maharashtra shall have exclusive jurisdiction, subject to mandatory consumer protection forums where applicable.',
        ],
      },
    ],
  },

  refund: {
    key: 'refund',
    path: '/refund-policy',
    title: 'Refund & Cancellation Policy',
    subtitle: 'Clear guidelines for cancelling sessions and requesting refunds on The Urban Physio.',
    icon: 'fa-rotate-left',
    accent: 'from-emerald-600 to-teal-600',
    sections: [
      {
        id: 'overview',
        title: '1. Overview',
        paragraphs: [
          'We aim for fair, transparent cancellation rules that respect both patients and physiotherapists. Refund eligibility depends on who cancels, when, and payment status.',
        ],
      },
      {
        id: 'patient-cancel',
        title: '2. Patient-Initiated Cancellation',
        bullets: [
          'More than 24 hours before session: full refund to original payment method (5–7 business days via Razorpay)',
          '12–24 hours before session: 50% refund; balance retained as cancellation fee',
          'Less than 12 hours or no-show: no refund unless exceptional circumstances (see below)',
          'Online sessions: same windows apply based on scheduled start time (IST)',
        ],
      },
      {
        id: 'doctor-cancel',
        title: '3. Doctor / Provider Cancellation',
        bullets: [
          'If the physiotherapist or clinic cancels: 100% refund automatically initiated',
          'If rescheduled by provider with your consent: no refund; new slot confirmed in writing/email',
        ],
      },
      {
        id: 'home-visit',
        title: '4. Home Visit Specifics',
        bullets: [
          'Cancellation after therapist dispatch may incur up to 30% fee to cover travel',
          'Incorrect address or unreachable patient may be treated as no-show',
        ],
      },
      {
        id: 'process',
        title: '5. How to Request a Refund',
        paragraphs: [
          'Email support@theurbanphysio.com with booking ID (e.g. TUP-YYYYMMDD-XXXXXX), reason, and payment reference. Admin-reviewed refunds for edge cases are processed within 7–10 business days.',
        ],
      },
      {
        id: 'non-refundable',
        title: '6. Non-Refundable Cases',
        bullets: [
          'Completed sessions',
          'Partial sessions where treatment was delivered as agreed',
          'Chargebacks filed without prior support contact may lead to account suspension',
        ],
      },
    ],
  },

  medical: {
    key: 'medical',
    path: '/medical-disclaimer',
    title: 'Medical Disclaimer',
    subtitle: 'Important health information about using our platform and physiotherapy services.',
    icon: 'fa-heart-pulse',
    accent: 'from-rose-600 to-red-600',
    sections: [
      {
        id: 'not-emergency',
        title: '1. Not for Medical Emergencies',
        paragraphs: [
          'The Urban Physio is not an emergency service. If you experience chest pain, severe injury, numbness, loss of consciousness, or any life-threatening condition, call 112 / local emergency services immediately. Do not rely on online booking for urgent care.',
        ],
      },
      {
        id: 'professional-care',
        title: '2. Professional Judgment',
        paragraphs: [
          'Information on our website (treatments, conditions, FAQs) is educational and not a substitute for in-person diagnosis. Physiotherapists on our platform exercise independent clinical judgment during sessions.',
        ],
      },
      {
        id: 'no-guarantee',
        title: '3. No Guaranteed Outcomes',
        paragraphs: [
          'Recovery timelines vary by age, severity, compliance with exercises, and underlying conditions. We do not guarantee specific results from any treatment plan or number of sessions.',
        ],
      },
      {
        id: 'telehealth',
        title: '4. Online / Tele-Physiotherapy',
        bullets: [
          'Suitable for many musculoskeletal assessments and follow-ups; not appropriate for all conditions',
          'You must disclose relevant medical history, surgeries, and medications',
          'Therapist may recommend in-person or specialist referral if video assessment is insufficient',
        ],
      },
      {
        id: 'your-responsibility',
        title: '5. Your Responsibilities',
        bullets: [
          'Follow prescribed exercises within your physical limits; stop if sharp pain occurs',
          'Inform your therapist of pregnancy, osteoporosis, cardiac conditions, or other risks',
          'Obtain physician clearance post-surgery when advised',
        ],
      },
    ],
  },

  'data-security': {
    key: 'data-security',
    path: '/data-security',
    title: 'Data Security Policy',
    subtitle: 'Technical and organisational measures we use to safeguard your data.',
    icon: 'fa-lock',
    accent: 'from-orange-700 to-primary-800',
    sections: [
      {
        id: 'commitment',
        title: '1. Our Commitment',
        paragraphs: [
          'Protecting health and personal data is central to The Urban Physio. We implement security controls aligned with industry practice for healthcare technology platforms operating in India.',
        ],
      },
      {
        id: 'technical',
        title: '2. Technical Safeguards',
        bullets: [
          'HTTPS/TLS encryption for data in transit',
          'Password hashing (bcrypt) — we do not store plain-text passwords',
          'JWT-based authenticated API access with role-based permissions',
          'Payment card data handled only by PCI-DSS compliant Razorpay; not stored on our servers',
          'Regular dependency updates and secure hosting configuration',
        ],
      },
      {
        id: 'access',
        title: '3. Access Controls',
        bullets: [
          'Admin access limited to authorised personnel with audit logging',
          'Doctors access only their patients and appointments',
          'Patients access only their own records',
        ],
      },
      {
        id: 'incidents',
        title: '4. Incident Response',
        paragraphs: [
          'We maintain procedures to detect, contain, and notify affected users of data breaches as required by applicable law. Report suspected vulnerabilities to support@theurbanphysio.com.',
        ],
      },
      {
        id: 'your-role',
        title: '5. Your Role in Security',
        bullets: [
          'Use strong, unique passwords',
          'Log out on shared devices',
          'Do not share OTPs or payment links',
          'Report suspicious account activity immediately',
        ],
      },
    ],
  },

  service: {
    key: 'service',
    path: '/service-policy',
    title: 'Service Policy',
    subtitle: 'Standards for online, clinic, and home physiotherapy services on our platform.',
    icon: 'fa-handshake',
    accent: 'from-primary-600 to-orange-600',
    sections: [
      {
        id: 'scope',
        title: '1. Scope of Services',
        paragraphs: [
          'The Urban Physio enables three consultation modes: online video (Jitsi Meet), partner clinic visits, and home visits within doctor-defined service radius. Service availability varies by city and practitioner.',
        ],
      },
      {
        id: 'verification',
        title: '2. Doctor Verification',
        paragraphs: [
          'Physiotherapists must complete registration and admin verification before accepting paid bookings. We review license information and profile details; ongoing compliance is the responsibility of each practitioner.',
        ],
      },
      {
        id: 'booking',
        title: '3. Booking & Confirmation',
        bullets: [
          'Bookings may be pending until doctor accepts (where applicable)',
          'Confirmed bookings receive email with date, time, mode, and meeting/location details',
          'Unique booking ID (TUP-*) provided for support reference',
        ],
      },
      {
        id: 'quality',
        title: '4. Service Quality Standards',
        bullets: [
          'Punctuality: sessions should start within 15 minutes of scheduled time',
          'Professional conduct and confidentiality required at all times',
          'Accurate fee display matching consultation type selected',
          'Patients may rate sessions; repeated low ratings trigger admin review',
        ],
      },
      {
        id: 'support',
        title: '5. Customer Support',
        paragraphs: [
          'Support hours: Monday–Saturday, 8:00 AM – 8:00 PM IST. Email support@theurbanphysio.com or call +91 98765 43210. We aim to respond within 24 business hours.',
        ],
      },
      {
        id: 'modifications',
        title: '6. Service Changes',
        paragraphs: [
          'We may add, modify, or discontinue features with reasonable notice. Material changes affecting paid services will be communicated via email or platform notice.',
        ],
      },
    ],
  },

  cookie: {
    key: 'cookie',
    path: '/cookie-policy',
    title: 'Cookie Policy',
    subtitle: 'How we use cookies and similar technologies on The Urban Physio.',
    icon: 'fa-cookie-bite',
    accent: 'from-amber-500 to-orange-600',
    sections: [
      {
        id: 'what',
        title: '1. What Are Cookies?',
        paragraphs: [
          'Cookies are small text files stored on your device when you visit a website. They help remember preferences, keep you logged in, and understand how the site is used.',
        ],
      },
      {
        id: 'types',
        title: '2. Cookies We Use',
        bullets: [
          'Essential: authentication tokens (localStorage/session), security, load balancing',
          'Functional: selected city/location, UI preferences',
          'Analytics: aggregated usage statistics (if enabled) to improve performance',
          'Third-party: Razorpay checkout, map providers (e.g. OpenStreetMap/Leaflet tiles) may set their own cookies',
        ],
      },
      {
        id: 'control',
        title: '3. Managing Cookies',
        paragraphs: [
          'You can block or delete cookies via browser settings. Note that disabling essential cookies may prevent login and booking. Refer to your browser help section for Chrome, Firefox, Safari, or Edge.',
        ],
      },
      {
        id: 'updates',
        title: '4. Updates',
        paragraphs: [
          'We may update this Cookie Policy periodically. The "Last updated" date at the top reflects the latest revision.',
        ],
      },
    ],
  },
};

export function getPolicyByPath(pathname) {
  return Object.values(POLICY_PAGES).find((p) => p.path === pathname) || null;
}
