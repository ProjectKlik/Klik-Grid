export function textInput(callback) {
    document.querySelectorAll('.text-input').forEach(input => {
        // Skip if already initialized
        if (input.dataset.sliderInitialized) return;
        input.dataset.sliderInitialized = 'true';

        // Check if the input has number class
        if (input.classList.contains('number')) {
            input.addEventListener('keydown', (event) => {
                // Allow control keys: backspace, delete, tab, arrows, etc.
                const allowedKeys = [
                    'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight',
                    'Home', 'End'
                ];

                // Allow copy/paste/select all with ctrl/cmd
                if (allowedKeys.includes(event.key) || (event.ctrlKey || event.metaKey))
                {
                    return;
                }

                // Block anything that's not a digit (0–9)
                if (!/^[0-9]$/.test(event.key)) {
                    event.preventDefault();
                }
            });

            // Block non-numeric characters when pasting
            input.addEventListener('paste', (event) => {
                const pasteData = event.clipboardData.getData('text');
                if (/\D/.test(pasteData))
                {
                    event.preventDefault();
                }
            });
        }

        // Check if text has been changed, so we can call the callback
        input.addEventListener('input', () => {
            callback(input, input.value);
        });
    });
}