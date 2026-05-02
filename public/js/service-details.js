document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  const loader = document.getElementById('loader');
  const errorMsg = document.getElementById('errorMsg');
  const detailsContent = document.getElementById('detailsContent');

  if (!slug) {
    loader.style.display = 'none';
    errorMsg.style.display = 'block';
    errorMsg.textContent = 'Service not specified.';
    return;
  }

  try {
    const res = await fetch(`/api/services/${slug}`);
    const result = await res.json();

    loader.style.display = 'none';

    if (result.success) {
      const service = result.data;

      // Update SEO Title
      document.title = `${service.title} | ServiceHub`;

      // Populate data
      document.getElementById('breadcrumbTitle').textContent = service.title;
      document.getElementById('serviceTitle').textContent = service.title;
      document.getElementById('serviceCategory').textContent = service.category;
      document.getElementById('serviceDesc').textContent = service.full_description;
      
      const priceHtml = service.price > 0 ? `$${service.price}` : 'Custom';
      document.getElementById('servicePrice').textContent = priceHtml;

      const imgPath = service.image_url.startsWith('http') ? service.image_url : service.image_url;
      const imgEl = document.getElementById('serviceImg');
      imgEl.src = imgPath;
      imgEl.alt = service.title;
      imgEl.onerror = () => { imgEl.src = 'https://via.placeholder.com/1200x800?text=No+Image'; };

      detailsContent.style.display = 'block';
    } else {
      errorMsg.style.display = 'block';
      errorMsg.textContent = 'Service not found.';
    }
  } catch (error) {
    loader.style.display = 'none';
    errorMsg.style.display = 'block';
    errorMsg.textContent = 'Network error. Please try again later.';
    console.error(error);
  }
});
