export function radioButton(callback) {
    document.querySelectorAll('.radio-button-group').forEach(group => {
        const buttons = group.querySelectorAll('input[type="radio"]');
        buttons.forEach(btn => {
            // Skip if already initialized
            if (btn.dataset.toggleInitialized) return;
            btn.dataset.toggleInitialized = 'true';

            btn.addEventListener('change', () => {
                // Call callback if provided and pass the button and value
                if (callback) callback(btn, btn.dataset.radioValue);
            });
        });
    });
}
