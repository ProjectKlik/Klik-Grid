let globalCallbacks;

/* Initialization */
export function tab(callback) {
    globalCallbacks = callback;
    scanTab();
}

export function scanTab() {
    document.querySelectorAll('.tab-group').forEach(group => {
        // Mark as initialized to prevent duplicate handlers
        group.dataset.initialized = 'true';

        const tabSelection = group.querySelector('.tab-selection');
        const tabs = group.querySelectorAll('.tab:not([data-initialized])');

        // Initialize tab functionality
        initTabs(group, tabs, tabSelection);

        // Handle initial active tab
        const initiallyActive = group.querySelector('.tab.active');
        if (initiallyActive) {
            positionSelection(initiallyActive, tabSelection);
        }
    });
}

/* Programmatical Creation */
function createTab(label, value, parentSelector, groupClassName, className, activeIndex = -1) {
    // Find target elements
    const isId = parentSelector?.startsWith('#');
    const isClass = parentSelector?.startsWith('.');
    let targets = [];
    
    if (!parentSelector) {
        targets = [document.body];
    }
    else if (isId) {
        const el = document.querySelector(parentSelector);
        if (el) targets = [el];
    }
    else if (isClass) {
        targets = Array.from(document.querySelectorAll(parentSelector));
    }
    
    if (targets.length === 0) {
        console.warn(`No matching elements found for selector: ${parentSelector}`);
        return null;
    }
    
    const createdTabs = [];
    
    targets.forEach(target => {
        let group;
        
        // Use existing group or create a new one
        if (!parentSelector) {
            group = document.createElement('div');
            group.className = `tab-group ${groupClassName}`.trim();
            
            // Create tab selection element
            const tabSelection = document.createElement('div');
            tabSelection.className = 'tab-selection';
            group.appendChild(tabSelection);
            
            target.appendChild(group);
        }
        else {
            if (target.classList.contains('tab-group')) {
                group = target;
            }
            else {
                group = document.createElement('div');
                group.className = `tab-group ${groupClassName}`.trim();
                
                // Create tab selection element
                const tabSelection = document.createElement('div');
                tabSelection.className = 'tab-selection';
                group.appendChild(tabSelection);
                
                target.appendChild(group);
            }
        }
        
        // Ensure tab selection exists
        let tabSelection = group.querySelector('.tab-selection');
        if (!tabSelection) {
            tabSelection = document.createElement('div');
            tabSelection.className = 'tab-selection';
            group.insertBefore(tabSelection, group.firstChild);
        }
        
        // Create the tab element
        const tab = document.createElement('div');
        tab.className = 'tab';
        if (label) tab.textContent = label;
        if (value) tab.dataset.tabValue = value;
        if (className) tab.classList.add(className);
        
        group.appendChild(tab);
        createdTabs.push(tab);
        
        // Handle activeIndex after tab is added to group
        if (activeIndex !== -1) {
            const allTabs = group.querySelectorAll('.tab');
            if (activeIndex < allTabs.length) {
                allTabs.forEach(t => t.classList.remove('active'));
                allTabs[activeIndex].classList.add('active');
                const tabSelection = group.querySelector('.tab-selection');
                if (tabSelection) {
                    positionSelection(allTabs[activeIndex], tabSelection);
                }
            }
        } else if (group.querySelectorAll('.tab').length === 1) {
            // Make first tab active by default if one tab exists
            tab.classList.add('active');
            positionSelection(tab, tabSelection);
        }
    });
    
    // Rescan to initialize new tab(s)
    scanTab();
    
    return isClass ? createdTabs : createdTabs[0];
}

// Expose globally
window.createTab = createTab;

/* ===================== */
/* HELPER FUNCTIONS */
/* ===================== */
function initTabs(group, tabs, tabSelection) {
    tabs.forEach(tab => {
        // Mark tab as initialized
        tab.dataset.initialized = 'true';

        tab.addEventListener('click', () => {
            // Update active state
            const currentTabs = group.querySelectorAll('.tab');
            currentTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Position selection indicator
            positionSelection(tab, tabSelection);

            // Trigger callback
            globalCallbacks?.(tab.textContent.trim(), tab.dataset.tabValue);
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