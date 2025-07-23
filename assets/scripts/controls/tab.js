export function tab(callback) {
    document.querySelectorAll('.tab-group:not([data-initialized])').forEach(group => {
        // Mark as initialized to prevent duplicate handlers
        group.dataset.initialized = 'true';

        const tabSelection = group.querySelector('.tab-selection');
        const tabs = group.querySelectorAll('.tab');

        // Initialize tab functionality
        initTabs(group, tabs, tabSelection, callback);

        // Handle initial active tab
        const initiallyActive = group.querySelector('.tab.active');
        if (initiallyActive) {
            positionSelection(initiallyActive, tabSelection);
        }
    });
}

/* ===================== */
/* HELPER FUNCTIONS */
/* ===================== */

function initTabs(group, tabs, tabSelection, callback) {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Position selection indicator
            positionSelection(tab, tabSelection);

            // Trigger callback
            callback?.(tab.textContent.trim(), tab.dataset.tabValue);
        });
    });
}

function positionSelection(tab, selection) {
    if (!tab || !selection) return;

    const updatePosition = () => {
        if (isVisible(tab)) {
            selection.style.left = `${tab.offsetLeft}px`;
            selection.style.width = `${tab.offsetWidth}px`;
        } else {
            requestAnimationFrame(updatePosition);
        }
    };
    updatePosition();
}

function isVisible(element) {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}