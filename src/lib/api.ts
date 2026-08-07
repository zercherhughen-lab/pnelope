import axios from 'axios';

export const API = '/api';

const api = axios.create({
  baseURL: API,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vauth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function formatErr(detail: any): string {
  if (detail == null) return 'Something went wrong';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e) => (e != null && e.msg ? e.msg : JSON.stringify(e)))
      .join(' ');
  }
  if (detail != null && detail.msg) return detail.msg;
  return String(detail);
}

export default api;
