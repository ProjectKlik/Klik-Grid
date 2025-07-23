export function button(callback) {
  document.querySelectorAll('.button-group').forEach(group => {
    group.querySelectorAll('button:not([data-initialized])').forEach(button => {
      // Mark as initialized to prevent duplicate handlers
      button.dataset.initialized = 'true';
      
      button.addEventListener('click', () => {
        // Pass both the button element and its data-button-value to callback
        callback?.(button, button.dataset.buttonValue);
      });
    });
  });
}