// ==========================================================
// AUTH GUARD
// Include this script FIRST on any page that requires login.
// Redirects to login.html if there's no valid token.
// ==========================================================

(function checkAuth() {
  const token = localStorage.getItem('hercycle_token');
  if (!token) {
    window.location.href = 'login.html';
  }
})();