// Support both development and production environments
// In production (Railway), backend and frontend are served from same URL
const API_BASE = import.meta.env.VITE_API_URL || 
                 (import.meta.env.MODE === 'production' ? '' : 'http://localhost:5004');

export async function apiRegister(username, password, email){
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email })
  });
  return res.json();
}

export async function apiLogin(username, password){
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

export async function apiHealth(){
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function apiUpload(userId, file){
  const form = new FormData();
  form.append('user_id', userId);
  form.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: form });
  return res.json();
}

export async function apiListFiles(userId){
  const res = await fetch(`${API_BASE}/files/${userId}`);
  return res.json();
}

export async function apiAnalytics(userId){
  const res = await fetch(`${API_BASE}/analytics/${userId}`);
  return res.json();
}
