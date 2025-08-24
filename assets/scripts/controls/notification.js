let notificationCallback = null;
let activeNotifications = [];

export function notification(callback) {
    notificationCallback = callback;
    window.showNotification = createNotification;
}

function createNotification(type, title, message, duration = 5000, customCallback = null) {
    const id = Date.now() + Math.random();
    const container = getNotificationContainer();
    const notification = buildNotificationHTML(id, type, title, message);

    container.insertAdjacentHTML('beforeend', notification);
    const notificationEl = container.lastElementChild;

    // Force reflow to ensure initial state is rendered
    notificationEl.offsetHeight;

    // Trigger show animation with slight delay
    setTimeout(() => {
        notificationEl.classList.add('show');
    }, 10);

    // Setup interactions
    setupNotificationBehavior(notificationEl, id, type, title, message, duration, customCallback);

    // Track notification
    activeNotifications.unshift({ id, element: notificationEl });
    updatePositions();

    return id;
}

/* ===================== */
/* HELPER FUNCTIONS */
/* ===================== */

function getNotificationContainer() {
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    return container;
}

function buildNotificationHTML(id, type, title, message) {
    return `
    <div class="notification ${type}" data-notification-id="${id}">
      <div class="notification-header">
        <div class="notification-title">
          <div class="notification-icon"></div>
          ${escapeHTML(title)}
        </div>
        <button class="flat notification-close">&times;</button>
      </div>
      <div class="notification-message">${escapeHTML(message)}</div>
      <div class="notification-progress" style="width:100%"></div>
    </div>
  `;
}

function setupNotificationBehavior(el, id, type, title, message, duration, customCallback) {
    // Close button
    el.querySelector('.notification-close').addEventListener('click', () => closeNotification(id));

    // Click handler
    el.addEventListener('click', () => {
        customCallback?.(type, title, message);
        notificationCallback?.(type, title, message);
    });

    // Auto-close timer
    if (duration > 0) {
        const progressBar = el.querySelector('.notification-progress');
        let width = 100;
        const interval = setInterval(() => {
            width -= (100 / duration) * 50;
            progressBar.style.width = `${Math.max(0, width)}%`;
            if (width <= 0) closeNotification(id);
        }, 50);

        el.dataset.interval = interval;
    }
}

function closeNotification(id) {
    const index = activeNotifications.findIndex(n => n.id === id);
    if (index === -1) return;

    const [notification] = activeNotifications.splice(index, 1);
    const element = notification.element;

    // Cleanup interval
    if (element.dataset.interval) {
        clearInterval(parseInt(element.dataset.interval));
    }

    // Animate out
    element.classList.add('hide');

    // Update positions with slight delay
    setTimeout(updatePositions, 50);

    // Remove from DOM after animation completes
    setTimeout(() => {
        element.remove();
        notificationCallback?.('close', id);
    }, 500);
}

function updatePositions() {
    activeNotifications.forEach((notif, index) => {
        notif.element.style.setProperty('--current-y', `${index * (notif.element.offsetHeight + 8)}px`);
    });
}

// Basic HTML escaping
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));
}

// Make globally accessible
window.closeNotification = closeNotification;