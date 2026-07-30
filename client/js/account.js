// ==========================================================
// ACCOUNT PAGE LOGIC
// ==========================================================

// ---- Load saved notification prefs ----
function loadNotifPrefs() {
  const raw = localStorage.getItem('hercycle_notif_prefs');
  return raw ? JSON.parse(raw) : { period: true, pill: true, weekly: false };
}
function saveNotifPrefs() {
  const prefs = {
    period: document.getElementById('notifPeriod').checked,
    pill: document.getElementById('notifPill').checked,
    weekly: document.getElementById('notifWeekly').checked,
  };
  localStorage.setItem('hercycle_notif_prefs', JSON.stringify(prefs));
  showToast('Preferences saved');
}

(function initNotifPrefs() {
  const prefs = loadNotifPrefs();
  document.getElementById('notifPeriod').checked = prefs.period;
  document.getElementById('notifPill').checked = prefs.pill;
  document.getElementById('notifWeekly').checked = prefs.weekly;
})();

['notifPeriod', 'notifPill', 'notifWeekly'].forEach(id => {
  document.getElementById(id).addEventListener('change', saveNotifPrefs);
});

// ---- Export JSON ----
document.getElementById('exportJsonBtn').addEventListener('click', () => {
  const logs = loadLogs();
  const profile = localStorage.getItem('hercycle_profile');
  const cycleHistory = localStorage.getItem('hercycle_cycle_history');

  const payload = {
    exportedAt: new Date().toISOString(),
    profile: profile ? JSON.parse(profile) : null,
    cycleHistory: cycleHistory ? JSON.parse(cycleHistory) : null,
    logs,
  };

  downloadFile(JSON.stringify(payload, null, 2), 'hercycle-export.json', 'application/json');
  showToast('JSON export downloaded');
});

// ---- Export CSV ----
document.getElementById('exportCsvBtn').addEventListener('click', () => {
  const logs = loadLogs();
  const header = 'date,flow,symptoms,sleep\n';
  const rows = logs.map(l =>
    `${l.date},${l.flow},"${l.symptoms.join('; ')}",${l.sleep ?? ''}`
  ).join('\n');

  downloadFile(header + rows, 'hercycle-logs.csv', 'text/csv');
  showToast('CSV export downloaded');
});

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---- Wipe data flow ----
const confirmOverlay = document.getElementById('confirmModalOverlay');

document.getElementById('wipeDataBtn').addEventListener('click', () => {
  confirmOverlay.hidden = false;
});
document.getElementById('cancelWipeBtn').addEventListener('click', () => {
  confirmOverlay.hidden = true;
});
confirmOverlay.addEventListener('click', (e) => {
  if (e.target === confirmOverlay) confirmOverlay.hidden = true;
});

document.getElementById('confirmWipeBtn').addEventListener('click', () => {
  localStorage.removeItem('hercycle_logs');
  localStorage.removeItem('hercycle_profile');
  localStorage.removeItem('hercycle_cycle_history');
  localStorage.removeItem('hercycle_notif_prefs');
  localStorage.removeItem('hercycle_onboarded');
  localStorage.removeItem('hercycle_pledge_accepted');

  confirmOverlay.hidden = true;
  showToast('All data wiped. Redirecting...');
  setTimeout(() => { window.location.href = 'index.html'; }, 1500);
});

// ---- Toast helper ----
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}