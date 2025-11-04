function checkAuth() {
  if (!localStorage.getItem('currentUser')) {
    alert('Please login first.');
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

function loadProfile() {
  if (!checkAuth()) return;

  const currentUser = localStorage.getItem('currentUser');
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.username === currentUser);

  if (user) {
    document.getElementById('profile_username').value = user.username;
  }
}

function updateProfile() {
  if (!checkAuth()) return;

  const newUsername = document.getElementById('profile_username').value.trim();
  const newPassword = document.getElementById('profile_password').value;

  if (!newUsername) {
    alert('Username cannot be empty.');
    return;
  }

  let users = JSON.parse(localStorage.getItem('users') || '[]');
  const currentUser = localStorage.getItem('currentUser');

  // Check if new username taken by another user
  if (newUsername !== currentUser && users.some(u => u.username === newUsername)) {
    alert('Username already taken.');
    return;
  }

  users = users.map(u => {
    if (u.username === currentUser) {
      return {
        username: newUsername,
        password: newPassword ? newPassword : u.password
      };
    }
    return u;
  });

  localStorage.setItem('users', JSON.stringify(users));

  // Update session if username changed
  if (newUsername !== currentUser) {
    localStorage.setItem('currentUser', newUsername);
  }

  alert('Profile updated successfully.');
  document.getElementById('profile_password').value = '';
}

// Initialize the profile form with current data on page load
window.onload = loadProfile;

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}
