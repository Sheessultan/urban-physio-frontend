import { createContext, useContext, useEffect, useState } from 'react';
import { contact as contactApi } from '../services/api';
import { CONTACT_INFO, CONTACT_SUBJECTS } from '../constants/supportPages';
import { displayContactText } from '../utils/contactText';

const defaults = {
  email: CONTACT_INFO.email,
  phone: CONTACT_INFO.phone,
  whatsapp: CONTACT_INFO.whatsapp,
  hours: CONTACT_INFO.hours,
  address: CONTACT_INFO.address,
  footer_tagline:
    "India's trusted physiotherapy platform. Expert care, online consultations, and rehab programs - wherever you are.",
  form_subjects: CONTACT_SUBJECTS,
};

const ContactContext = createContext({ ...defaults, loading: true, refresh: () => {} });

export function ContactProvider({ children }) {
  const [info, setInfo] = useState(defaults);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    contactApi
      .settings()
      .then((res) => {
        const d = res.data || res;
        setInfo({
          email: displayContactText(d.email || defaults.email),
          phone: displayContactText(d.phone || defaults.phone),
          whatsapp: displayContactText(d.whatsapp || defaults.whatsapp),
          hours: displayContactText(d.hours || defaults.hours),
          address: displayContactText(d.address || defaults.address),
          footer_tagline: displayContactText(d.footer_tagline || defaults.footer_tagline),
          form_subjects: (d.form_subjects?.length ? d.form_subjects : defaults.form_subjects).map(
            (s) => displayContactText(s)
          ),
        });
      })
      .catch(() => setInfo(defaults))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <ContactContext.Provider value={{ ...info, loading, refresh }}>{children}</ContactContext.Provider>
  );
}

export const useContact = () => useContext(ContactContext);
