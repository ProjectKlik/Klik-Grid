let globalCallbacks;

/* Initialization */
export function checkboxButton(callback) {
    globalCallbacks = callback
    scanCheckboxButton();
}

export function scanCheckboxButton() {
    document.querySelectorAll('.checkbox-button-group').forEach(group => {
        group.querySelectorAll('input[type="checkbox"]:not([data-initialized])').forEach(checkbox => {
            // Mark as initialized to prevent duplicate handlers
            checkbox.dataset.initialized = 'true';

            // Get the associated label text
            const labelText = checkbox.closest('label')?.querySelector('span')?.textContent || '';

            checkbox.addEventListener('change', () => {
                // Pass the checkbox element, its label, its data-checkbox-value and its state to callback
                globalCallbacks?.(
                    checkbox,
                    labelText,
                    checkbox.dataset.checkboxValue,
                    checkbox.checked
                );
            });
        });
    });
}

/* Programmatical Creation */
function createCheckboxButton(label, value, parentSelector, groupClassName, className, orientation, activeIndex = -1) {
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
            group.className = `checkbox-button-group ${groupClassName}`.trim();
            target.appendChild(group);
        }
        else {
            if (target.classList.contains('checkbox-button-group')) {
                group = target;
                if (groupClassName) {
                    group.classList.add(...groupClassName.split(' '));
                }
            }
            else {
                group = document.createElement('div');
                group.className = `checkbox-button-group ${groupClassName}`.trim();
                target.appendChild(group);
            }
        }

        const labelEl = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        if (value) input.dataset.checkboxValue = value;

        const span = document.createElement('span');

        if (label) span.textContent = label;
        if (className) input.classList.add(className);
        if (orientation) group.classList.add(orientation);

        labelEl.appendChild(input);
        labelEl.appendChild(span);
        group.appendChild(labelEl);
        createdInputs.push(input);

        if (activeIndex !== -1) {
            const index = group.querySelectorAll('input[type="checkbox"]');
            if (activeIndex < index.length) {
                index[activeIndex].checked = true;
            }
        }
    });

    // Rescan to initialize new button(s)
    scanCheckboxButton();

    return isClass ? createdInputs : createdInputs[0];
}

// Expose globally
window.createCheckboxButton = createCheckboxButton;