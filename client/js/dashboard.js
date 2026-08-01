// ==========================================================
// DASHBOARD PAGE LOGIC — now uses real API calls
// ==========================================================

let logs = [];
let predictions = {};

async function refreshDashboard() {
  try {
    logs = await fetchLogs();
    predictions = await fetchPredictions();
    renderCalendar(logs, predictions);
    renderStats();
  } catch (err) {
    console.error(err);
    alert('Could not load your data. Try refreshing the page.');
  }
}

function renderStats() {
  document.getElementById('statCycleLen').textContent = predictions.avgCycleLen ? `${predictions.avgCycleLen}d` : '—';
  document.getElementById('statPeriodLen').textContent = predictions.avgPeriodLen ? `${predictions.avgPeriodLen}d` : '—';
  document.getElementById('statNextPeriod').textContent = formatDate(predictions.nextPeriod);
  document.getElementById('statFlowForecast').textContent = predictions.flowForecast || '—';

  const note = document.getElementById('lastLoggedNote');
  if (logs.length > 0) {
    const last = logs[logs.length - 1];
    note.textContent = `Last logged: ${formatDate(last.date)}`;
  } else {
    note.textContent = 'No entries yet — log today to get started.';
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
document.getElementById('saveLogBtn').addEventListener('click', async () => {
  const date = document.getElementById('logDate').value;
  if (!date) { alert('Please pick a date.'); return; }

  const symptoms = Array.from(document.querySelectorAll('#symptomChips .chip.active')).map(c => c.dataset.symptom);
  const sleep = document.getElementById('logSleep').value ? Number(document.getElementById('logSleep').value) : null;

  const saveBtn = document.getElementById('saveLogBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    await saveLog({ date, flow: selectedFlow, symptoms, sleep });
    overlay.hidden = true;
    await refreshDashboard();
  } catch (err) {
    console.error(err);
    alert('Could not save entry. Try again.');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save entry';
  }
});

// ---- Init ----
refreshDashboard();