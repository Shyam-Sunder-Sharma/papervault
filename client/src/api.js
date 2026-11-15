import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchMeta = async () => {
  const res = await api.get('/api/meta');
  return res.data;
};

export const fetchPapers = async (params = {}) => {
  const res = await api.get('/api/papers', { params });
  return res.data;
};

export const getUploadUrl = async (filename, fileType) => {
  const res = await api.post('/api/papers/upload-url', { filename, fileType });
  return res.data;
};

export const uploadPdfToSignedUrl = async (signedUrl, file) => {
  const res = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/pdf',
    },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Direct upload failed with status ${res.status}`);
  }
  return true;
};

export const submitPaper = async (paperData) => {
  const res = await api.post('/api/papers', paperData);
  return res.data;
};

export const submitSuggestion = async (data) => {
  const res = await api.post('/api/suggestions', data);
  return res.data;
};

// Admin Endpoints
export const adminLogin = async (username, password) => {
  const res = await api.post('/api/admin/login', { username, password });
  return res.data;
};

export const adminLogout = async () => {
  const res = await api.post('/api/admin/logout');
  return res.data;
};

export const getAdminMe = async () => {
  const res = await api.get('/api/admin/me');
  return res.data;
};

export const getAdminStats = async () => {
  const res = await api.get('/api/admin/stats');
  return res.data;
};

export const getAdminPapers = async (params = {}) => {
  const res = await api.get('/api/admin/papers', { params });
  return res.data;
};

export const updateAdminPaper = async (id, data) => {
  const res = await api.patch(`/api/admin/papers/${id}`, data);
  return res.data;
};

export const deleteAdminPaper = async (id) => {
  const res = await api.delete(`/api/admin/papers/${id}`);
  return res.data;
};

export const getAdminSuggestions = async (params = {}) => {
  const res = await api.get('/api/admin/suggestions', { params });
  return res.data;
};

export const updateAdminSuggestion = async (id, data) => {
  const res = await api.patch(`/api/admin/suggestions/${id}`, data);
  return res.data;
};

export const deleteAdminSuggestion = async (id) => {
  const res = await api.delete(`/api/admin/suggestions/${id}`);
  return res.data;
};

export default api;
