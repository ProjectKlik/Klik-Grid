let globalCallbacks;

/* Initialization */
export function collapsibleMenu(callback) {
    globalCallbacks = callback;
    scan();
}

function scan() {
    document.querySelectorAll('.collapsible-menu-container:not([data-initialized])').forEach(container => {
        // Mark as initialized to prevent duplicate handlers
        container.dataset.initialized = 'true';

        const header = container.querySelector('.menu-header');
        const content = container.querySelector('.menu-content');

        container.addEventListener("click", function () {
            let isExpanded;

            if (content.style.maxHeight && content.style.maxHeight !== '0px') {
                content.style.maxHeight = '0px';
                header.classList.remove('active');
                content.classList.remove('active');
                isExpanded = false;
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                header.classList.add('active');
                content.classList.add('active');
                isExpanded = true;
            }
            
            globalCallbacks?.(container, isExpanded);
        });
    });
}

/* Programmatical Creation */
function createCollapsibleMenu(parentSelector, headerText, containerClassName, contentClassName, isOpened) {
    const SVG_NS = 'http://www.w3.org/2000/svg';

    /* tiny helper for namespaced elements */
    function svg(tag, attrs = {}) {
        const el = document.createElementNS(SVG_NS, tag);
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        return el;
    }

    // Determine target elements
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

    const createdMenus = [];

    targets.forEach(target => {
        // Create container
        const container = document.createElement('div');
        container.className = `collapsible-menu-container ${containerClassName}`.trim();

        // Create header
        const header = document.createElement('div');
        header.className = 'menu-header';
        
        // Create header text span
        const headerSpan = document.createElement('span');
        headerSpan.textContent = headerText;

        // Create arrow icon
        const arrow = svg('svg', { class: 'fill-icon', viewBox: '0 0 24 24' });
        arrow.appendChild(
            svg('path', {
                d: 'M18 9c.852 0 1.297 .986 .783 1.623l-.076 .084l-6 6a1 1 0 0 1 -1.32 .083l-.094 -.083l-6 -6l-.083 -.094l-.054 -.077l-.054 -.096l-.017 -.036l-.027 -.067l-.032 -.108l-.01 -.053l-.01 -.06l-.004 -.057v-.118l.005 -.058l.009 -.06l.01 -.052l.032 -.108l.027 -.067l.07 -.132l.065 -.09l.073 -.081l.094 -.083l.077 -.054l.096 -.054l.036 -.017l.067 -.027l.108 -.032l.053 -.01l.06 -.01l.057 -.004l12.059 -.002z'
            })
        );

        header.appendChild(headerSpan);
        header.appendChild(arrow);

        // Create content
        const content = document.createElement('div');
        content.className = `menu-content ${contentClassName}`;

        // Set initial state
        if (isOpened) {
            content.style.maxHeight = content.scrollHeight + 'px';
            header.classList.add('active');
            content.classList.add('active');
        }

        // Assemble the menu
        container.appendChild(header);
        container.appendChild(content);
        target.appendChild(container);

        createdMenus.push(container);
    });

    // Rescan to initialize new menu(s)
    scan();

    return isClass ? createdMenus : createdMenus[0];
}

// Expose globally
window.createCollapsibleMenu = createCollapsibleMenu;