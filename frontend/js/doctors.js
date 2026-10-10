// =====================================================================
// Doctor Management Logic - MedCare HMS
// Full CRUD Operations, Searching, Availability & Validation
// =====================================================================

const API_BASE = '/api';

const doctorsTableBody = document.getElementById('doctors-table-body');
const doctorModal = document.getElementById('doctor-modal');
const doctorForm = document.getElementById('doctor-form');
const doctorModalTitle = document.getElementById('doctor-modal-title');
const doctorFormAlert = document.getElementById('doctor-form-alert');
const doctorCountBadge = document.getElementById('doctor-count-badge');
const doctorSearchInput = document.getElementById('doctor-search-input');

document.addEventListener('DOMContentLoaded', () => {
  loadDoctors();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('open-add-doctor-btn').addEventListener('click', () => openDoctorModal());
  document.getElementById('close-doctor-modal-btn').addEventListener('click', () => doctorModal.close());
  document.getElementById('cancel-doctor-btn').addEventListener('click', () => doctorModal.close());

  doctorForm.addEventListener('submit', handleDoctorSubmit);

  document.getElementById('search-doctor-btn').addEventListener('click', () => {
    loadDoctors(doctorSearchInput.value.trim());
  });

  doctorSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      loadDoctors(doctorSearchInput.value.trim());
    }
  });

  document.getElementById('reset-doctor-search-btn').addEventListener('click', () => {
    doctorSearchInput.value = '';
    loadDoctors();
  });
}

async function loadDoctors(searchQuery = '') {
  try {
    let url = `${API_BASE}/doctors`;
    if (searchQuery) {
      url += `?search=${encodeURIComponent(searchQuery)}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const doctors = await res.json();

    doctorCountBadge.textContent = `${doctors.length} Doctor${doctors.length === 1 ? '' : 's'}`;

    if (!doctors || doctors.length === 0) {
      doctorsTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <h4>No doctors found</h4>
            <p>${searchQuery ? 'No records match your search query.' : 'Click "+ Add Doctor" to register a medical specialist.'}</p>
          </td>
        </tr>
      `;
      return;
    }

    doctorsTableBody.innerHTML = doctors.map(doc => {
      let statusClass = 'status-available';
      const statusLower = (doc.availabilityStatus || 'available').toLowerCase();
      if (statusLower.includes('busy')) statusClass = 'status-busy';
      else if (statusLower.includes('leave')) statusClass = 'status-on-leave';

      return `
        <tr>
          <td><strong>#DOC-${doc.id}</strong></td>
          <td><strong>${escapeHtml(doc.fullName)}</strong></td>
          <td><span style="font-weight: 600; color: #0284c7;">${escapeHtml(doc.specialization)}</span></td>
          <td>${escapeHtml(doc.phone)}</td>
          <td>${escapeHtml(doc.email)}</td>
          <td><span class="status-badge ${statusClass}">${escapeHtml(doc.availabilityStatus)}</span></td>
          <td>
            <div class="action-buttons">
              <button class="action-btn" title="Edit Doctor" onclick="editDoctor(${doc.id})">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="action-btn delete-btn" title="Delete Doctor" onclick="deleteDoctor(${doc.id}, '${escapeHtml(doc.fullName)}')">
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
    console.error('Error loading doctors:', err);
    doctorsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #dc2626; padding: 20px;">Could not load doctor records</td></tr>`;
  }
}

function openDoctorModal(doctor = null) {
  doctorFormAlert.style.display = 'none';
  doctorForm.reset();

  if (doctor) {
    doctorModalTitle.textContent = `Edit Doctor: ${doctor.fullName}`;
    document.getElementById('doctor-id-input').value = doctor.id;
    document.getElementById('doctor-name').value = doctor.fullName;
    document.getElementById('doctor-specialization').value = doctor.specialization;
    document.getElementById('doctor-availability').value = doctor.availabilityStatus;
    document.getElementById('doctor-phone').value = doctor.phone;
    document.getElementById('doctor-email').value = doctor.email;
  } else {
    doctorModalTitle.textContent = 'Add New Doctor';
    document.getElementById('doctor-id-input').value = '';
    document.getElementById('doctor-availability').value = 'Available';
  }

  doctorModal.showModal();
}

async function editDoctor(id) {
  try {
    const res = await fetch(`${API_BASE}/doctors/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const doctor = await res.json();
    openDoctorModal(doctor);
  } catch (err) {
    console.error('Failed to get doctor for edit:', err);
    showToast('Failed to load doctor details', 'error');
  }
}

async function handleDoctorSubmit(e) {
  e.preventDefault();
  doctorFormAlert.style.display = 'none';

  const id = document.getElementById('doctor-id-input').value;
  const payload = {
    fullName: document.getElementById('doctor-name').value.trim(),
    specialization: document.getElementById('doctor-specialization').value,
    availabilityStatus: document.getElementById('doctor-availability').value,
    phone: document.getElementById('doctor-phone').value.trim(),
    email: document.getElementById('doctor-email').value.trim()
  };

  try {
    const isEdit = !!id;
    const url = isEdit ? `${API_BASE}/doctors/${id}` : `${API_BASE}/doctors`;
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

    doctorModal.close();
    showToast(isEdit ? 'Doctor updated successfully' : 'Doctor registered successfully', 'success');
    loadDoctors(doctorSearchInput.value.trim());
  } catch (err) {
    console.error('Error saving doctor:', err);
    doctorFormAlert.textContent = err.message || 'Failed to save doctor';
    doctorFormAlert.style.display = 'block';
  }
}

async function deleteDoctor(id, name) {
  if (!confirm(`Are you sure you want to delete "${name}" (#DOC-${id})?\nTheir schedules and associated appointments will also be deleted.`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/doctors/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      throw new Error('Failed to delete doctor');
    }

    showToast(`Doctor "${name}" deleted successfully`, 'success');
    loadDoctors(doctorSearchInput.value.trim());
  } catch (err) {
    console.error('Error deleting doctor:', err);
    showToast('Could not delete doctor', 'error');
  }
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
