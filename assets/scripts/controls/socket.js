export function socket(callback) {
    document.querySelectorAll('.socket:not([data-initialized])').forEach(socket => {
        // Mark as initialized to prevent duplicate handlers
        socket.dataset.initialized = 'true';

        // Initialize socket functionality
        initSocketDrag(socket, callback);
    });
}

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
        callback?.(item.parentElement.id, item.id);
    });

    item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
    });
}

function initDropZone(socket, callback) {
    const neutral800 = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-neutral-800');
    const neutral700 = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-neutral-700');

    socket.addEventListener('dragover', (e) => {
        e.preventDefault();
        socket.style.backgroundColor = neutral700;
    });

    socket.addEventListener('dragleave', () => {
        socket.style.backgroundColor = neutral800;
    });

    socket.addEventListener('drop', (e) => {
        e.preventDefault();
        handleDrop(e, socket, callback);
        socket.style.backgroundColor = neutral800;
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