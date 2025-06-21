export function tab(callback) {
    document.querySelectorAll('.tab-group').forEach(group => {
        // Skip if already initialized
        if (group.dataset.groupInitialized) return;
        group.dataset.groupInitialized = 'true';

        const tabSelection = group.querySelector('.tab-selection');
        const tabs = group.querySelectorAll('.tab');

        function moveSelection(activeTab) {
            if (!tabSelection || !activeTab) return;
            const left = activeTab.offsetLeft;
            const width = activeTab.offsetWidth;

            tabSelection.style.left = `${left}px`;
            tabSelection.style.width = `${width}px`;
        }

        function isVisible(element) {
            return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
        }

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs in the group
                tabs.forEach(t => t.classList.remove('active'));

                // Add active class to the clicked tab
                tab.classList.add('active');

                // Move the selection
                moveSelection(tab);

                // Execute the callback if provided
                if (callback) {
                    callback(tab.textContent.trim(), tab.dataset.tabValue);
                }
            });
        });

        // Initial move to the pre-selected tab
        const initiallyActive = group.querySelector('.tab.active');
        if (initiallyActive) {
            const waitForVisible = () => {
                if (isVisible(initiallyActive)) {
                    moveSelection(initiallyActive);
                } else {
                    requestAnimationFrame(waitForVisible); // keep checking until visible
                }
            };
            waitForVisible();
        }
    });
}