let globalCallbacks;

/* Initialization */
export function dropdown(callback) {
    globalCallbacks = callback;
    scanDropdown();
}

export function scanDropdown() {
    document.querySelectorAll('.dropdown-container:not([data-initialized])').forEach(container => {
        // Mark as initialized to prevent duplicate handlers
        container.dataset.initialized = 'true';

        const btn = container.querySelector('.dropdown-button');
        const list = container.querySelector('.dropdown-list');

        // Toggle dropdown visibility
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(container);
        });

        // Handle item selection
        list.querySelectorAll('li:not(.has-submenu)').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();

                // Update button text to show selected option
                const selectedText = item.textContent.trim();
                const svg = btn.querySelector('.fill-icon');
                btn.textContent = selectedText;
                if (svg) btn.appendChild(svg);

                globalCallbacks?.(btn, btn.dataset.dropdownbuttonValue, item.textContent.trim());
                closeDropdown(container);
            });
        });
    });

    // Close dropdowns when clicking outside
    window.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-container.active').forEach(closeDropdown);
    });
}

/* Programmatical Creation */
function createDropdown(buttonText, buttonValue, parentSelector, options, containerClassName, buttonClassName) {
    const SVG_NS = 'http://www.w3.org/2000/svg';

    /* tiny helper for namespaced elements */
    function svg(tag, attrs = {}) {
        const el = document.createElementNS(SVG_NS, tag);
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        return el;
    }

    const isId = parentSelector?.startsWith('#');
    const isClass = parentSelector?.startsWith('.');
    let targets = [];

    // Use existing group or create a new one
    if (!parentSelector) {
        targets = [document.body];
    } else if (isId) {
        const el = document.querySelector(parentSelector);
        if (el) targets = [el];
    } else if (isClass) {
        targets = Array.from(document.querySelectorAll(parentSelector));
    }

    if (targets.length === 0) {
        console.warn(`No matching elements found for selector: ${parentSelector}`);
        return null;
    }

    function buildOptions(parentList, opts) {
        opts.forEach(option => {
            if (option === '---' || option === 'hr') {
                const hr = document.createElement('hr');
                parentList.appendChild(hr);
                return;
            }

            const li = document.createElement('li');

            if (typeof option === 'string') {
                li.textContent = option;
                li.setAttribute('data-dropdown-value', option);
            } else if (typeof option === 'object') {
                li.textContent = option.text || option.label;
                li.setAttribute('data-dropdown-value', option.value || option.text || option.label);

                if (option.submenu && Array.isArray(option.submenu)) {
                    li.classList.add('has-submenu');

                    const arrow = svg('svg', { class: 'fill-icon', viewBox: '0 0 24 24' });
                    arrow.appendChild(
                        svg('path', {
                            d: 'M18 9c.852 0 1.297 .986 .783 1.623l-.076 .084l-6 6a1 1 0 0 1 -1.32 .083l-.094 -.083l-6 -6l-.083 -.094l-.054 -.077l-.054 -.096l-.017 -.036l-.027 -.067l-.032 -.108l-.01 -.053l-.01 -.06l-.004 -.057v-.118l.005 -.058l.009 -.06l.01 -.052l.032 -.108l.027 -.067l.07 -.132l.065 -.09l.073 -.081l.094 -.083l.077 -.054l.096 -.054l.036 -.017l.067 -.027l.108 -.032l.053 -.01l.06 -.01l.057 -.004l12.059 -.002z'
                        })
                    );
                    li.appendChild(arrow);

                    const submenu = document.createElement('ul');
                    submenu.className = 'dropdown-submenu';
                    buildOptions(submenu, option.submenu);
                    li.appendChild(submenu);
                }
            }

            parentList.appendChild(li);
        });
    }

    const createdDropdowns = [];

    targets.forEach(target => {
        const container = document.createElement('div');
        container.className = `dropdown-container ${containerClassName}`.trim();

        const button = document.createElement('button');
        button.className = `dropdown-button ${buttonClassName}`.trim();
        button.textContent = buttonText;
        button.setAttribute('data-dropdownbutton-value', buttonValue);

        const arrow = svg('svg', { class: 'fill-icon', viewBox: '0 0 24 24' });
        arrow.appendChild(
            svg('path', {
                d: 'M18 9c.852 0 1.297 .986 .783 1.623l-.076 .084l-6 6a1 1 0 0 1 -1.32 .083l-.094 -.083l-6 -6l-.083 -.094l-.054 -.077l-.054 -.096l-.017 -.036l-.027 -.067l-.032 -.108l-.01 -.053l-.01 -.06l-.004 -.057v-.118l.005 -.058l.009 -.06l.01 -.052l.032 -.108l.027 -.067l.07 -.132l.065 -.09l.073 -.081l.094 -.083l.077 -.054l.096 -.054l.036 -.017l.067 -.027l.108 -.032l.053 -.01l.06 -.01l.057 -.004l12.059 -.002z'
            })
        );
        button.appendChild(arrow);

        const list = document.createElement('ul');
        list.className = 'dropdown-list';
        buildOptions(list, options);

        container.appendChild(button);
        container.appendChild(list);
        target.appendChild(container);
        createdDropdowns.push(container);
    });

    // Rescan to initialize new Dropdown
    scanDropdown();

    return parentSelector?.startsWith('.') ? createdDropdowns : createdDropdowns[0];
}

// Expose globally
window.createDropdown = createDropdown;

/* ===================== */
/* HELPER FUNCTIONS */
/* ===================== */
function toggleDropdown(container) {
    document.querySelectorAll('.dropdown-container').forEach(d => {
        if (d === container) {
            d.classList.toggle('active');
            d.querySelector('.dropdown-button').classList.toggle('active');
        } else {
            closeDropdown(d);
        }
    });
}

function closeDropdown(container) {
    container.classList.remove('active');
    container.querySelector('.dropdown-button').classList.remove('active');
}