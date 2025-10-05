let globalCallbacks;

/* Initialization */
export function separator(callback) {
    globalCallbacks = callback;
    scanSeparator();
}

export function scanSeparator() {
    document.querySelectorAll('.separator-container:not([data-initialized])').forEach(container => {
        // Mark as initialized to prevent duplicate handlers
        container.dataset.initialized = 'true';

        // Initialize drag functionality
        initSeparatorDrag(container, globalCallbacks);
    });
}

/* Programmatical Creation */
function createSeparator(parentSelector, structure, separatorValue, containerClassName) {
    const isId = parentSelector?.startsWith('#');
    const isClass = parentSelector?.startsWith('.');
    let targets = [];

    // Use existing group or create a new one
    if (!parentSelector) {
        targets = [document.body];
    } else if (isId) {
        const el = document.querySelector(parentSelector);
        if (el) targets = [el];
    } else if (isClass) {
        targets = Array.from(document.querySelectorAll(parentSelector));
    }

    if (targets.length === 0) {
        console.warn(`No matching elements found for selector: ${parentSelector}`);
        return null;
    }

    function buildStructure(structureItem, isRoot = false) {
        if (!structureItem || !structureItem.type) {
            console.warn('Invalid structure item:', structureItem);
            return null;
        }

        const element = document.createElement('div');

        switch (structureItem.type) {
            case 'horizontal':
                element.className = isRoot ? 'horizontal-container' : 'separator horizontal-container';
                element.dataset.separatorValue = separatorValue;
                if (containerClassName) element.classList.add(containerClassName);
                break;

            case 'vertical':
                element.className = isRoot ? 'vertical-container' : 'separator vertical-container';
                element.dataset.separatorValue = separatorValue;
                if (containerClassName) element.classList.add(containerClassName);
                break;

            case 'panel':
                element.className = `separator panel ${structureItem.class || ''}`.trim();
                break;

            case 'drag-bar':
                element.className = `separator drag-bar ${structureItem.orientation === 'vertical' ? 'vertical' : 'horizontal'}`;
                element.dataset.separatorValue = structureItem.value || '';
                break;

            default:
                console.warn('Unknown structure type:', structureItem.type);
                return null;
        }

        // Recursively build children
        if (structureItem.children && Array.isArray(structureItem.children)) {
            structureItem.children.forEach(child => {
                const childElement = buildStructure(child, false);
                if (childElement) element.appendChild(childElement);
            });
        }

        return element;
    }

    const createdSeparators = [];

    targets.forEach(target => {
        // Create a generic root container
        const rootContainer = document.createElement('div');
        rootContainer.classList.add('separator-container');
        rootContainer.dataset.separatorValue = separatorValue;
        if (containerClassName) rootContainer.classList.add(containerClassName);

        // Build the actual structure as a child
        const structureContainer = buildStructure(structure, false);
        if (structureContainer) {
            rootContainer.appendChild(structureContainer);
            target.appendChild(rootContainer);
            createdSeparators.push(rootContainer);
        }
    });

    // Rescan to initialize new Separators
    scanSeparator();

    return parentSelector?.startsWith('.') ? createdSeparators : createdSeparators[0];
}

// Expose globally
window.createSeparator = createSeparator;

/* ===================== */
/* HELPER FUNCTIONS */
/* ===================== */
function initSeparatorDrag(container, callback) {
    let isDragging = false;
    let currentBar = null;
    let startPos = 0;
    let prevPanel, nextPanel, parentContainer;
    const MIN_SIZE = 100;

    // Event handlers
    const handleMouseDown = e => {
        if (!e.target.classList.contains('drag-bar')) return;

        isDragging = true;
        currentBar = e.target;
        const isHorizontal = currentBar.classList.contains('horizontal');

        startPos = isHorizontal ? e.clientY : e.clientX;
        prevPanel = currentBar.previousElementSibling;
        nextPanel = currentBar.nextElementSibling;
        parentContainer = currentBar.parentElement;

        document.body.style.userSelect = 'none';
    };

    const handleMouseMove = e => {
        if (!isDragging) return;
        e.preventDefault();

        const isHorizontal = currentBar.classList.contains('horizontal');
        const currentPos = isHorizontal ? e.clientY : e.clientX;
        const rawDelta = currentPos - startPos;

        const panels = getPanels(parentContainer);
        const { prevSize, nextSize } = getPanelSizes(prevPanel, nextPanel, isHorizontal);

        // Calculate constrained delta
        const delta = constrainDelta(rawDelta, prevSize, nextSize, MIN_SIZE);

        // Apply sizing changes
        updatePanelSizes(prevPanel, nextPanel, panels, prevSize + delta, isHorizontal);

        // Update drag origin for smooth continuous dragging
        startPos += delta;

        // Trigger callback if provided
        callback?.(container.dataset.separatorValue, currentBar.dataset.separatorValue);
    };

    const handleMouseUp = () => {
        isDragging = false;
        currentBar = null;
        document.body.style.userSelect = '';
    };

    // Add event listeners
    container.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Store cleanup reference
    container.cleanupResizable = () => {
        container.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
}

function getPanels(container) {
    return Array.from(container.children)
        .filter(node => node.classList.contains('panel'));
}

function getPanelSizes(prevPanel, nextPanel, isHorizontal) {
    return {
        prevSize: isHorizontal ? prevPanel.offsetHeight : prevPanel.offsetWidth,
        nextSize: isHorizontal ? nextPanel.offsetHeight : nextPanel.offsetWidth
    };
}

function constrainDelta(rawDelta, prevSize, nextSize, minSize) {
    const maxDelta = nextSize - minSize;
    const minDelta = minSize - prevSize;
    return Math.max(minDelta, Math.min(rawDelta, maxDelta));
}

function updatePanelSizes(prevPanel, nextPanel, allPanels, newPrevSize, isHorizontal) {
    prevPanel.style.flex = `0 0 ${newPrevSize}px`;

    allPanels.forEach(panel => {
        if (panel !== prevPanel && panel !== nextPanel) {
            const size = isHorizontal ? panel.offsetHeight : panel.offsetWidth;
            panel.style.flex = `0 0 ${size}px`;
        }
    });

    nextPanel.style.flex = '1 1 auto';
}