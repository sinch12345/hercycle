// ==========================================================
// ACCOUNT PAGE LOGIC — now uses real API calls
// ==========================================================

// ---- Load saved notification prefs (still local for now — no backend field for this yet) ----
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

// ---- Export JSON (pulls real logs from the API) ----
document.getElementById('exportJsonBtn').addEventListener('click', async () => {
  try {
    const logs = await fetchLogs();
    const user = JSON.parse(localStorage.getItem('hercycle_user') || '{}');

    const payload = {
      exportedAt: new Date().toISOString(),
      user,
      logs,
    };

    downloadFile(JSON.stringify(payload, null, 2), 'hercycle-export.json', 'application/json');
    showToast('JSON export downloaded');
  } catch (err) {
    console.error(err);
    showToast('Export failed. Try again.');
  }
});

// ---- Export CSV ----
document.getElementById('exportCsvBtn').addEventListener('click', async () => {
  try {
    const logs = await fetchLogs();
    const header = 'date,flow,symptoms,sleep\n';
    const rows = logs.map(l =>
      `${l.date},${l.flow},"${l.symptoms.join('; ')}",${l.sleep ?? ''}`
    ).join('\n');

    downloadFile(header + rows, 'hercycle-logs.csv', 'text/csv');
    showToast('CSV export downloaded');
  } catch (err) {
    console.error(err);
    showToast('Export failed. Try again.');
  }
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

document.getElementById('confirmWipeBtn').addEventListener('click', async () => {
  const btn = document.getElementById('confirmWipeBtn');
  btn.disabled = true;
  btn.textContent = 'Deleting...';

  try {
    await wipeAllLogs(); // deletes all logs from MongoDB via the API
    localStorage.removeItem('hercycle_notif_prefs');

    confirmOverlay.hidden = true;
    showToast('All logs wiped. Logging out...');
    setTimeout(() => { logout(); }, 1500);
  } catch (err) {
    console.error(err);
    showToast('Could not wipe data. Try again.');
    btn.disabled = false;
    btn.textContent = 'Yes, delete everything';
  }
});

// ---- Toast helper ----
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}