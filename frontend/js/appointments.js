// =====================================================================
// Appointment Management Logic - MedCare HMS
// Booking, Rescheduling, Cancelling, Filtering & Collision Detection
// =====================================================================

const API_BASE = '/api';

const appointmentsTableBody = document.getElementById('appointments-table-body');
const appointmentModal = document.getElementById('appointment-modal');
const appointmentDetailsModal = document.getElementById('appointment-details-modal');
const appointmentForm = document.getElementById('appointment-form');
const appointmentModalTitle = document.getElementById('appointment-modal-title');
const appointmentFormAlert = document.getElementById('appointment-form-alert');
const appointmentCountBadge = document.getElementById('appointment-count-badge');

// Filter Controls
const filterDate = document.getElementById('filter-date');
const filterDoctor = document.getElementById('filter-doctor');
const filterPatient = document.getElementById('filter-patient');
const filterStatus = document.getElementById('filter-status');

// Form Controls
const apptPatientSelect = document.getElementById('appointment-patient-select');
const apptDoctorSelect = document.getElementById('appointment-doctor-select');
const apptDateInput = document.getElementById('appointment-date-input');
const apptStatusSelect = document.getElementById('appointment-status-select');
const apptStartTime = document.getElementById('appointment-start-time');
const apptEndTime = document.getElementById('appointment-end-time');
const apptNotes = document.getElementById('appointment-notes');
const apptIdInput = document.getElementById('appointment-id-input');

let patientsCache = [];
let doctorsCache = [];

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([loadPatientsOptions(), loadDoctorsOptions()]);
  loadAppointments();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('open-book-modal-btn').addEventListener('click', () => openAppointmentModal());
  document.getElementById('close-appointment-modal-btn').addEventListener('click', () => appointmentModal.close());
  document.getElementById('cancel-appointment-modal-btn').addEventListener('click', () => appointmentModal.close());

  document.getElementById('close-appt-details-btn').addEventListener('click', () => appointmentDetailsModal.close());
  document.getElementById('dismiss-appt-details-btn').addEventListener('click', () => appointmentDetailsModal.close());

  appointmentForm.addEventListener('submit', handleAppointmentSubmit);

  document.getElementById('apply-filters-btn').addEventListener('click', () => loadAppointments());
  document.getElementById('reset-filters-btn').addEventListener('click', () => {
    filterDate.value = '';
    filterDoctor.value = '';
    filterPatient.value = '';
    filterStatus.value = '';
    loadAppointments();
  });
}

async function loadPatientsOptions() {
  try {
    const res = await fetch(`${API_BASE}/patients`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    patientsCache = await res.json();

    const options = patientsCache.map(p =>
      `<option value="${p.id}">${escapeHtml(p.fullName)} (#PAT-${p.id})</option>`
    ).join('');

    filterPatient.innerHTML = '<option value="">All Patients</option>' + options;
    apptPatientSelect.innerHTML = '<option value="">-- Select Patient --</option>' + options;
  } catch (err) {
    console.error('Failed to load patient options:', err);
  }
}

async function loadDoctorsOptions() {
  try {
    const res = await fetch(`${API_BASE}/doctors`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    doctorsCache = await res.json();

    const options = doctorsCache.map(d =>
      `<option value="${d.id}">${escapeHtml(d.fullName)} (${escapeHtml(d.specialization)})</option>`
    ).join('');

    filterDoctor.innerHTML = '<option value="">All Doctors</option>' + options;
    apptDoctorSelect.innerHTML = '<option value="">-- Select Doctor --</option>' + options;
  } catch (err) {
    console.error('Failed to load doctor options:', err);
  }
}

async function loadAppointments() {
  try {
    const params = new URLSearchParams();
    if (filterDate.value) params.append('date', filterDate.value);
    if (filterDoctor.value) params.append('doctorId', filterDoctor.value);
    if (filterPatient.value) params.append('patientId', filterPatient.value);
    if (filterStatus.value) params.append('status', filterStatus.value);

    const queryString = params.toString();
    const url = `${API_BASE}/appointments${queryString ? '?' + queryString : ''}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const appointments = await res.json();

    appointmentCountBadge.textContent = `${appointments.length} Appointment${appointments.length === 1 ? '' : 's'}`;

    if (!appointments || appointments.length === 0) {
      appointmentsTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="empty-state">
            <h4>No appointments found</h4>
            <p>No records match your selected criteria. Click "+ Book New Appointment" to schedule one.</p>
          </td>
        </tr>
      `;
      return;
    }

    appointmentsTableBody.innerHTML = appointments.map(app => {
      const patientName = app.patient ? app.patient.fullName : 'Unknown Patient';
      const doctorName = app.doctor ? app.doctor.fullName : 'Unknown Doctor';
      const statusClass = `status-${(app.status || 'scheduled').toLowerCase()}`;
      const isCancelled = app.status === 'Cancelled';

      return `
        <tr>
          <td><strong>#APT-${app.id}</strong></td>
          <td><strong>${escapeHtml(patientName)}</strong></td>
          <td>${escapeHtml(doctorName)}</td>
          <td>${formatDate(app.appointmentDate)}</td>
          <td>${formatTime(app.startTime)} - ${formatTime(app.endTime)}</td>
          <td><span class="status-badge ${statusClass}">${escapeHtml(app.status)}</span></td>
          <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-muted);">
            ${escapeHtml(app.notes || '—')}
          </td>
          <td>
            <div class="action-buttons">
              <button class="action-btn" title="View Appointment Details" onclick="viewAppointmentDetails(${app.id})">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button class="action-btn" title="Edit / Reschedule" onclick="editAppointment(${app.id})">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              ${!isCancelled ? `
                <button class="action-btn cancel-btn" title="Cancel Appointment" onclick="cancelAppointment(${app.id})">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading appointments:', err);
    appointmentsTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #dc2626; padding: 20px;">Could not load appointments</td></tr>`;
  }
}

function openAppointmentModal(app = null) {
  appointmentFormAlert.style.display = 'none';
  appointmentForm.reset();

  if (app) {
    appointmentModalTitle.textContent = `Reschedule / Update Appointment (#APT-${app.id})`;
    apptIdInput.value = app.id;
    apptPatientSelect.value = app.patient ? app.patient.id : '';
    apptDoctorSelect.value = app.doctor ? app.doctor.id : '';
    apptDateInput.value = app.appointmentDate;
    apptStatusSelect.value = app.status || 'Scheduled';
    apptStartTime.value = app.startTime ? app.startTime.substring(0, 5) : '';
    apptEndTime.value = app.endTime ? app.endTime.substring(0, 5) : '';
    apptNotes.value = app.notes || '';
  } else {
    appointmentModalTitle.textContent = 'Book New Appointment';
    apptIdInput.value = '';
    apptDateInput.value = new Date().toISOString().split('T')[0];
    apptStatusSelect.value = 'Scheduled';
    apptStartTime.value = '10:00';
    apptEndTime.value = '10:30';
  }

  appointmentModal.showModal();
}

async function editAppointment(id) {
  try {
    const res = await fetch(`${API_BASE}/appointments/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const app = await res.json();
    openAppointmentModal(app);
  } catch (err) {
    console.error('Failed to load appointment for edit:', err);
    showToast('Failed to load appointment details', 'error');
  }
}

async function viewAppointmentDetails(id) {
  try {
    const res = await fetch(`${API_BASE}/appointments/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const app = await res.json();

    const patientName = app.patient ? app.patient.fullName : '—';
    const patientPhone = app.patient ? app.patient.phone : '—';
    const doctorName = app.doctor ? app.doctor.fullName : '—';
    const doctorSpec = app.doctor ? app.doctor.specialization : '—';
    const statusClass = `status-${(app.status || 'scheduled').toLowerCase()}`;

    const container = document.getElementById('appointment-details-content');
    container.innerHTML = `
      <div class="detail-row">
        <span class="detail-label">Appointment ID:</span>
        <span class="detail-value"><strong>#APT-${app.id}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Current Status:</span>
        <span class="detail-value"><span class="status-badge ${statusClass}">${escapeHtml(app.status)}</span></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Patient:</span>
        <span class="detail-value"><strong>${escapeHtml(patientName)}</strong> (Tel: ${escapeHtml(patientPhone)})</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Attending Doctor:</span>
        <span class="detail-value"><strong>${escapeHtml(doctorName)}</strong> &bull; ${escapeHtml(doctorSpec)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Appointment Date:</span>
        <span class="detail-value">${formatDate(app.appointmentDate)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Consultation Slot:</span>
        <span class="detail-value"><strong>${formatTime(app.startTime)}</strong> to <strong>${formatTime(app.endTime)}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Notes / Instructions:</span>
        <span class="detail-value">${escapeHtml(app.notes || 'No general notes specified.')}</span>
      </div>
    `;

    appointmentDetailsModal.showModal();
  } catch (err) {
    console.error('Failed to load appointment details:', err);
    showToast('Failed to load appointment details', 'error');
  }
}

async function handleAppointmentSubmit(e) {
  e.preventDefault();
  appointmentFormAlert.style.display = 'none';

  const startTime = apptStartTime.value;
  const endTime = apptEndTime.value;

  if (startTime >= endTime) {
    appointmentFormAlert.textContent = 'Validation Error: Start time must be before end time.';
    appointmentFormAlert.style.display = 'block';
    return;
  }

  const id = apptIdInput.value;
  const payload = {
    patientId: parseInt(apptPatientSelect.value, 10),
    doctorId: parseInt(apptDoctorSelect.value, 10),
    appointmentDate: apptDateInput.value,
    startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
    endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
    status: apptStatusSelect.value,
    notes: apptNotes.value.trim()
  };

  try {
    const isEdit = !!id;
    const url = isEdit ? `${API_BASE}/appointments/${id}` : `${API_BASE}/appointments`;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Operation failed');
    }

    appointmentModal.close();
    showToast(isEdit ? 'Appointment updated / rescheduled' : 'Appointment booked successfully', 'success');
    loadAppointments();
  } catch (err) {
    console.error('Error saving appointment:', err);
    appointmentFormAlert.textContent = err.message || 'Failed to save appointment';
    appointmentFormAlert.style.display = 'block';
  }
}

async function cancelAppointment(id) {
  if (!confirm(`Are you sure you want to cancel appointment #APT-${id}?`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/appointments/${id}/cancel`, {
      method: 'PATCH'
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to cancel appointment');

    showToast(`Appointment #APT-${id} cancelled`, 'warning');
    loadAppointments();
  } catch (err) {
    console.error('Error cancelling appointment:', err);
    showToast('Could not cancel appointment', 'error');
  }
}

function formatDate(d) {
  if (!d) return '--';
  return d;
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
