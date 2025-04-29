export function slider(callback) {
    document.querySelectorAll('.slider').forEach(slider => {
        // Skip if already initialized
        if (slider.dataset.sliderInitialized) return;
        slider.dataset.sliderInitialized = 'true';

        const valueDisplay = slider.nextElementSibling;
        const title = slider.closest('.slider-container').querySelector('.slider-title');

        function updateSliderBackground(slider) {
            const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
            slider.style.background = `linear-gradient(to right, var(--color-neutral-50) ${value}%, var(--color-neutral-800) ${value}%)`;
        }

        // Update immediately
        updateSliderBackground(slider);
        valueDisplay.textContent = slider.value;

        // Attach input event
        slider.addEventListener('input', () => {
            updateSliderBackground(slider);
            valueDisplay.textContent = slider.value;

            if (callback) callback(title, slider.value);
        });
    });
}