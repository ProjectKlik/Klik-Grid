export function dropdown(callback) {
    document.querySelectorAll('.dropdown-container:not([data-initialized])').forEach(container => {
        // Mark as initialized to prevent duplicate handlers
        container.dataset.initialized = 'true';

        const btn = container.querySelector('.dropdown-button');
        const list = container.querySelector('.dropdown-list');

        // Toggle dropdown visibility
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(container);
        });

        // Handle item selection
        list.querySelectorAll('li:not(.has-submenu)').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                callback?.(btn, item.textContent.trim());
                closeDropdown(container);
            });
        });
    });

    // Close dropdowns when clicking outside
    window.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-container.active').forEach(closeDropdown);
    });
}

/* ===================== */
/* HELPER FUNCTIONS */
/* ===================== */

function toggleDropdown(container) {
    document.querySelectorAll('.dropdown-container').forEach(d => {
        if (d === container) {
            d.classList.toggle('active');
            d.querySelector('.dropdown-button').classList.toggle('active');
        } else {
            closeDropdown(d);
        }
    });
}

function closeDropdown(container) {
    container.classList.remove('active');
    container.querySelector('.dropdown-button').classList.remove('active');
}