// =====================================================================
// Patient Management Logic - MedCare HMS
// Full CRUD Operations, Searching, Modals & Validation
// =====================================================================

const API_BASE = '/api';

const patientsTableBody = document.getElementById('patients-table-body');
const patientModal = document.getElementById('patient-modal');
const patientDetailsModal = document.getElementById('patient-details-modal');
const patientForm = document.getElementById('patient-form');
const patientModalTitle = document.getElementById('patient-modal-title');
const patientFormAlert = document.getElementById('patient-form-alert');
const patientCountBadge = document.getElementById('patient-count-badge');
const patientSearchInput = document.getElementById('patient-search-input');

document.addEventListener('DOMContentLoaded', () => {
  loadPatients();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('open-add-patient-btn').addEventListener('click', () => openPatientModal());
  document.getElementById('close-patient-modal-btn').addEventListener('click', () => patientModal.close());
  document.getElementById('cancel-patient-btn').addEventListener('click', () => patientModal.close());

  document.getElementById('close-patient-details-btn').addEventListener('click', () => patientDetailsModal.close());
  document.getElementById('dismiss-patient-details-btn').addEventListener('click', () => patientDetailsModal.close());

  patientForm.addEventListener('submit', handlePatientSubmit);

  document.getElementById('search-patient-btn').addEventListener('click', () => {
    loadPatients(patientSearchInput.value.trim());
  });

  patientSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      loadPatients(patientSearchInput.value.trim());
    }
  });

  document.getElementById('reset-patient-search-btn').addEventListener('click', () => {
    patientSearchInput.value = '';
    loadPatients();
  });
}

async function loadPatients(searchQuery = '') {
  try {
    let url = `${API_BASE}/patients`;
    if (searchQuery) {
      url += `?search=${encodeURIComponent(searchQuery)}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const patients = await res.json();

    patientCountBadge.textContent = `${patients.length} Patient${patients.length === 1 ? '' : 's'}`;

    if (!patients || patients.length === 0) {
      patientsTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="empty-state">
            <h4>No patients found</h4>
            <p>${searchQuery ? 'No records match your search criteria.' : 'Click "+ Register New Patient" to add one.'}</p>
          </td>
        </tr>
      `;
      return;
    }

    patientsTableBody.innerHTML = patients.map(p => `
      <tr>
        <td><strong>#PAT-${p.id}</strong></td>
        <td><strong>${escapeHtml(p.fullName)}</strong></td>
        <td>${p.age} yrs</td>
        <td>${escapeHtml(p.gender)}</td>
        <td>${escapeHtml(p.phone)}</td>
        <td>${escapeHtml(p.email)}</td>
        <td>${formatDate(p.registrationDate)}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn" title="View Details" onclick="viewPatientDetails(${p.id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="action-btn" title="Edit Patient" onclick="editPatient(${p.id})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="action-btn delete-btn" title="Delete Patient" onclick="deletePatient(${p.id}, '${escapeHtml(p.fullName)}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Error loading patients:', err);
    patientsTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #dc2626; padding: 20px;">Could not load patient records</td></tr>`;
  }
}

function openPatientModal(patient = null) {
  patientFormAlert.style.display = 'none';
  patientForm.reset();

  if (patient) {
    patientModalTitle.textContent = `Edit Patient: ${patient.fullName}`;
    document.getElementById('patient-id-input').value = patient.id;
    document.getElementById('patient-name').value = patient.fullName;
    document.getElementById('patient-age').value = patient.age;
    document.getElementById('patient-gender').value = patient.gender;
    document.getElementById('patient-phone').value = patient.phone;
    document.getElementById('patient-email').value = patient.email;
    document.getElementById('patient-address').value = patient.address;
    document.getElementById('patient-reg-date').value = patient.registrationDate;
  } else {
    patientModalTitle.textContent = 'Register New Patient';
    document.getElementById('patient-id-input').value = '';
    document.getElementById('patient-reg-date').value = new Date().toISOString().split('T')[0];
  }

  patientModal.showModal();
}

async function editPatient(id) {
  try {
    const res = await fetch(`${API_BASE}/patients/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const patient = await res.json();
    openPatientModal(patient);
  } catch (err) {
    console.error('Failed to get patient for edit:', err);
    showToast('Failed to load patient details for edit', 'error');
  }
}

async function viewPatientDetails(id) {
  try {
    const res = await fetch(`${API_BASE}/patients/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const p = await res.json();

    const container = document.getElementById('patient-details-content');
    container.innerHTML = `
      <div class="detail-row">
        <span class="detail-label">Patient Record ID:</span>
        <span class="detail-value"><strong>#PAT-${p.id}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Full Name:</span>
        <span class="detail-value"><strong>${escapeHtml(p.fullName)}</strong></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Age &amp; Gender:</span>
        <span class="detail-value">${p.age} years old &bull; ${escapeHtml(p.gender)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Phone Number:</span>
        <span class="detail-value">${escapeHtml(p.phone)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Email Address:</span>
        <span class="detail-value">${escapeHtml(p.email)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Residential Address:</span>
        <span class="detail-value">${escapeHtml(p.address)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Registration Date:</span>
        <span class="detail-value">${formatDate(p.registrationDate)}</span>
      </div>
    `;

    patientDetailsModal.showModal();
  } catch (err) {
    console.error('Failed to load patient details:', err);
    showToast('Could not load patient details', 'error');
  }
}

async function handlePatientSubmit(e) {
  e.preventDefault();
  patientFormAlert.style.display = 'none';

  const id = document.getElementById('patient-id-input').value;
  const payload = {
    fullName: document.getElementById('patient-name').value.trim(),
    age: parseInt(document.getElementById('patient-age').value, 10),
    gender: document.getElementById('patient-gender').value,
    phone: document.getElementById('patient-phone').value.trim(),
    email: document.getElementById('patient-email').value.trim(),
    address: document.getElementById('patient-address').value.trim(),
    registrationDate: document.getElementById('patient-reg-date').value
  };

  try {
    const isEdit = !!id;
    const url = isEdit ? `${API_BASE}/patients/${id}` : `${API_BASE}/patients`;
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

    patientModal.close();
    showToast(isEdit ? 'Patient updated successfully' : 'Patient registered successfully', 'success');
    loadPatients(patientSearchInput.value.trim());
  } catch (err) {
    console.error('Error saving patient:', err);
    patientFormAlert.textContent = err.message || 'Failed to save patient';
    patientFormAlert.style.display = 'block';
  }
}

async function deletePatient(id, name) {
  if (!confirm(`Are you sure you want to delete patient "${name}" (#PAT-${id})?\nAll associated appointments will also be deleted.`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/patients/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      throw new Error('Failed to delete patient');
    }

    showToast(`Patient "${name}" deleted successfully`, 'success');
    loadPatients(patientSearchInput.value.trim());
  } catch (err) {
    console.error('Error deleting patient:', err);
    showToast('Could not delete patient', 'error');
  }
}

function formatDate(d) {
  if (!d) return '--';
  return d;
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
