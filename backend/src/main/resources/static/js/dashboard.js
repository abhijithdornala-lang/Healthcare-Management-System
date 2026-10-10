// =====================================================================
// Dashboard Logic - MedCare HMS
// Fetches real stats and today's schedule from Spring Boot REST APIs
// =====================================================================

const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {
  initLiveClock();
  fetchDashboardStats();
  fetchTodayAppointments();
  fetchDoctorsAvailability();
});

function initLiveClock() {
  const clockEl = document.getElementById('current-clock');
  function update() {
    const now = new Date();
    clockEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  update();
  setInterval(update, 1000);
}

async function fetchDashboardStats() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch stats`);
    const stats = await res.json();

    document.getElementById('stat-total-patients').textContent = stats.totalPatients ?? 0;
    document.getElementById('stat-total-doctors').textContent = stats.totalDoctors ?? 0;
    document.getElementById('stat-today-appointments').textContent = stats.todayAppointments ?? 0;
    document.getElementById('stat-upcoming-appointments').textContent = stats.upcomingAppointments ?? 0;
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    showToast('Failed to load dashboard metrics. Check backend connection.', 'error');
  }
}

async function fetchTodayAppointments() {
  const tbody = document.getElementById('dashboard-appointments-body');
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const res = await fetch(`${API_BASE}/appointments?date=${todayStr}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const appointments = await res.json();

    if (!appointments || appointments.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state">
            <h4>No appointments scheduled for today</h4>
            <p>Use the appointments page to schedule new patient visits.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = appointments.map(app => {
      const statusClass = `status-${(app.status || 'scheduled').toLowerCase()}`;
      return `
        <tr>
          <td><strong>#APT-${app.id}</strong></td>
          <td>${escapeHtml(app.patient ? app.patient.fullName : 'Unknown Patient')}</td>
          <td>${escapeHtml(app.doctor ? app.doctor.fullName : 'Unknown Doctor')}</td>
          <td>${formatTime(app.startTime)} - ${formatTime(app.endTime)}</td>
          <td><span class="status-badge ${statusClass}">${escapeHtml(app.status)}</span></td>
          <td>
            <a href="appointments.html" class="btn btn-secondary btn-sm">Manage</a>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Error fetching today appointments:', err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #dc2626; padding: 20px;">Could not load today's appointments</td></tr>`;
  }
}

async function fetchDoctorsAvailability() {
  const tbody = document.getElementById('dashboard-doctors-body');
  try {
    const res = await fetch(`${API_BASE}/doctors`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const doctors = await res.json();

    if (!doctors || doctors.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-state"><h4>No doctors registered yet</h4></td></tr>`;
      return;
    }

    tbody.innerHTML = doctors.slice(0, 5).map(doc => {
      let statusClass = 'status-available';
      const s = (doc.availabilityStatus || 'available').toLowerCase();
      if (s.includes('busy')) statusClass = 'status-busy';
      else if (s.includes('leave')) statusClass = 'status-on-leave';

      return `
        <tr>
          <td><strong>#DOC-${doc.id}</strong></td>
          <td>${escapeHtml(doc.fullName)}</td>
          <td>${escapeHtml(doc.specialization)}</td>
          <td>${escapeHtml(doc.phone)}</td>
          <td><span class="status-badge ${statusClass}">${escapeHtml(doc.availabilityStatus)}</span></td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Error fetching doctors:', err);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #dc2626; padding: 20px;">Could not load doctor list</td></tr>`;
  }
}

function formatTime(t) {
  if (!t) return '--';
  return t.substring(0, 5);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}
