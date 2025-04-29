export function dropdown(callback) {
    document.querySelectorAll('.dropdown-container').forEach(container => {
        const btn = container.querySelector('.dropdown-button');
        const list = container.querySelector('.dropdown-list');

        // Skip if already initialized
        if (btn.dataset.toggleInitialized) return;
        btn.dataset.toggleInitialized = 'true';

        // Toggle dropdown visibility on button click
        btn.addEventListener('click', (event) => {
            // Prevent event propagation
            event.stopPropagation();

            // Toggle active class on the dropdown container to show/hide the menu
            container.classList.toggle('active');

            // Close other open dropdowns (if needed)
            document.querySelectorAll('.dropdown-container').forEach(otherContainer => {
                if (otherContainer !== container) {
                    otherContainer.classList.remove('active');
                }
            });

            // Add active class to the button
            btn.classList.toggle('active');
        });

        // Add click event listener to dropdown list items
        list.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', (event) => {
                // Prevent event propagation to avoid triggering the button click event
                event.stopPropagation();

                // Call the callback with the clicked item's value
                if (callback) {
                    callback(btn, item.textContent);
                }

                // Close the dropdown after selecting an option
                container.classList.remove('active');
                btn.classList.remove('active');
            });
        });
    });

    // Close dropdown if clicking outside
    window.addEventListener('click', (event) => {
        document.querySelectorAll('.dropdown-container').forEach(container => {
            if (!container.contains(event.target)) {
                container.classList.remove('active');
                const btn = container.querySelector('.dropdown-button');
                btn.classList.remove('active');
            }
        });
    });
}