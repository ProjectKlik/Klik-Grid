export function radioButton(callback) {
    document.querySelectorAll('.radio-button-group').forEach(group => {
        group.querySelectorAll('input[type="radio"]:not([data-initialized])').forEach(radio => {
            // Mark as initialized to prevent duplicate handlers
            radio.dataset.initialized = 'true';

            radio.addEventListener('change', () => {
                if (radio.checked) {
                    // Pass both the radio element and its data-radio-value to callback
                    callback?.(radio, radio.dataset.radioValue);
                }
            });
        });
    });
}