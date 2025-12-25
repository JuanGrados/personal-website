document.addEventListener('DOMContentLoaded', () => {
    // Target project cards (already have .reveal class)
    const existingRevealElements = document.querySelectorAll('.reveal');

    // Target content elements in single pages (add .reveal class dynamically)
    const proseElements = document.querySelectorAll('.prose > *');
    proseElements.forEach(el => el.classList.add('reveal'));

    // Combine all elements to observe
    const allElements = [...existingRevealElements, ...proseElements];

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% is visible
        rootMargin: "0px 0px -20px 0px" // Offset slightly
    });

    allElements.forEach(element => {
        revealObserver.observe(element);
    });

    // Parallax Effect for Hero
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const rate = 0.5;

            const heroContent = hero.querySelector('.hero-content');
            if (heroContent) {
                // Use translate3d for better performance
                heroContent.style.transform = `translate3d(0, ${scrolled * rate}px, 0)`;
                heroContent.style.opacity = 1 - (scrolled / 700);
            }
        });
    }
});
