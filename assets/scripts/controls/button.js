export function button(callback) {
    document.querySelectorAll('.button-group').forEach(group => {
        const buttons = group.querySelectorAll('button');
        buttons.forEach(btn => {
            // Skip if already initialized
            if (btn.dataset.toggleInitialized) return;
            btn.dataset.toggleInitialized = 'true';

            btn.addEventListener('click', () => {
                // Call callback if provided and pass the button and value
                if (callback) {
                    callback(btn, btn.dataset.buttonValue);
                }
            });
        });
    });
}
