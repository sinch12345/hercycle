// ==========================================================
// ONBOARDING FLOW
// Saves to localStorage for now — will be replaced by real
// API calls once the backend is connected (Phase C).
// ==========================================================

const steps = ['step-pledge', 'step-profile', 'step-cycle'];
let currentStep = 0;

function showStep(index) {
  steps.forEach((id, i) => {
    document.getElementById(id).hidden = i !== index;
  });
  document.getElementById('progressFill').style.width = `${((index + 1) / steps.length) * 100}%`;
  currentStep = index;
}

// ---- Step 1: Pledge ----
const pledgeCheckbox = document.getElementById('pledgeAccept');
const pledgeNextBtn = document.getElementById('pledgeNextBtn');

pledgeCheckbox.addEventListener('change', () => {
  pledgeNextBtn.disabled = !pledgeCheckbox.checked;
});

pledgeNextBtn.addEventListener('click', () => {
  localStorage.setItem('hercycle_pledge_accepted', 'true');
  showStep(1);
});

// ---- Step 2: Profile ----
function saveProfile() {
  const profile = {
    age: document.getElementById('inputAge').value || null,
    height: document.getElementById('inputHeight').value || null,
    weight: document.getElementById('inputWeight').value || null,
  };
  localStorage.setItem('hercycle_profile', JSON.stringify(profile));
}

document.getElementById('profileNextBtn').addEventListener('click', () => {
  saveProfile();
  showStep(2);
});
document.getElementById('profileSkipBtn').addEventListener('click', () => {
  showStep(2);
});

// ---- Step 3: Cycle history ----
function saveCycleHistory() {
  const cycle = {
    lastPeriod: document.getElementById('inputLastPeriod').value || null,
    avgLength: document.getElementById('inputCycleLen').value || null,
    typicalFlow: document.getElementById('inputFlowTypical').value || null,
  };
  localStorage.setItem('hercycle_cycle_history', JSON.stringify(cycle));
}

document.getElementById('cycleFinishBtn').addEventListener('click', () => {
  saveCycleHistory();
  finishOnboarding();
});
document.getElementById('cycleSkipBtn').addEventListener('click', () => {
  finishOnboarding();
});

function finishOnboarding() {
  localStorage.setItem('hercycle_onboarded', 'true');
  window.location.href = 'dashboard.html';
}

// ---- Init ----
showStep(0);