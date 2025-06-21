let globalCallback = null;
let notifications = [];

export function notification(callback) {
    // Store the callback for use by the API functions
    globalCallback = callback;

    // Make it globally accessible
    window.showNotification = showNotification;
}

function showNotification(type, title, message, duration = 5000, customCallback = null) {
    // Generate unique ID
    const id = Date.now() + Math.random();
    
    // Create container elements
    let notificationContainer = document.querySelector('.notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('data-notification-id', id);

    const notificationHeader = document.createElement('div');
    notificationHeader.className = 'notification-header';

    // Title
    const notificationTitle = document.createElement('div');
    notificationTitle.className = 'notification-title';

    const notificationIcon = document.createElement('div');
    notificationIcon.className = 'notification-icon';
    notificationTitle.appendChild(notificationIcon);

    notificationTitle.appendChild(document.createTextNode(title));

    notificationHeader.appendChild(notificationTitle);

    // Close
    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '&times;';

    closeButton.addEventListener('click', () => closeNotification(id));
    notificationHeader.appendChild(closeButton);

    notification.appendChild(notificationHeader);

    // Message
    const notificationMessage = document.createElement('div');
    notificationMessage.className = 'notification-message';
    notificationMessage.textContent = message;
    notification.appendChild(notificationMessage);

    // Progress Bar
    const notificationProgress = document.createElement('div');
    notificationProgress.className = 'notification-progress';
    notificationProgress.style.width = '100%';
    notification.appendChild(notificationProgress);

    // Add to notifications array
    notifications.unshift({ id, element: notification });

    // Add to DOM
    notificationContainer.appendChild(notification);
    
    updateNotificationPositions();

    // Force reflow to ensure initial state is rendered
    notification.offsetHeight;

    // Trigger show animation with slight delay
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Start progress bar animation
    const progressBar = notification.querySelector('.notification-progress');
    let width = 100;
    const interval = setInterval(() => {
        width -= (100 / duration) * 50; // Update every 50ms
        progressBar.style.width = Math.max(0, width) + '%';

        if (width <= 0) {
            clearInterval(interval);
            closeNotification(id);
        }
    }, 50);

    // Store interval for cleanup if manually closed
    notification.setAttribute('data-interval', interval);

    // Add click handler for the notification
    notification.addEventListener('click', () => {
        customCallback?.(type, title, message);
        globalCallback?.(type, title, message);
    });

    return id;
}

function closeNotification(id) {
    const notification = document.querySelector(`[data-notification-id="${id}"]`);
    if (!notification) return;

    // Clear progress interval
    const interval = notification.getAttribute('data-interval');
    if (interval) {
        clearInterval(parseInt(interval));
    }

    // Remove from notifications array
    const index = notifications.findIndex(n => n.id === id);
    if (index > -1) {
        notifications.splice(index, 1);
    }

    // Add hide class for smooth exit
    notification.classList.add('hide');

    // Update positions for remaining notifications with a slight delay
    setTimeout(() => {
        updateNotificationPositions();
    }, 50);

    // Remove from DOM after animation
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 500);
    
    // Call the global callback when notification is closed
    globalCallback?.('close', id);
}

function updateNotificationPositions() {
    notifications.forEach((notif, index) => {
        const element = document.querySelector(`[data-notification-id="${notif.id}"]`);
        if (element) {
            const position = index * (element.offsetHeight + 8);
            element.style.setProperty('--current-y', `${position}px`);
        }
    });
}

// Make closeNotification globally accessible if needed
window.closeNotification = closeNotification;