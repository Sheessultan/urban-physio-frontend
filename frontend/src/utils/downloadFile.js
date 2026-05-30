import axios from 'axios';

import { API_BASE } from '../services/api';

export async function downloadAuthenticatedFile(path, filename) {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    responseType: 'blob',
  });
  const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function openAuthenticatedFile(path) {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    responseType: 'blob',
  });
  const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => window.URL.revokeObjectURL(url), 60000);
}
