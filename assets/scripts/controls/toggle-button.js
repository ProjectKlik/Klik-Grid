export function toggleButton(callback) {
    document.querySelectorAll('.toggle-button-group').forEach(group => {
        group.querySelectorAll('button:not([data-initialized])').forEach(button => {
            // Mark as initialized to prevent duplicate handlers
            button.dataset.initialized = 'true';

            button.addEventListener('click', () => {
                // Toggle group logic
                group.querySelectorAll('button').forEach(btn => {
                    btn.classList.toggle('active', btn === button);
                });

                // Pass both the button element and its data-toggle-value to callback
                callback?.(button, button.dataset.toggleValue);
            });
        });
    });
}