let globalCallback = null;

export function messageBox(callback) {
    // Store the callback for use by the API functions
    globalCallback = callback;

    // Make it globally accessible
    window.showMessageBox = showMessageBox;
}

function showMessageBox(title, description, buttons = [], customCallback = null) {
    // Create container elements
    let container = document.querySelector('.message-box-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'message-box-container';
        document.body.appendChild(container)
    }

    const box = document.createElement('div');
    box.className = 'message-box';

    // Title
    const titleDiv = document.createElement('div');
    titleDiv.className = 'message-box-title';
    const h3 = document.createElement('h3');
    h3.textContent = title;
    titleDiv.appendChild(h3);

    // Description
    const descDiv = document.createElement('div');
    descDiv.className = 'message-box-description';
    const span = document.createElement('span');
    span.textContent = description;
    descDiv.appendChild(span);

    // Action
    const actionDiv = document.createElement('div');
    actionDiv.className = 'message-box-action';

    // Create buttons
    buttons.forEach(({ text, className, buttonValue, onClick }) => {
        const button = document.createElement('button');
        button.textContent = text;
        if (className) {
            button.className = className;
        }
        if (buttonValue !== undefined) {
            button.dataset.buttonValue = buttonValue;
        }

        button.addEventListener('click', () => {
            // Call custom onClick if provided
            onClick?.();

            // Execute callbacks
            customCallback?.(text, buttonValue);
            globalCallback?.(text, buttonValue);

            container.remove();
        });

        actionDiv.appendChild(button);
    });

    // Append all parts
    box.appendChild(titleDiv);
    box.appendChild(descDiv);
    box.appendChild(actionDiv);
    container.appendChild(box);

    return container;
}