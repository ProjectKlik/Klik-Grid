let globalCallbacks;

/* Initialization */
export function socket(callback) {
    globalCallbacks = callback;
    scanSocket();
}

export function scanSocket() {
    document.querySelectorAll('.socket:not([data-initialized])').forEach(socket => {
        // Mark as initialized to prevent duplicate handlers
        socket.dataset.initialized = 'true';

        // Initialize socket functionality
        initSocketDrag(socket, globalCallbacks);
    });
}

/* Programmatical Creation */
function createSocket(parentSelector, containerClassName, className) {
    // Determine target elements
    const isId = parentSelector?.startsWith('#');
    const isClass = parentSelector?.startsWith('.');
    let targets = [];

    // Use existing group or create a new one
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

    const createdSockets = [];

    targets.forEach(target => {
        let container;

        // Automatically determine if we need to create container or use existing
        if (target.classList.contains('socket-container')) {
            // Use existing container
            container = target;
            if (containerClassName) {
                container.classList.add(...containerClassName.split(' '));
            }
        } else {
            // Create new container
            container = document.createElement('div');
            container.className = `socket-container ${containerClassName}`.trim();
            target.appendChild(container);
        }

        // Create the socket
        const socket = document.createElement('div');
        socket.className = `socket ${className}`.trim();

        container.appendChild(socket);
        createdSockets.push(socket);
    });

    // Rescan to initialize new socket(s)
    scan();

    return isClass ? createdSockets : createdSockets[0];
}

// Expose globally
window.createSocket = createSocket;

/* ===================== */
/* HELPER FUNCTIONS */
/* ===================== */
function initSocketDrag(socket, callback) {
    const allSockets = document.querySelectorAll('.socket');
    const allItems = document.querySelectorAll('.socket-item');

    // Initialize socket items
    allItems.forEach(item => {
        initDraggableItem(item, callback);
    });

    // Initialize socket drop zones
    allSockets.forEach(sock => {
        initDropZone(sock, callback);
    });
}

function initDraggableItem(item, callback) {
    item.addEventListener('dragstart', (e) => {
        item.classList.add('dragging');
        e.dataTransfer.setData('text/plain', item.id);
        globalCallbacks?.(item.parentElement.id, item.id);
    });

    item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
    });
}

function initDropZone(socket, callback) {

    socket.addEventListener('dragover', (e) => {
        e.preventDefault();
        socket.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--surface-2');
    });

    socket.addEventListener('dragleave', () => {
        socket.style.backgroundColor = "transparent";
    });

    socket.addEventListener('drop', (e) => {
        e.preventDefault();
        handleDrop(e, socket, callback);
        socket.style.backgroundColor = "transparent";
    });
}

function handleDrop(event, socket, callback) {
    const itemId = event.dataTransfer.getData('text/plain');
    const draggedItem = document.getElementById(itemId);
    const currentItem = socket.querySelector('.socket-item');
    const originalParent = draggedItem.parentElement;

    // Swap items if target socket already contains an item
    if (currentItem) {
        originalParent.appendChild(currentItem);
    }

    // Move dragged item to new socket
    socket.appendChild(draggedItem);

    // Trigger callback
    callback?.(socket.id, itemId);
}