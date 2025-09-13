let globalCallbacks;

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
        if (input.classList.contains('number')) {
            initNumberInput(input);
        }

        // Handle input changes
        input.addEventListener('input', () => {
            globalCallbacks?.(input, input.value, input.dataset.textInputValue);
        });
    });
}

/* Programmatical Creation */
function createTextInput(text = '', value = '', placeholder = '', parentSelector, groupClassName = '', className = '', orientation = 'vertical', maxlength = null) {
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
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = `text-input ${className}`.trim();
        
		if (value) input.dataset.textInputValue = value;
        if (placeholder) input.placeholder = placeholder;
        if (maxlength) input.maxLength = maxlength;
        if (text) input.value = text;
        if (orientation) group.classList.add(orientation);
        
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

        // Block non-digit input
        if (!/^[0-9]$/.test(event.key)) {
            event.preventDefault();
        }
    });

    // Validate pasted content
    input.addEventListener('paste', (event) => {
        const pasteData = event.clipboardData?.getData('text') || '';
        if (/\D/.test(pasteData)) {
            event.preventDefault();
        }
    });
}