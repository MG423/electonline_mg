// LocalStorage Helpers
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function getElections() {
  return JSON.parse(localStorage.getItem('elections') || '[]');
}
function saveElections(elections) {
  localStorage.setItem('elections', JSON.stringify(elections));
}

function getVotes() {
  return JSON.parse(localStorage.getItem('votes') || '{}');
}
function saveVotes(votes) {
  localStorage.setItem('votes', JSON.stringify(votes));
}
// Add Election page logic
let newCandidates = [];

// Authentication Helpers
function checkAuth() {
  if (!localStorage.getItem('currentUser')) {
    alert('Please login first.');
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// Register User
function registerUser() {
  const username = document.getElementById('reg_username').value.trim();
  const password = document.getElementById('reg_password').value.trim();
  if (!username || !password) {
    alert('Please enter username and password.');
    return;
  }
  const users = getUsers();
  if (users.find(u => u.username === username)) {
    alert('Username already exists');
    return;
  }
  users.push({ username, password });
  saveUsers(users);
  alert('Registration successful! Please login.');
  document.getElementById('reg_username').value = '';
  document.getElementById('reg_password').value = '';
}

// Login User
function loginUser() {
  const username = document.getElementById('login_username').value.trim();
  const password = document.getElementById('login_password').value.trim();
  const users = getUsers();
  if (users.find(u => u.username === username && u.password === password)) {
    localStorage.setItem('currentUser', username);
    window.location.href = 'elections.html';
  } else {
    alert('Invalid username or password');
  }
}

// Logout User
function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

// Election data global cache for search
let allElections = [];

// Load Elections from storage and display
function loadElections() {
  if (!checkAuth()) return;

  allElections = getElections();
  displayElections(allElections);
}

// Display passed elections list
function displayElections(elections) {
  const container = document.getElementById('elections-container');
  container.innerHTML = '';
  const now = new Date();
  const votes = getVotes();
  const user = localStorage.getItem('currentUser');

  if (!elections.length) {
    container.innerHTML = '<p>No elections found.</p>';
    clearChart();
    return;
  }

  elections.forEach(election => {
    const dueDate = new Date(election.dueDate);
    const userVotes = votes[election.id] || [];
    const hasVoted = userVotes.some(v => v.user === user);

    const card = document.createElement('div');
    card.className = 'election-card';

    let html = `<h3>${election.name}</h3>
      <p><b>Due:</b> ${dueDate.toLocaleString()}</p>`;

    if (now > dueDate) {
      html += '<p><b>Election Ended</b></p>';
    } else if (hasVoted) {
      html += '<p>You have already voted.</p>';
    } else {
      election.candidates.forEach(c => {
        html += `<button class="vote-btn" onclick="confirmVote('${election.id}','${c.name}')">Vote for ${c.name}</button>`;
      });
    }

    html += '<h4>Results:</h4><ul>';
    election.candidates.forEach(c => {
      const count = userVotes.filter(v => v.candidate === c.name).length;
      html += `<li>${c.name}: ${count}</li>`;
    });
    html += '</ul>';

    html += `<button class="show-chart-btn" onclick="showResultsChart('${election.id}')">Show Chart</button>`;
    html += `<button class="delete-election-btn" onclick="deleteElection('${election.id}')">Delete Election</button>`;

    card.innerHTML = html;
    container.appendChild(card);
  });

  // Show chart for first election automatically
  if (elections.length) {
    showResultsChart(elections[0].id);
  }
}

// Voting Confirmation Modal Logic
let pendingVote = null;

function confirmVote(electionId, candidateName) {
  pendingVote = { electionId, candidateName };
  const modal = document.getElementById('voteConfirmModal');
  const confirmText = document.getElementById('confirmText');
  confirmText.textContent = `Are you sure you want to vote for "${candidateName}"?`;
  modal.style.display = 'flex';
}

document.getElementById('confirmYes').onclick = () => {
  if (pendingVote) {
    castVote(pendingVote.electionId, pendingVote.candidateName);
    pendingVote = null;
    closeModal();
  }
};

document.getElementById('confirmNo').onclick = () => {
  pendingVote = null;
  closeModal();
};

function closeModal() {
  const modal = document.getElementById('voteConfirmModal');
  modal.style.display = 'none';
}

// Cast Vote
function castVote(electionId, candidateName) {
  if (!checkAuth()) return;

  const user = localStorage.getItem('currentUser');
  let votes = getVotes();

  if (!votes[electionId]) votes[electionId] = [];

  if (votes[electionId].some(v => v.user === user)) {
    alert('You already voted');
    return;
  }

  votes[electionId].push({ user, candidate: candidateName });
  saveVotes(votes);
  alert(`Voted for ${candidateName} successfully!`);
  loadElections();
  showResultsChart(electionId);
}

// Delete Election
function deleteElection(electionId) {
  if (!checkAuth()) return;

  if (!confirm('Are you sure you want to delete this election? This action cannot be undone.')) {
    return;
  }

  let elections = getElections();
  elections = elections.filter(e => e.id !== electionId);
  saveElections(elections);

  let votes = getVotes();
  delete votes[electionId];
  saveVotes(votes);

  alert('Election deleted successfully.');
  loadElections();

  const canvas = document.getElementById('resultsChart');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// Search/filter elections
function filterElections() {
  const input = document.getElementById('searchInput');
  if(!input) return;
  const query = input.value.toLowerCase();
  const filtered = allElections.filter(e => e.name.toLowerCase().includes(query));
  displayElections(filtered);
}

// Clear Chart if needed
function clearChart() {
  const canvas = document.getElementById('resultsChart');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}



function addCandidate() {
  const input = document.getElementById('candidate_name');
  const name = input.value.trim();
  if (!name) {
    alert('Enter candidate name');
    return;
  }
  newCandidates.push({ name });
  input.value = '';
  updateCandidatesList();
}

function updateCandidatesList() {
  const listDiv = document.getElementById('candidates-list');
  listDiv.innerHTML = '';
  newCandidates.forEach(c => {
    const div = document.createElement('div');
    div.textContent = c.name;
    listDiv.appendChild(div);
  });
}

function saveElection() {
  if (!checkAuth()) return;

  const name = document.getElementById('election_name').value.trim();
  const dueDate = document.getElementById('election_due_date').value;

  if (!name || !dueDate || newCandidates.length < 1) {
    alert('Please fill all fields and add candidates.');
    return;
  }

  let elections = getElections();
  elections.push({
    id: 'election_' + Date.now(),
    name,
    dueDate,
    candidates: newCandidates
  });

  saveElections(elections);
  alert('Election added successfully!');
  document.getElementById('election_name').value = '';
  document.getElementById('election_due_date').value = '';
  newCandidates = [];
  updateCandidatesList();
  window.location.href = 'elections.html';
}

// Default elections on first load
function createDefaultElections() {
  if (!getElections().length) {
    saveElections([
      {
        id: 'election_1',
        name: 'Student Council President 2025',
        dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
        candidates: [{ name: 'Alice' }, { name: 'Bob' }]
      },
      {
        id: 'election_2',
        name: 'City Mayor Election 2025',
        dueDate: new Date(Date.now() + 10*24*60*60*1000).toISOString(),
        candidates: [{ name: 'Charlie' }, { name: 'Dana' }]
      }
    ]);
  }
}

// Run on page load
window.onload = function() {
  createDefaultElections();

  if (document.getElementById('elections-container')) {
    loadElections();
  }
  if (document.getElementById('candidates-list')) {
    newCandidates = [];
    updateCandidatesList();
    checkAuth();
  }
};

