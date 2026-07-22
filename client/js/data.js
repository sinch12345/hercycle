// ==========================================================
// DATA LAYER
// In-memory + localStorage mock "database" until backend exists.
// Prediction logic lives here so both dashboard.js and
// analytics.js can reuse it.
// ==========================================================

function loadLogs() {
  const raw = localStorage.getItem('hercycle_logs');
  return raw ? JSON.parse(raw) : seedDemoLogs();
}

function saveLogs(logs) {
  localStorage.setItem('hercycle_logs', JSON.stringify(logs));
}

// Seed a bit of demo data so the calendar isn't empty on first run
function seedDemoLogs() {
  const demo = [
    { date: '2026-06-05', flow: 'heavy', symptoms: ['cramps', 'fatigue'], sleep: 5 },
    { date: '2026-06-06', flow: 'heavy', symptoms: ['cramps'], sleep: 6 },
    { date: '2026-06-07', flow: 'medium', symptoms: ['bloating'], sleep: 7 },
    { date: '2026-06-08', flow: 'light', symptoms: [], sleep: 8 },
    { date: '2026-07-03', flow: 'heavy', symptoms: ['cramps', 'headache'], sleep: 5 },
    { date: '2026-07-04', flow: 'heavy', symptoms: ['cramps'], sleep: 6 },
    { date: '2026-07-05', flow: 'medium', symptoms: ['fatigue'], sleep: 6 },
    { date: '2026-07-06', flow: 'light', symptoms: [], sleep: 7 },
  ];
  saveLogs(demo);
  return demo;
}

// ---- Derive period "cycles" from raw logs ----
// A cycle starts on the first day of a flow streak after a gap.
function getCycleStarts(logs) {
  const flowDays = logs
    .filter(l => l.flow && l.flow !== 'none' && l.flow !== 'spotting')
    .map(l => l.date)
    .sort();

  const starts = [];
  let prevDate = null;
  flowDays.forEach(dateStr => {
    const d = new Date(dateStr);
    if (!prevDate || (d - prevDate) / 86400000 > 2) {
      starts.push(dateStr);
    }
    prevDate = d;
  });
  return starts;
}

function daysBetween(d1, d2) {
  return Math.round((new Date(d2) - new Date(d1)) / 86400000);
}

// ---- Core prediction engine ----
function getPredictions(logs) {
  const starts = getCycleStarts(logs);

  if (starts.length < 2) {
    return {
      avgCycleLen: null,
      avgPeriodLen: null,
      stdDev: null,
      nextPeriod: null,
      ovulation: null,
      fertileStart: null,
      fertileEnd: null,
      flowForecast: 'Not enough data yet',
      cycleCount: starts.length,
    };
  }

  // rolling average of last up to 6 cycles
  const recentStarts = starts.slice(-7); // need n+1 starts for n cycle lengths
  const lengths = [];
  for (let i = 1; i < recentStarts.length; i++) {
    lengths.push(daysBetween(recentStarts[i - 1], recentStarts[i]));
  }
  const avgCycleLen = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);

  const mean = avgCycleLen;
  const variance = lengths.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / lengths.length;
  const stdDev = Math.round(Math.sqrt(variance) * 10) / 10;

  const lastStart = starts[starts.length - 1];
  const nextPeriod = addDays(lastStart, avgCycleLen);
  const ovulation = addDays(nextPeriod, -14);
  const fertileStart = addDays(ovulation, -5);
  const fertileEnd = ovulation;

  // average period length (consecutive flow days per cycle)
  const periodLengths = getPeriodLengths(logs, starts);
  const avgPeriodLen = periodLengths.length
    ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length * 10) / 10
    : null;

  // simple flow forecast: compare last cycle's heavy-day count to the one before
  const flowForecast = getFlowForecast(logs, starts);

  return {
    avgCycleLen, avgPeriodLen, stdDev,
    nextPeriod, ovulation, fertileStart, fertileEnd,
    flowForecast, cycleCount: lengths.length,
  };
}

function getPeriodLengths(logs, starts) {
  const flowDates = logs.filter(l => l.flow && l.flow !== 'none').map(l => l.date).sort();
  const lengths = [];
  starts.forEach((start, i) => {
    const nextStart = starts[i + 1] ? new Date(starts[i + 1]) : null;
    let count = 0;
    flowDates.forEach(d => {
      const date = new Date(d);
      if (date >= new Date(start) && (!nextStart || date < nextStart) && daysBetween(start, d) < 10) {
        count++;
      }
    });
    if (count > 0) lengths.push(count);
  });
  return lengths;
}

function getFlowForecast(logs, starts) {
  if (starts.length < 2) return 'Not enough data yet';
  const heavyCount = (start, end) => logs.filter(l => {
    const d = new Date(l.date);
    return l.flow === 'heavy' && d >= new Date(start) && (!end || d < new Date(end));
  }).length;

  const lastCycleHeavy = heavyCount(starts[starts.length - 1], null);
  const prevCycleHeavy = starts.length >= 2 ? heavyCount(starts[starts.length - 2], starts[starts.length - 1]) : 0;

  if (lastCycleHeavy > prevCycleHeavy) return 'Heavier than usual ↑';
  if (lastCycleHeavy < prevCycleHeavy) return 'Lighter than usual ↓';
  return 'Similar to last cycle';
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}