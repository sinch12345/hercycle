// ==========================================================
// ANALYTICS PAGE LOGIC — now uses real API calls
// ==========================================================

let logs = [];
let predictions = {};

async function initAnalytics() {
  try {
    logs = await fetchLogs();
    predictions = await fetchPredictions();
    renderCycleStats();
    renderCorrelations();
    renderLogTable();
  } catch (err) {
    console.error(err);
    alert('Could not load your data. Try refreshing the page.');
  }
}

function renderCycleStats() {
  document.getElementById('anStatAvg').textContent = predictions.avgCycleLen ? `${predictions.avgCycleLen} days` : '—';
  document.getElementById('anStatStd').textContent = predictions.stdDev !== null && predictions.stdDev !== undefined ? `± ${predictions.stdDev} days` : '—';
  document.getElementById('anStatCount').textContent = predictions.cycleCount ?? '—';
}

function renderCorrelations() {
  const container = document.getElementById('correlationBars');
  const lowSleepLogs = logs.filter(l => l.sleep !== null && l.sleep !== undefined && l.sleep < 6);
  const normalSleepLogs = logs.filter(l => l.sleep !== null && l.sleep !== undefined && l.sleep >= 6);

  if (lowSleepLogs.length === 0 || normalSleepLogs.length === 0) {
    container.innerHTML = '<p class="corr-empty">Log a few more entries with sleep hours to unlock correlation insights.</p>';
    return;
  }

  const allSymptoms = ['cramps', 'bloating', 'fatigue', 'mood', 'headache', 'acne'];
  const results = allSymptoms.map(symptom => {
    const lowRate = lowSleepLogs.filter(l => l.symptoms.includes(symptom)).length / lowSleepLogs.length;
    const normalRate = normalSleepLogs.filter(l => l.symptoms.includes(symptom)).length / normalSleepLogs.length;
    const diff = Math.round((lowRate - normalRate) * 100);
    return { symptom, diff, lowRate: Math.round(lowRate * 100) };
  }).filter(r => r.lowRate > 0)
    .sort((a, b) => b.diff - a.diff);

  if (results.length === 0) {
    container.innerHTML = '<p class="corr-empty">No strong correlations found yet — keep logging to reveal patterns.</p>';
    return;
  }

  container.innerHTML = results.map(r => `
    <div class="corr-item">
      <div class="corr-label">
        <span>${capitalize(r.symptom)} on low-sleep days</span>
        <span>${r.lowRate}%</span>
      </div>
      <div class="corr-track"><div class="corr-fill" style="width:${r.lowRate}%"></div></div>
    </div>
  `).join('');
}

function renderLogTable() {
  const tbody = document.getElementById('logTableBody');
  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">No entries yet.</td></tr>';
    return;
  }

  tbody.innerHTML = sorted.map(l => `
    <tr>
      <td>${formatDate(l.date)}</td>
      <td><span class="flow-badge badge-${l.flow}">${capitalize(l.flow)}</span></td>
      <td>${l.symptoms.length ? l.symptoms.map(capitalize).join(', ') : '—'}</td>
      <td>${l.sleep !== null && l.sleep !== undefined ? l.sleep + 'h' : '—'}</td>
    </tr>
  `).join('');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace('_', ' ');
}

document.getElementById('exportPdfBtn').addEventListener('click', () => {
  window.print();
});

// ---- Init ----
initAnalytics();