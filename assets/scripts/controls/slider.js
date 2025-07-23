export function slider(callback) {
    document.querySelectorAll('.slider:not([data-initialized])').forEach(slider => {
        // Mark as initialized to prevent duplicate handlers
        slider.dataset.initialized = 'true';

        const valueDisplay = slider.nextElementSibling;
        const title = slider.closest('.slider-container')?.querySelector('.slider-title');

        // Initialize display and styles
        updateSliderVisuals(slider, valueDisplay);

        // Handle input events
        slider.addEventListener('input', () => {
            updateSliderVisuals(slider, valueDisplay);
            callback?.(title, slider.value);
        });
    });
}

/* ===================== */
/* HELPER FUNCTIONS */
/* ===================== */

function updateSliderVisuals(slider, display) {
    // Calculate gradient percentage
    const percent = (slider.value - slider.min) / (slider.max - slider.min) * 100;

    // Update track background
    slider.style.background = `
    linear-gradient(
      to right,
      var(--color-neutral-50) ${percent}%,
      var(--color-neutral-800) ${percent}%
    )`;

    // Update displayed value
    if (display) display.textContent = slider.value;
}