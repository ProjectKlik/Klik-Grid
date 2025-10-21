let globalCallbacks;
let dragState = null;

/* Initialization */
export function textInput(callback) {
    globalCallbacks = callback;
    scanTextInput();
}

export function scanTextInput() {
    document.querySelectorAll('.text-input:not([data-initialized])').forEach(input => {
        // Mark as initialized to prevent duplicate handlers
        input.dataset.initialized = 'true';

        // Initialize numeric validation if needed
        if (input.classList.contains('integer') || input.classList.contains('positive-integer') || input.classList.contains('float') || input.classList.contains('positive-float')) {
            initNumberInput(input);
        }

        // Handle input changes
        input.addEventListener('input', () => {
            globalCallbacks?.(input, input.value, input.dataset.textInputValue);
        });
    });

    initDragLabels();
}

/* Programmatical Creation */
function createTextInput(text = '', value = '', placeholder = '', parentSelector, groupClassName = '', className = '', orientation = 'vertical', maxlength = null, labelText = '', min = null, max = null) {
    // Spawn the input in the specified parent
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
            group.className = `text-input-group ${groupClassName}`.trim();
            target.appendChild(group);
        }
        else {
            if (target.classList.contains('text-input-group')) {
                group = target;
                if (groupClassName) {
                    group.classList.add(...groupClassName.split(' '));
                }
            }
            else {
                group = document.createElement('div');
                group.className = `text-input-group ${groupClassName}`.trim();
                target.appendChild(group);
            }
        }

        if (labelText) {
            const label = document.createElement('label');
            label.className = 'text-input-label';
            label.textContent = labelText;
            group.appendChild(label);
        }

        const input = document.createElement('input');
        input.type = 'text';
        input.className = `text-input ${className}`.trim();

        if (value) input.dataset.textInputValue = value;
        if (placeholder) input.placeholder = placeholder;
        if (maxlength) input.maxLength = maxlength;
        if (text) input.value = text;
        if (orientation) group.classList.add(orientation);

        if (min !== null) input.dataset.min = min;
        if (max !== null) input.dataset.max = max;

        group.appendChild(input);
        createdInputs.push(input);
    });

    // Rescan to initialize new input(s)
    scanTextInput();

    return isClass ? createdInputs : createdInputs[0];
}

// Expose globally
window.createTextInput = createTextInput;

/* ===================== */
/* HELPER FUNCTIONS */
/* ===================== */
function initNumberInput(input) {
    // Allow these control keys
    const ALLOWED_KEYS = [
        'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight',
        'Home', 'End'
    ];

    input.addEventListener('keydown', (event) => {
        // Permit control keys and keyboard shortcuts
        if (ALLOWED_KEYS.includes(event.key) || (event.ctrlKey || event.metaKey)) {
            return;
        }

        let isValid = false;
        const currentValue = input.value;
        const selectionStart = input.selectionStart;

        if (input.classList.contains('integer')) {
            if (event.key === '-') {
                isValid = selectionStart === 0 && !currentValue.includes('-');
            } else {
                isValid = !hasInvalidChars(event.key, '[^0-9-]');
            }
        } else if (input.classList.contains('positive-integer')) {
            isValid = !hasInvalidChars(event.key, '\\D');
        } else if (input.classList.contains('float')) {
            if (event.key === '-') {
                isValid = selectionStart === 0 && !currentValue.includes('-');
            } else if (event.key === '.') {
                isValid = !currentValue.includes('.');
            } else {
                isValid = !hasInvalidChars(event.key, '[^0-9.-]');
            }
        } else if (input.classList.contains('positive-float')) {
            if (event.key === '.') {
                isValid = !currentValue.includes('.');
            } else {
                isValid = !hasInvalidChars(event.key, '[^0-9.]');
            }
        }

        if (!isValid) {
            event.preventDefault();
        }
    });

    // Validate pasted content
    input.addEventListener('paste', (event) => {
        const pasteData = event.clipboardData?.getData('text') || '';
        let isValid = false;

        if (input.classList.contains('integer')) {
            const cleaned = filterText(pasteData, '[^0-9-]', '');
            const finalValue = cleaned.includes('-') ? '-' + cleaned.replace(/-/g, '') : cleaned;
            isValid = /^-?\d+$/.test(finalValue);
        } else if (input.classList.contains('positive-integer')) {
            isValid = !hasInvalidChars(pasteData, '\\D');
        } else if (input.classList.contains('float')) {
            const cleaned = filterText(pasteData, '[^0-9.-]', '');
            const finalValue = cleaned.replace(/(\..*)\./g, '$1');
            isValid = /^-?\d*\.?\d+$/.test(finalValue);
        } else if (input.classList.contains('positive-float')) {
            const cleaned = filterText(pasteData, '[^0-9.]', '');
            const finalValue = cleaned.replace(/(\..*)\./g, '$1');
            isValid = /^\d*\.?\d+$/.test(finalValue);
        }

        setTimeout(() => {
            let currentValue = input.value;
            let constrainedValue = applyMinMaxConstraints(input, currentValue);
            
            if (constrainedValue !== currentValue) {
                input.value = constrainedValue;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }, 0);
    });

    input.addEventListener('input', (event) => {
        let cleanedValue = input.value;

        if (input.classList.contains('integer')) {
            cleanedValue = filterText(input.value, '[^0-9-]', '');
            cleanedValue = cleanedValue.replace(/-/g, (match, offset) => offset === 0 ? '-' : '');
            cleanedValue = cleanedValue.replace(/^(-?)0+(\d)/, '$1$2');
        } else if (input.classList.contains('positive-integer')) {
            cleanedValue = filterText(input.value, '\\D', '');
            cleanedValue = cleanedValue.replace(/^0+(\d)/, '$1');
        } else if (input.classList.contains('float')) {
            cleanedValue = filterText(input.value, '[^0-9.-]', '');
            cleanedValue = cleanedValue.replace(/(\..*)\./g, '$1');
            cleanedValue = cleanedValue.replace(/-/g, (match, offset) => offset === 0 ? '-' : '');
            cleanedValue = cleanedValue.replace(/^\./, '0.').replace(/^-\./, '-0.');
        } else if (input.classList.contains('positive-float')) {
            cleanedValue = filterText(input.value, '[^0-9.]', '');
            cleanedValue = cleanedValue.replace(/(\..*)\./g, '$1');
            cleanedValue = cleanedValue.replace(/^\./, '0.');
        }
        
        cleanedValue = applyMinMaxConstraints(input, cleanedValue);

        // Update input value if it was cleaned
        if (cleanedValue !== input.value) {
            input.value = cleanedValue;
        }
    });
}

function filterText(text, regex, replacement = '') {
    return text.replace(new RegExp(regex, 'g'), replacement);
}

function hasInvalidChars(text, invalidRegex) {
    return new RegExp(invalidRegex).test(text);
}

/* Initialize drag functionality for labels */
function initDragLabels() {
    document.querySelectorAll('.text-input-label:not([data-drag-initialized])').forEach(label => {
        label.dataset.dragInitialized = 'true';

        // Find the associated input in the same group
        const group = label.closest('.text-input-group');
        const input = group?.querySelector('.text-input');

        if (!input) return;

        // Only enable drag if input has numeric type
        if (input.classList.contains('integer') || input.classList.contains('positive-integer') ||
            input.classList.contains('float') || input.classList.contains('positive-float')) {

            label.style.cursor = 'ew-resize';

            label.addEventListener('mousedown', startDrag);
        }
    });
}

/* Drag handling functions */
function startDrag(event) {
    event.preventDefault();

    const label = event.target;
    const group = label.closest('.text-input-group');
    const input = group?.querySelector('.text-input');

    if (!input) return;

    // Determine step size and constraints based on input type
    const step = getStepSize(input);
    const isPositiveOnly = input.classList.contains('positive-integer') ||
        input.classList.contains('positive-float');

    // Get current value
    let currentValue = parseFloat(input.value) || 0;

    dragState = {
        input: input,
        startX: event.clientX,
        startValue: currentValue,
        step: step,
        isPositiveOnly: isPositiveOnly,
        isInteger: input.classList.contains('integer') || input.classList.contains('positive-integer')
    };

    // Add event listeners
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
}

function handleDrag(event) {
    if (!dragState) return;

    const deltaX = event.clientX - dragState.startX;
    const pixelStep = 5;
    const stepChange = (deltaX / pixelStep) * dragState.step;

    let newValue = dragState.startValue + stepChange;
    
    // Apply min/max constraints from data attributes
    const min = dragState.input.dataset.min ? parseFloat(dragState.input.dataset.min) : null;
    const max = dragState.input.dataset.max ? parseFloat(dragState.input.dataset.max) : null;

    if (min !== null) {
        newValue = Math.max(min, newValue);
    }
    if (max !== null) {
        newValue = Math.min(max, newValue);
    }

    // Apply constraints
    if (dragState.isPositiveOnly) {
        newValue = Math.max(0, newValue);
    }

    if (dragState.isInteger) {
        newValue = Math.round(newValue);
    }

    // Format the value based on input type
    let formattedValue;
    if (dragState.isInteger) {
        formattedValue = newValue.toString();
    } else {
        // For floats, limit decimal places based on step size
        const decimalPlaces = dragState.step < 1 ? Math.ceil(-Math.log10(dragState.step)) : 0;
        formattedValue = newValue.toFixed(decimalPlaces);
    }

    // Update input value
    dragState.input.value = formattedValue;

    // Trigger input event to call global callback
    dragState.input.dispatchEvent(new Event('input', { bubbles: true }));
}

function stopDrag() {
    if (!dragState) return;

    // Remove event listeners
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);

    // Remove visual feedback
    const label = dragState.input.closest('.text-input-group')?.querySelector('.text-input-label');
    if (label) {
        label.style.backgroundColor = '';
    }

    dragState = null;
}

function getStepSize(input) {
    // Check for custom step attribute first
    const customStep = input.dataset.dragStep;
    if (customStep) {
        return parseFloat(customStep);
    }

    // Default steps based on input type
    if (input.classList.contains('integer') || input.classList.contains('positive-integer')) {
        return 1;
    } else if (input.classList.contains('float') || input.classList.contains('positive-float')) {
        return 0.1;
    }

    return 1; // Fallback
}

function applyMinMaxConstraints(input, value) {
    if (value === '' || value === '-') return value;

    const min = input.dataset.min ? parseFloat(input.dataset.min) : null;
    const max = input.dataset.max ? parseFloat(input.dataset.max) : null;
    
    let numValue = parseFloat(value);
    
    // If it's not a valid number after parsing, return the original value
    if (isNaN(numValue)) return value;

    // Apply constraints
    if (min !== null && numValue < min) {
        numValue = min;
    }
    if (max !== null && numValue > max) {
        numValue = max;
    }

    // Format the value back to string based on input type
    if (input.classList.contains('integer') || input.classList.contains('positive-integer')) {
        return Math.round(numValue).toString();
    } else {
        // For floats, maintain reasonable decimal precision
        return numValue.toString();
    }
}