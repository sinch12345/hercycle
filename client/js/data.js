// ==========================================================
// DATA LAYER — now talks to the real backend API
// ==========================================================

function authHeaders() {
  const token = localStorage.getItem('hercycle_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

async function fetchLogs() {
  const res = await fetch(`${API_URL}/logs`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch logs');
  const data = await res.json();
  return data.logs;
}

async function fetchPredictions() {
  const res = await fetch(`${API_URL}/logs/predictions`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch predictions');
  const data = await res.json();
  return data.predictions;
}

async function saveLog(entry) {
  const res = await fetch(`${API_URL}/logs`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error('Failed to save log');
  const data = await res.json();
  return data.log;
}

async function wipeAllLogs() {
  const res = await fetch(`${API_URL}/logs`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to wipe logs');
  return await res.json();
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function logout() {
  localStorage.removeItem('hercycle_token');
  localStorage.removeItem('hercycle_user');
  window.location.href = 'login.html';
}