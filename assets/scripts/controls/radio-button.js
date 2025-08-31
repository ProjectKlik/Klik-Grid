let globalCallbacks;

/* Initialization */
export function radioButton(callback) {
    globalCallbacks = callback;
    scanRadioButton();
}

export function scanRadioButton() {
    document.querySelectorAll('.radio-button-group').forEach(group => {
        group.querySelectorAll('input[type="radio"]:not([data-initialized])').forEach(radio => {
            // Mark as initialized to prevent duplicate handlers
            radio.dataset.initialized = 'true';

            radio.addEventListener('change', () => {
                if (radio.checked) {
                    // Pass both the radio element and its data-radio-value to callback
                    globalCallbacks?.(radio, radio.dataset.radioValue);
                }
            });
        });
    });
}

/* Programmatical Creation */
function createRadioButton(label, value, parentSelector, groupClassName, className, orientation, radioName, activeIndex = -1) {
    // Spawn the button in the specified parent
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

    const createdInputs = [];

    targets.forEach(target => {
        let group;

        // Use existing group or create a new one
        if (!parentSelector) {
            group = document.createElement('div');
            group.className = `radio-button-group ${groupClassName}`.trim();
            target.appendChild(group);
        }
        else {
            if (target.classList.contains('radio-button-group')) {
                group = target;
                if (groupClassName) {
                    group.classList.add(...groupClassName.split(' '));
                }
            }
            else {
                group = document.createElement('div');
                group.className = `radio-button-group ${groupClassName}`.trim();
                target.appendChild(group);
            }
        }

        const labelEl = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        if (value) input.dataset.radioValue = value;
        if (!radioName) radioName = `radio-group-${Math.random().toString(36).substr(2, 9)}`;
        input.name = radioName;

        const span = document.createElement('span');

        if (label) span.textContent = label;
        if (className) input.classList.add(className);
        if (orientation) group.classList.add(orientation);

        labelEl.appendChild(input);
        labelEl.appendChild(span);
        group.appendChild(labelEl);
        createdInputs.push(input);

        if (activeIndex !== -1) {
            const index = group.querySelectorAll('input[type="radio"]');
            if (activeIndex < index.length) {
                index[activeIndex].checked = true;
            }
        }
    });

    // Rescan to initialize new button(s)
    scan();

    return isClass ? createdInputs : createdInputs[0];
}

// Expose globally
window.createRadioButton = createRadioButton;