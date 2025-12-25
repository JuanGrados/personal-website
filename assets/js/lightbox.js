document.addEventListener('DOMContentLoaded', () => {
  // Create lightbox elements
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';

  const img = document.createElement('img');

  const closeBtn = document.createElement('span');
  closeBtn.className = 'lightbox-close';
  closeBtn.innerHTML = '&times;';

  const prevBtn = document.createElement('span');
  prevBtn.className = 'lightbox-nav lightbox-prev';
  prevBtn.innerHTML = '&#10094;'; // Left arrow

  const nextBtn = document.createElement('span');
  nextBtn.className = 'lightbox-nav lightbox-next';
  nextBtn.innerHTML = '&#10095;'; // Right arrow

  lightbox.appendChild(img);
  lightbox.appendChild(closeBtn);
  lightbox.appendChild(prevBtn);
  lightbox.appendChild(nextBtn);
  document.body.appendChild(lightbox);

  // State
  let galleryImages = []; // Array of image sources
  let currentIndex = 0;

  // Function to open lightbox
  const openLightbox = (index) => {
    currentIndex = index;
    updateImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  const updateImage = () => {
    if (galleryImages.length > 0) {
      img.src = galleryImages[currentIndex];
    }
  };

  const nextImage = (e) => {
    if (e) e.stopPropagation();
    currentIndex = (currentIndex + 1) % galleryImages.length;
    updateImage();
  };

  const prevImage = (e) => {
    if (e) e.stopPropagation();
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    updateImage();
  };

  // Function to close lightbox
  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Event listeners for closing and navigation
  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', prevImage);
  nextBtn.addEventListener('click', nextImage);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  });

  // Attach to gallery items
  // We need to collect all images first to build the navigation list
  const imageElements = Array.from(document.querySelectorAll('.gallery-item img, .lightbox-trigger'));

  // Populate the source array
  galleryImages = imageElements.map(img => img.src);

  imageElements.forEach((image, index) => {
    image.addEventListener('click', () => {
      openLightbox(index);
    });
  });
});
