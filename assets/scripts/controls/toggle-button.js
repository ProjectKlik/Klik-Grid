export function toggleButton(callback) {
    document.querySelectorAll('.toggle-button-group').forEach(group => {
        const buttons = group.querySelectorAll('button');
        buttons.forEach(btn => {
            // Skip if already initialized
            if (btn.dataset.toggleInitialized) return;
            btn.dataset.toggleInitialized = 'true';

            btn.addEventListener('click', () => {
                // Remove active class from all buttons and add it to the clicked button
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Call callback if provided and pass the button and value
                if (callback) {
                    callback(btn, btn.dataset.toggleValue);
                }
            });
        });
    });
}
