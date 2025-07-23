export function checkboxButton(callback) {
    document.querySelectorAll('.checkbox-button-group').forEach(group => {
        group.querySelectorAll('input[type="checkbox"]:not([data-initialized])').forEach(checkbox => {
            // Mark as initialized to prevent duplicate handlers
            checkbox.dataset.initialized = 'true';

            // Get the associated label text
            const labelText = checkbox.closest('label')?.querySelector('span')?.textContent || '';

            checkbox.addEventListener('change', () => {
                // Pass the checkbox element, its label, its data-radio-value and its state to callback
                callback?.(
                    checkbox,
                    labelText,
                    checkbox.dataset.checkboxValue,
                    checkbox.checked
                );
            });
        });
    });
}