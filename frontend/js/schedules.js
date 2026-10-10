// =====================================================================
// Doctor Schedule Management Logic - MedCare HMS
// Working Days, Shifts, Validation & Conflict Checking
// =====================================================================

const API_BASE = '/api';

const schedulesTableBody = document.getElementById('schedules-table-body');
const scheduleModal = document.getElementById('schedule-modal');
const scheduleForm = document.getElementById('schedule-form');
const scheduleModalTitle = document.getElementById('schedule-modal-title');
const scheduleFormAlert = document.getElementById('schedule-form-alert');
const scheduleCountBadge = document.getElementById('schedule-count-badge');
const filterScheduleDoctor = document.getElementById('filter-schedule-doctor');
const scheduleDoctorSelect = document.getElementById('schedule-doctor-select');

let doctorsCache = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadDoctorsDropdown();
  loadSchedules();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('open-add-schedule-btn').addEventListener('click', () => openScheduleModal());
  document.getElementById('close-schedule-modal-btn').addEventListener('click', () => scheduleModal.close());
  document.getElementById('cancel-schedule-btn').addEventListener('click', () => scheduleModal.close());

  scheduleForm.addEventListener('submit', handleScheduleSubmit);

  filterScheduleDoctor.addEventListener('change', () => {
    loadSchedules(filterScheduleDoctor.value);
  });

  document.getElementById('reset-schedule-filter-btn').addEventListener('click', () => {
    filterScheduleDoctor.value = '';
    loadSchedules();
  });
}

async function loadDoctorsDropdown() {
  try {
    const res = await fetch(`${API_BASE}/doctors`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    doctorsCache = await res.json();

    const optionsHtml = doctorsCache.map(d =>
      `<option value="${d.id}">${escapeHtml(d.fullName)} (${escapeHtml(d.specialization)})</option>`
    ).join('');

    filterScheduleDoctor.innerHTML = '<option value="">All Doctors (View All Schedules)</option>' + optionsHtml;
    scheduleDoctorSelect.innerHTML = '<option value="">-- Choose Doctor --</option>' + optionsHtml;
  } catch (err) {
    console.error('Error loading doctor options:', err);
    showToast('Failed to load doctors list', 'error');
  }
}

async function loadSchedules(doctorId = '') {
  try {
    let url = `${API_BASE}/schedules`;
    if (doctorId) {
      url += `?doctorId=${encodeURIComponent(doctorId)}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const schedules = await res.json();

    scheduleCountBadge.textContent = `${schedules.length} Schedule${schedules.length === 1 ? '' : 's'}`;

    if (!schedules || schedules.length === 0) {
      schedulesTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <h4>No schedules found</h4>
            <p>${doctorId ? 'No schedule configured for this doctor yet.' : 'Click "+ Add Schedule" to configure doctor working hours.'}</p>
          </td>
        </tr>
      `;
      return;
    }

    schedulesTableBody.innerHTML = schedules.map(s => {
      const docName = s.doctor ? s.doctor.fullName : 'Unknown Doctor';
      const docSpec = s.doctor ? s.doctor.specialization : '--';

      return `
        <tr>
          <td><strong>#SCH-${s.id}</strong></td>
          <td><strong>${escapeHtml(docName)}</strong></td>
          <td><span style="color: #0284c7; font-weight: 500;">${escapeHtml(docSpec)}</span></td>
          <td><span class="status-badge status-scheduled" style="text-transform: capitalize;">${escapeHtml(s.dayOfWeek.toLowerCase())}</span></td>
          <td><strong>${formatTime(s.startTime)}</strong></td>
          <td><strong>${formatTime(s.endTime)}</strong></td>
          <td>
            <div class="action-buttons">
              <button class="action-btn" title="Edit Schedule" onclick="editSchedule(${s.id})">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="action-btn delete-btn" title="Delete Schedule" onclick="deleteSchedule(${s.id}, '${escapeHtml(docName)}', '${s.dayOfWeek}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading schedules:', err);
    schedulesTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #dc2626; padding: 20px;">Could not load schedules</td></tr>`;
  }
}

function openScheduleModal(schedule = null) {
  scheduleFormAlert.style.display = 'none';
  scheduleForm.reset();

  if (schedule) {
    scheduleModalTitle.textContent = `Edit Schedule (#SCH-${schedule.id})`;
    document.getElementById('schedule-id-input').value = schedule.id;
    scheduleDoctorSelect.value = schedule.doctor ? schedule.doctor.id : '';
    document.getElementById('schedule-day-select').value = schedule.dayOfWeek;
    document.getElementById('schedule-start-time').value = schedule.startTime ? schedule.startTime.substring(0, 5) : '';
    document.getElementById('schedule-end-time').value = schedule.endTime ? schedule.endTime.substring(0, 5) : '';
  } else {
    scheduleModalTitle.textContent = 'Configure Doctor Schedule';
    document.getElementById('schedule-id-input').value = '';
    if (filterScheduleDoctor.value) {
      scheduleDoctorSelect.value = filterScheduleDoctor.value;
    }
  }

  scheduleModal.showModal();
}

async function editSchedule(id) {
  try {
    const res = await fetch(`${API_BASE}/schedules/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const schedule = await res.json();
    openScheduleModal(schedule);
  } catch (err) {
    console.error('Failed to load schedule for edit:', err);
    showToast('Failed to load schedule details', 'error');
  }
}

async function handleScheduleSubmit(e) {
  e.preventDefault();
  scheduleFormAlert.style.display = 'none';

  const startTime = document.getElementById('schedule-start-time').value;
  const endTime = document.getElementById('schedule-end-time').value;

  if (startTime >= endTime) {
    scheduleFormAlert.textContent = 'Validation Error: Shift start time must be before end time.';
    scheduleFormAlert.style.display = 'block';
    return;
  }

  const id = document.getElementById('schedule-id-input').value;
  const payload = {
    doctorId: parseInt(scheduleDoctorSelect.value, 10),
    dayOfWeek: document.getElementById('schedule-day-select').value,
    startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
    endTime: endTime.length === 5 ? `${endTime}:00` : endTime
  };

  try {
    const isEdit = !!id;
    const url = isEdit ? `${API_BASE}/schedules/${id}` : `${API_BASE}/schedules`;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to save schedule');
    }

    scheduleModal.close();
    showToast(isEdit ? 'Schedule updated successfully' : 'Schedule created successfully', 'success');
    loadSchedules(filterScheduleDoctor.value);
  } catch (err) {
    console.error('Error saving schedule:', err);
    scheduleFormAlert.textContent = err.message || 'Failed to save schedule';
    scheduleFormAlert.style.display = 'block';
  }
}

async function deleteSchedule(id, docName, day) {
  if (!confirm(`Are you sure you want to delete ${docName}'s schedule on ${day} (#SCH-${id})?`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/schedules/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error('Failed to delete schedule');

    showToast('Schedule deleted successfully', 'success');
    loadSchedules(filterScheduleDoctor.value);
  } catch (err) {
    console.error('Error deleting schedule:', err);
    showToast('Could not delete schedule', 'error');
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
  setTimeout(() => toast.remove(), 4000);
}
