let globalCallbacks;

/* Initialization */
export function toggleButton(callback) {
    globalCallbacks = callback;
    scan();
}

function scan() {
    document.querySelectorAll('.toggle-button-group').forEach(group => {
        group.querySelectorAll('button:not([data-initialized])').forEach(button => {
            // Mark as initialized to prevent duplicate handlers
            button.dataset.initialized = 'true';

            button.addEventListener('click', () => {
                // Toggle group logic
                group.querySelectorAll('button').forEach(btn => {
                    btn.classList.toggle('active', btn === button);
                });

                // Pass both the button element and its data-toggle-value to callback
                globalCallbacks?.(button, button.dataset.toggleValue);
            });
        });
    });
}

/* Programmatical Creation */
function createToggleButton(label, value, parentSelector, className = '', variant = '', orientation = 'horizontal', iconHTML = '', iconPosition = 'before', activeIndex = -1) {
    // Spawn the toggle button in the specified parent
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

    const createdToggleButtons = [];

    targets.forEach(target => {
        let group;

        // Use existing group or create a new one
        if (!parentSelector) {
            group = document.createElement('div');
            group.className = `toggle-button-group`;
            target.appendChild(group);
        }
        else {
            if (target.classList.contains('toggle-button-group')) {
                group = target;
            }
            else {
                group = document.createElement('div');
                group.className = `toggle-button-group`;
                target.appendChild(group);
            }
        }

        const btn = document.createElement('button');

        // Add icon if provided
        if (iconHTML) {
            if (iconPosition === 'after') {
                btn.innerHTML = `${label || ''}${iconHTML}`;
            }
            else {
                btn.innerHTML = `${iconHTML}${label || ''}`;
            }
        }
        else {
            if (label) btn.textContent = label;
        }
        if (value) btn.dataset.buttonValue = value;
        if (className) group.classList.add(className);
        if (variant) btn.classList.add(variant);
        if (orientation) group.classList.add(orientation);

        group.appendChild(btn);
        createdToggleButtons.push(btn);

        const index = group.children.length - 1;
        if (activeIndex !== -1 && index === activeIndex) {
            btn.classList.add('active');
        }
    });

    // Rescan to initialize new button(s)
    scan();

    return isClass ? createdToggleButtons : createdToggleButtons[0];
}

// Expose globally
window.createToggleButton = createToggleButton;