let currentPage = 1;
const limit = 6;
let currentCategory = 'All';
let currentSearch = '';
let searchTimeout;

const grid = document.getElementById('servicesGrid');
const loader = document.getElementById('loader');
const errorMsg = document.getElementById('errorMsg');
const paginationContainer = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');

// Fetch and render services
const fetchServices = async () => {
  loader.style.display = 'block';
  grid.innerHTML = '';
  errorMsg.style.display = 'none';
  paginationContainer.innerHTML = '';

  try {
    let url = `/api/services?page=${currentPage}&limit=${limit}`;
    if (currentCategory !== 'All') {
      url += `&category=${currentCategory}`;
    }
    if (currentSearch) {
      url += `&search=${currentSearch}`;
    }

    const res = await fetch(url);
    const result = await res.json();

    loader.style.display = 'none';

    if (result.success) {
      renderServices(result.data);
      renderPagination(result.pages);
    } else {
      showError('Failed to load services.');
    }
  } catch (error) {
    loader.style.display = 'none';
    showError('Network error. Please try again later.');
    console.error(error);
  }
};

// Render service cards
const renderServices = (services) => {
  if (services.length === 0) {
    grid.innerHTML = '<div class="empty-state">No services found matching your criteria.</div>';
    return;
  }

  services.forEach(service => {
    const priceHtml = service.price > 0 ? `$${service.price}` : 'Custom Pricing';
    const imgPath = service.image_url.startsWith('http') ? service.image_url : service.image_url;

    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
      <img src="${imgPath}" alt="${service.title}" class="service-img" onerror="this.src='https://via.placeholder.com/600x400?text=No+Image'">
      <div class="service-content">
        <span class="service-category">${service.category}</span>
        <h3 class="service-title">${service.title}</h3>
        <p class="service-desc">${service.short_description}</p>
        <div class="service-footer">
          <span class="service-price">${priceHtml}</span>
          <a href="/service-details.html?slug=${service.slug}" class="service-link">
            Details <i class="fas fa-chevron-right"></i>
          </a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
};

// Render pagination buttons
const renderPagination = (totalPages) => {
  if (totalPages <= 1) return;

  // Prev Button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn';
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchServices();
      window.scrollTo(0, 0);
    }
  });
  paginationContainer.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `page-btn ${currentPage === i ? 'active' : ''}`;
    pageBtn.innerText = i;
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      fetchServices();
      window.scrollTo(0, 0);
    });
    paginationContainer.appendChild(pageBtn);
  }

  // Next Button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn';
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchServices();
      window.scrollTo(0, 0);
    }
  });
  paginationContainer.appendChild(nextBtn);
};

// Show Error
const showError = (msg) => {
  errorMsg.style.display = 'block';
  errorMsg.textContent = msg;
};

// Event Listeners
filterBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    filterBtns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentCategory = e.target.dataset.category;
    currentPage = 1;
    fetchServices();
  });
});

searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentSearch = e.target.value.trim();
    currentPage = 1;
    fetchServices();
  }, 500); // debounce 500ms
});

// Initial load
document.addEventListener('DOMContentLoaded', fetchServices);
