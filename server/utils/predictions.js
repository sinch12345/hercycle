// ==========================================================
// PREDICTION ENGINE (server-side)
// Same logic as the frontend prototype, now the source of truth
// ==========================================================

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

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
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

  const recentStarts = starts.slice(-7);
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

  const periodLengths = getPeriodLengths(logs, starts);
  const avgPeriodLen = periodLengths.length
    ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length * 10) / 10
    : null;

  const flowForecast = getFlowForecast(logs, starts);

  return {
    avgCycleLen, avgPeriodLen, stdDev,
    nextPeriod, ovulation, fertileStart, fertileEnd,
    flowForecast, cycleCount: lengths.length,
  };
}

module.exports = { getPredictions };