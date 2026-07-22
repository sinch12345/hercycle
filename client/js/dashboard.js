// ==========================================================
// DASHBOARD PAGE LOGIC
// ==========================================================

let logs = loadLogs();
let predictions = getPredictions(logs);

function refreshDashboard() {
  logs = loadLogs();
  predictions = getPredictions(logs);
  renderCalendar(logs, predictions);
  renderStats();
}

function renderStats() {
  document.getElementById('statCycleLen').textContent = predictions.avgCycleLen ? `${predictions.avgCycleLen}d` : '—';
  document.getElementById('statPeriodLen').textContent = predictions.avgPeriodLen ? `${predictions.avgPeriodLen}d` : '—';
  document.getElementById('statNextPeriod').textContent = formatDate(predictions.nextPeriod);
  document.getElementById('statFlowForecast').textContent = predictions.flowForecast;

  const note = document.getElementById('lastLoggedNote');
  if (logs.length > 0) {
    const last = logs[logs.length - 1];
    note.textContent = `Last logged: ${formatDate(last.date)}`;
  }
}

// ---- Calendar nav ----
document.getElementById('calPrevBtn').addEventListener('click', () => {
  calViewDate.setMonth(calViewDate.getMonth() - 1);
  renderCalendar(logs, predictions);
});
document.getElementById('calNextBtn').addEventListener('click', () => {
  calViewDate.setMonth(calViewDate.getMonth() + 1);
  renderCalendar(logs, predictions);
});

// ---- Modal open/close ----
const overlay = document.getElementById('logModalOverlay');
document.getElementById('openLogBtn').addEventListener('click', () => {
  document.getElementById('logDate').value = new Date().toISOString().split('T')[0];
  overlay.hidden = false;
});
document.getElementById('closeLogBtn').addEventListener('click', () => overlay.hidden = true);
overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.hidden = true; });

// ---- Flow select ----
let selectedFlow = 'none';
document.querySelectorAll('.flow-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.flow-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedFlow = btn.dataset.flow;
  });
});

// ---- Symptom chips ----
document.querySelectorAll('#symptomChips .chip').forEach(chip => {
  chip.addEventListener('click', () => chip.classList.toggle('active'));
});

// ---- Save entry ----
document.getElementById('saveLogBtn').addEventListener('click', () => {
  const date = document.getElementById('logDate').value;
  if (!date) { alert('Please pick a date.'); return; }

  const symptoms = Array.from(document.querySelectorAll('#symptomChips .chip.active')).map(c => c.dataset.symptom);
  const sleep = document.getElementById('logSleep').value ? Number(document.getElementById('logSleep').value) : null;

  const currentLogs = loadLogs();
  const existingIndex = currentLogs.findIndex(l => l.date === date);
  const entry = { date, flow: selectedFlow, symptoms, sleep };

  if (existingIndex >= 0) currentLogs[existingIndex] = entry;
  else currentLogs.push(entry);

  saveLogs(currentLogs);
  overlay.hidden = true;
  refreshDashboard();
});

// ---- Init ----
refreshDashboard();