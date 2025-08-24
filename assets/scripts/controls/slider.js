let globalCallbacks;

/* Initialization */
export function slider(callback) {
    globalCallbacks = callback;
    scan();
    setupThemeObserver();
}

function scan() {
    document.querySelectorAll('.slider:not([data-initialized])').forEach(slider => {
        // Mark as initialized to prevent duplicate handlers
        slider.dataset.initialized = 'true';

        const valueDisplay = slider.nextElementSibling;
        const title = slider.closest('.slider-container')?.querySelector('.slider-title');

        // Initialize display and styles
        updateSliderVisuals(slider, valueDisplay);

        // Handle input events
        slider.addEventListener('input', () => {
            updateSliderVisuals(slider, valueDisplay);
            globalCallbacks?.(title, slider.value);
        });
    });
}

/* Programmatical Creation */
function createSlider(title, min = 0, max = 100, value = 50, parentSelector, groupClassName = '', className = '', orientation = 'vertical') {
    // Find target elements
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
    
    const createdSliders = [];
    
    targets.forEach(target => {
        let group;
        
        // Use existing group or create a new one
        if (!parentSelector) {
            group = document.createElement('div');
            group.className = `slider-group ${groupClassName}`.trim();
            target.appendChild(group);
        }
        else {
            if (target.classList.contains('slider-group')) {
                group = target;
                if (groupClassName) {
                    group.classList.add(...groupClassName.split(' '));
                }
            }
            else {
                group = document.createElement('div');
                group.className = `slider-group ${groupClassName}`.trim();
                target.appendChild(group);
            }
        }
        
        // Add orientation class
        if (orientation) {
            group.classList.add(orientation);
        }
        
        // Create slider container structure
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';
        
        // Create title element
        const titleEl = document.createElement('div');
        titleEl.className = 'slider-title';
        if (title) titleEl.textContent = title;
        
        // Create slider wrapper
        const sliderWrapper = document.createElement('div');
        sliderWrapper.className = 'slider-wrapper';
        
        // Create slider input
        const slider = document.createElement('input');
        slider.className = `slider ${className}`.trim();
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.value = value;
        
        // Create value display
        const valueDisplay = document.createElement('div');
        valueDisplay.className = 'slider-value';
        valueDisplay.textContent = value;
        
        // Assemble the structure
        sliderWrapper.appendChild(slider);
        sliderWrapper.appendChild(valueDisplay);
        sliderContainer.appendChild(titleEl);
        sliderContainer.appendChild(sliderWrapper);
        group.appendChild(sliderContainer);
        
        createdSliders.push(slider);
    });
    
    // Rescan to initialize new slider(s)
    scan();
    
    return isClass ? createdSliders : createdSliders[0];
}

// Expose globally
window.createSlider = createSlider;

/* ===================== */
/* HELPER FUNCTIONS */
/* ===================== */

function updateSliderVisuals(slider, display) {
    // Calculate gradient percentage
    const percent = (slider.value - slider.min) / (slider.max - slider.min) * 100;

    // Update track background
    slider.style.background = `
    linear-gradient(
        to right,
        ${window.getVariable('--control-bg-normal')} ${percent}%,
        ${window.getVariable('--control-bg-accent-strong')} ${percent}%
    )`;

    // Update displayed value
    if (display) display.textContent = slider.value;
}

/* Theme change observer */
function setupThemeObserver() {
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'theme') {
                refreshAllSliders();
            }
        }
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['theme']
    });
}

function refreshAllSliders() {
    document.querySelectorAll('.slider').forEach(slider => {
        const valueDisplay = slider.nextElementSibling;
        updateSliderVisuals(slider, valueDisplay);
    });
}