// ==========================================================
// CALENDAR RENDERING
// ==========================================================

let calViewDate = new Date(); // month currently displayed

function renderCalendar(logs, predictions) {
  const grid = document.getElementById('calGrid');
  const label = document.getElementById('calMonthLabel');
  grid.innerHTML = '';

  const year = calViewDate.getFullYear();
  const month = calViewDate.getMonth();

  label.textContent = calViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  ['S','M','T','W','T','F','S'].forEach(d => {
    const el = document.createElement('div');
    el.className = 'cal-dow';
    el.textContent = d;
    grid.appendChild(el);
  });

  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const logMap = {};
  logs.forEach(l => { logMap[l.date] = l; });

  const todayStr = new Date().toISOString().split('T')[0];

  for (let i = 0; i < startOffset; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day muted';
    grid.appendChild(el);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const el = document.createElement('div');
    let cls = 'cal-day';

    if (logMap[dateStr] && logMap[dateStr].flow && logMap[dateStr].flow !== 'none') {
      cls += ' ' + logMap[dateStr].flow;
    } else if (predictions.nextPeriod && isWithinPredictedPeriod(dateStr, predictions)) {
      cls += ' predicted';
    }

    if (predictions.fertileStart && dateStr >= predictions.fertileStart && dateStr <= predictions.fertileEnd) {
      cls += ' fertile';
    }

    if (dateStr === todayStr) cls += ' today';

    el.className = cls;
    el.textContent = d;
    el.title = dateStr;
    grid.appendChild(el);
  }
}

function isWithinPredictedPeriod(dateStr, predictions) {
  if (!predictions.nextPeriod || !predictions.avgPeriodLen) return false;
  const start = new Date(predictions.nextPeriod);
  const end = addDaysDate(start, Math.ceil(predictions.avgPeriodLen));
  const d = new Date(dateStr);
  return d >= start && d < end;
}

function addDaysDate(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}