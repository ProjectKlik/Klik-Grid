export function checkboxButton(callback) {
    document.querySelectorAll('.checkbox-button-group').forEach(group => {
        const buttons = group.querySelectorAll('input[type="checkbox"]');
        buttons.forEach(btn => {
            // Skip if already initialized
            if (btn.dataset.toggleInitialized) return;
            btn.dataset.toggleInitialized = 'true';

            btn.addEventListener('change', () => {
                // Call callback if provided and pass the button and value
                if (callback) callback(btn, btn.dataset.checkboxValue);
            });
        });
    });
}