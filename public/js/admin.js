// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const adminNavRight = document.getElementById('adminNavRight');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

// Dashboard Elements
const servicesTableBody = document.getElementById('servicesTableBody');
const dashboardError = document.getElementById('dashboardError');
const serviceModal = document.getElementById('serviceModal');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const serviceForm = document.getElementById('serviceForm');
const modalTitle = document.getElementById('modalTitle');
const currentImageInfo = document.getElementById('currentImageInfo');

// Check authentication
const checkAuth = () => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'flex';
    adminNavRight.style.display = 'block';
    fetchAdminServices();
  } else {
    loginSection.style.display = 'block';
    dashboardSection.style.display = 'none';
    adminNavRight.style.display = 'none';
  }
};

// Handle Login
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        checkAuth();
      } else {
        loginError.style.display = 'block';
        loginError.textContent = data.message || 'Login failed';
      }
    } catch (error) {
      loginError.style.display = 'block';
      loginError.textContent = 'Network error. Try again.';
    }
  });
}

// Handle Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    checkAuth();
  });
}

// Fetch Services for Admin
const fetchAdminServices = async () => {
  const token = localStorage.getItem('adminToken');
  try {
    const res = await fetch('/api/services/admin/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await res.json();
    
    if (result.success) {
      renderTable(result.data);
    } else {
      if(res.status === 401) {
        localStorage.removeItem('adminToken');
        checkAuth();
      } else {
        showDashError('Failed to load services.');
      }
    }
  } catch (error) {
    showDashError('Network error while loading services.');
  }
};

// Render Table
const renderTable = (services) => {
  servicesTableBody.innerHTML = '';
  
  if (services.length === 0) {
    servicesTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No services found.</td></tr>';
    return;
  }

  services.forEach(service => {
    const statusClass = service.status === 'active' ? 'status-active' : 'status-inactive';
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
      <td><img src="${service.image_url}" alt="thumb" style="width: 50px; height: 50px; object-fit: cover; border-radius: 0.25rem;"></td>
      <td style="font-weight: 500;">${service.title}</td>
      <td>${service.category}</td>
      <td>$${service.price}</td>
      <td><span class="status-badge ${statusClass}">${service.status}</span></td>
      <td>
        <div class="action-btns-sm">
          <button class="btn btn-outline btn-sm edit-btn" data-service='${JSON.stringify(service).replace(/'/g, "&#39;")}'>Edit</button>
          <button class="btn btn-primary btn-sm delete-btn" data-id="${service._id}" style="background-color: #ef4444; border-color: #ef4444;">Delete</button>
        </div>
      </td>
    `;
    
    servicesTableBody.appendChild(tr);
  });

  // Attach event listeners to new buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const service = JSON.parse(e.target.getAttribute('data-service'));
      openEditModal(service);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this service?')) {
        deleteService(id);
      }
    });
  });
};

// Modal Logic
if (openAddModalBtn) {
  openAddModalBtn.addEventListener('click', () => {
    serviceForm.reset();
    document.getElementById('serviceId').value = '';
    modalTitle.textContent = 'Add New Service';
    currentImageInfo.textContent = 'Upload a new image (Required)';
    document.getElementById('s_image').required = true;
    serviceModal.classList.add('show');
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', () => {
    serviceModal.classList.remove('show');
  });
}

const openEditModal = (service) => {
  document.getElementById('serviceId').value = service._id;
  document.getElementById('s_title').value = service.title;
  document.getElementById('s_category').value = service.category;
  document.getElementById('s_price').value = service.price;
  document.getElementById('s_status').value = service.status;
  document.getElementById('s_short_desc').value = service.short_description;
  document.getElementById('s_full_desc').value = service.full_description;
  
  modalTitle.textContent = 'Edit Service';
  currentImageInfo.textContent = 'Leave empty to keep current image.';
  document.getElementById('s_image').required = false; // Not required for edit
  
  serviceModal.classList.add('show');
};

// Handle Form Submit (Create or Update)
if (serviceForm) {
  serviceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('serviceId').value;
    const isEdit = id !== '';
    const token = localStorage.getItem('adminToken');
    
    const formData = new FormData();
    formData.append('title', document.getElementById('s_title').value);
    formData.append('category', document.getElementById('s_category').value);
    formData.append('price', document.getElementById('s_price').value);
    formData.append('status', document.getElementById('s_status').value);
    formData.append('short_description', document.getElementById('s_short_desc').value);
    formData.append('full_description', document.getElementById('s_full_desc').value);
    
    const imageFile = document.getElementById('s_image').files[0];
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const url = isEdit ? `/api/services/${id}` : '/api/services';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData // No Content-Type header so browser sets multipart boundary
      });

      const result = await res.json();

      if (result.success) {
        serviceModal.classList.remove('show');
        fetchAdminServices();
      } else {
        alert(result.message || 'Error saving service');
      }
    } catch (error) {
      alert('Network error while saving service');
    }
  });
}

// Delete Service
const deleteService = async (id) => {
  const token = localStorage.getItem('adminToken');
  try {
    const res = await fetch(`/api/services/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await res.json();
    if (result.success) {
      fetchAdminServices();
    } else {
      alert('Error deleting service');
    }
  } catch (error) {
    alert('Network error while deleting service');
  }
};

const showDashError = (msg) => {
  dashboardError.style.display = 'block';
  dashboardError.textContent = msg;
};

// Initialize
document.addEventListener('DOMContentLoaded', checkAuth);
