export function socket(callback) {
    document.querySelectorAll('.socket').forEach(socket => {
        // Skip if already initialized
        if (socket.dataset.sliderInitialized) return;
        socket.dataset.sliderInitialized = 'true';

        const sockets = document.querySelectorAll('.socket');
        const socketItems = document.querySelectorAll('.socket-item');

        socketItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                item.classList.add('dragging');
                e.dataTransfer.setData('text/plain', item.id);

                if (callback) {
                    callback(item.parentElement.id, item.id);
                }
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });

        sockets.forEach(socket => {
            socket.addEventListener('dragover', (e) => {
                e.preventDefault();
                socket.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-700');
            });

            socket.addEventListener('dragleave', () => {
                socket.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-800');
            });
        });

        socket.addEventListener('drop', (e) => {
            e.preventDefault();
            const itemId = e.dataTransfer.getData('text/plain');
            const draggedItem = document.getElementById(itemId);
            const currentItem = socket.querySelector('.socket-item');
            const originalParent = draggedItem.parentElement;

            if (currentItem) {
                originalParent.appendChild(currentItem);
            }

            socket.appendChild(draggedItem);
            socket.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-800');

            if (callback) {
                callback(socket.id, itemId);
            }
        });
    });
}