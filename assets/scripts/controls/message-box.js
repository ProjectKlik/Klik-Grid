let messageBoxCallback = null;

export function messageBox(callback) {
    messageBoxCallback = callback;
    window.showMessageBox = showMessageBox;
}

function showMessageBox(title, description, buttons = [], callback) {
    const container = getMessageBoxContainer();
    container.innerHTML = createMessageBoxHTML(title, description, buttons);
    
    const globalCallback = messageBoxCallback;

    const combinedCallback = (text, value) => {
        if (globalCallback) {
            globalCallback(text, value);
        }
        
        if (callback) {
            callback(text, value);
        }
    };

    // Attach event listeners to the new buttons
    container.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            const text = button.textContent;
            const value = button.dataset.buttonValue;

            button.closest('.message-box-container')?.remove();
            combinedCallback(text, value);
        });
    });

    return container;
}

/* ===================== */
/* HELPER FUNCTIONS */
/* ===================== */
function getMessageBoxContainer() {
    let container = document.querySelector('.message-box-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'message-box-container';
        document.body.appendChild(container);
    }
    return container;
}

function createMessageBoxHTML(title, description, buttons) {
    return `
    <div class="message-box">
      <div class="message-box-title">
        <h3>${escapeHTML(title)}</h3>
      </div>
      <div class="message-box-description">
        <span>${escapeHTML(description)}</span>
      </div>
      <div class="message-box-action">
        ${buttons.map(btn => createButtonHTML(btn)).join('')}
      </div>
    </div>
  `;
}

function createButtonHTML({ text, className, buttonValue }) {
    const classes = className ? ` ${className}` : '';
    const dataValue = buttonValue !== undefined ? ` data-button-value="${escapeHTML(buttonValue)}"` : '';
    return `<button class="msg-btn${classes}"${dataValue}>${escapeHTML(text)}</button>`;
}

// Basic HTML escaping for security
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));
}