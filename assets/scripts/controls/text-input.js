export function textInput(callback) {
    document.querySelectorAll('.text-input:not([data-initialized])').forEach(input => {
        // Mark as initialized to prevent duplicate handlers
        input.dataset.initialized = 'true';

        // Initialize numeric validation if needed
        if (input.classList.contains('number')) {
            initNumberInput(input);
        }

        // Handle input changes
        input.addEventListener('input', () => {
            callback?.(input, input.value);
        });
    });
}

/* ===================== */
/* HELPER FUNCTIONS */
/* ===================== */

function initNumberInput(input) {
    // Allow these control keys
    const ALLOWED_KEYS = [
        'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight',
        'Home', 'End'
    ];

    input.addEventListener('keydown', (event) => {
        // Permit control keys and keyboard shortcuts
        if (ALLOWED_KEYS.includes(event.key) || (event.ctrlKey || event.metaKey)) {
            return;
        }

        // Block non-digit input
        if (!/^[0-9]$/.test(event.key)) {
            event.preventDefault();
        }
    });

    // Validate pasted content
    input.addEventListener('paste', (event) => {
        const pasteData = event.clipboardData?.getData('text') || '';
        if (/\D/.test(pasteData)) {
            event.preventDefault();
        }
    });
}