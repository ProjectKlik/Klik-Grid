export function separator(callback) {
    document.querySelectorAll('.separator-container:not([data-initialized])').forEach(container => {
        // Mark as initialized to prevent duplicate handlers
        container.dataset.initialized = 'true';

        // Initialize drag functionality
        initSeparatorDrag(container, callback);
    });
}

/* ===================== */
/* HELPER FUNCTIONS */
/* ===================== */

function initSeparatorDrag(container, callback) {
    let isDragging = false;
    let currentBar = null;
    let startPos = 0;
    let prevPane, nextPane, parentContainer;
    const MIN_SIZE = 100;

    // Event handlers
    const handleMouseDown = e => {
        if (!e.target.classList.contains('drag-bar')) return;

        isDragging = true;
        currentBar = e.target;
        const isHorizontal = currentBar.classList.contains('horizontal');

        startPos = isHorizontal ? e.clientY : e.clientX;
        prevPane = currentBar.previousElementSibling;
        nextPane = currentBar.nextElementSibling;
        parentContainer = currentBar.parentElement;

        document.body.style.userSelect = 'none';
    };

    const handleMouseMove = e => {
        if (!isDragging) return;
        e.preventDefault();

        const isHorizontal = currentBar.classList.contains('horizontal');
        const currentPos = isHorizontal ? e.clientY : e.clientX;
        const rawDelta = currentPos - startPos;

        const panes = getPanes(parentContainer);
        const { prevSize, nextSize } = getPaneSizes(prevPane, nextPane, isHorizontal);

        // Calculate constrained delta
        const delta = constrainDelta(rawDelta, prevSize, nextSize, MIN_SIZE);

        // Apply sizing changes
        updatePaneSizes(prevPane, nextPane, panes, prevSize + delta, isHorizontal);

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

function getPanes(container) {
    return Array.from(container.children)
        .filter(node => node.classList.contains('pane'));
}

function getPaneSizes(prevPane, nextPane, isHorizontal) {
    return {
        prevSize: isHorizontal ? prevPane.offsetHeight : prevPane.offsetWidth,
        nextSize: isHorizontal ? nextPane.offsetHeight : nextPane.offsetWidth
    };
}

function constrainDelta(rawDelta, prevSize, nextSize, minSize) {
    const maxDelta = nextSize - minSize;
    const minDelta = minSize - prevSize;
    return Math.max(minDelta, Math.min(rawDelta, maxDelta));
}

function updatePaneSizes(prevPane, nextPane, allPanes, newPrevSize, isHorizontal) {
    prevPane.style.flex = `0 0 ${newPrevSize}px`;

    allPanes.forEach(pane => {
        if (pane !== prevPane && pane !== nextPane) {
            const size = isHorizontal ? pane.offsetHeight : pane.offsetWidth;
            pane.style.flex = `0 0 ${size}px`;
        }
    });

    nextPane.style.flex = '1 1 auto';
}