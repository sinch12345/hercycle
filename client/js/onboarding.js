// ==========================================================
// ONBOARDING FLOW — now creates a real account via the API
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

// ---- Step 1: Pledge + Signup ----
const pledgeCheckbox = document.getElementById('pledgeAccept');
const pledgeNextBtn = document.getElementById('pledgeNextBtn');

pledgeCheckbox.addEventListener('change', () => {
  pledgeNextBtn.disabled = !pledgeCheckbox.checked;
});

pledgeNextBtn.addEventListener('click', async () => {
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const errorEl = document.getElementById('signupError');
  errorEl.style.display = 'none';

  if (!email || !password) {
    return showSignupError('Please enter both email and password.');
  }
  if (password.length < 6) {
    return showSignupError('Password must be at least 6 characters.');
  }

  pledgeNextBtn.disabled = true;
  pledgeNextBtn.textContent = 'Creating account...';

  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      showSignupError(data.error || 'Signup failed.');
      pledgeNextBtn.disabled = false;
      pledgeNextBtn.textContent = 'Continue →';
      return;
    }

    // Save the real session
    localStorage.setItem('hercycle_token', data.token);
    localStorage.setItem('hercycle_user', JSON.stringify(data.user));

    showStep(1);
  } catch (err) {
    console.error(err);
    showSignupError('Could not reach the server. Is it running?');
    pledgeNextBtn.disabled = false;
    pledgeNextBtn.textContent = 'Continue →';
  }
});

function showSignupError(msg) {
  const errorEl = document.getElementById('signupError');
  errorEl.textContent = msg;
  errorEl.style.display = 'block';
}

// ---- Step 2: Profile (saved locally for now, synced to backend in a later step) ----
document.getElementById('profileNextBtn').addEventListener('click', () => showStep(2));
document.getElementById('profileSkipBtn').addEventListener('click', () => showStep(2));

// ---- Step 3: Cycle history ----
document.getElementById('cycleFinishBtn').addEventListener('click', finishOnboarding);
document.getElementById('cycleSkipBtn').addEventListener('click', finishOnboarding);

function finishOnboarding() {
  window.location.href = 'dashboard.html';
}

// ---- Init ----
showStep(0);