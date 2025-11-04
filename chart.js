let chartInstance = null;

function showResultsChart(electionId) {
  const elections = JSON.parse(localStorage.getItem('elections') || '[]');
  const votes = JSON.parse(localStorage.getItem('votes') || '{}');
  const election = elections.find(e => e.id === electionId);
  if (!election) return;

  const ctx = document.getElementById('resultsChart').getContext('2d');

  const data = election.candidates.map(c =>
    votes[electionId]?.filter(v => v.candidate === c.name).length || 0
  );

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: election.candidates.map(c => c.name),
      datasets: [{
        data,
        backgroundColor: [
          '#4a90e2',
          '#50e3c2',
          '#9013fe',
          '#f5a623',
          '#d0021b',
          '#b8e986'
        ].slice(0, election.candidates.length),
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#333' } }
      }
    }
  });
}
