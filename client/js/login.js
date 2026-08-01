// ==========================================================
// LOGIN PAGE LOGIC
// ==========================================================

document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  errorEl.style.display = 'none';

  if (!email || !password) {
    showError('Please enter both email and password.');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Login failed.');
      return;
    }

    // Save token + basic user info for the rest of the app to use
    localStorage.setItem('hercycle_token', data.token);
    localStorage.setItem('hercycle_user', JSON.stringify(data.user));

    window.location.href = 'dashboard.html';
  } catch (err) {
    console.error(err);
    showError('Could not reach the server. Is it running?');
  }
});

function showError(msg) {
  const errorEl = document.getElementById('loginError');
  errorEl.textContent = msg;
  errorEl.style.display = 'block';
}