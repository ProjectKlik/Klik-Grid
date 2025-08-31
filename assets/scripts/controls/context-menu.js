let globalCallbacks;

/* Initialization */
export function contextMenu(callback) {
    globalCallbacks = callback;
    scanContextMenu();
}

export function scanContextMenu() {
    document.querySelectorAll('.has-ctx-menu:not([data-initialized])').forEach(container => {
        // Mark as initialized to prevent duplicate handlers
        container.dataset.initialized = 'true';

        const menuList = container.querySelector('.ctx-menu-list');

        // Show context menu on right click
        container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Close any other active context menus
            document.querySelectorAll('.has-ctx-menu.active').forEach(closeContextMenu);

            // Position and show the context menu
            showContextMenu(container, menuList, e.clientX, e.clientY);
        });

        // Handle item selection for non-submenu items
        menuList.querySelectorAll('li:not(.has-submenu)').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();

                globalCallbacks?.(container, menuList.dataset.ctxMenuValue, item.textContent.trim());
                closeContextMenu(container);
            });
        });
    });

    // Close context menus when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.ctx-menu-list')) {
            document.querySelectorAll('.has-ctx-menu.active').forEach(closeContextMenu);
        }
    });
}

/* Programmatical Creation */
function createContextMenu(parentSelector, ctxMenuValue, options, containerClassName) {
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

    // Use existing elements or create new ones
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

    function buildContextMenuOptions(parentList, opts) {
        opts.forEach(option => {
            if (option === '---' || option === 'hr') {
                const hr = document.createElement('hr');
                parentList.appendChild(hr);
                return;
            }

            const li = document.createElement('li');

            if (typeof option === 'string') {
                li.textContent = option;
                li.setAttribute('data-ctx-menu-value', option);
            } else if (typeof option === 'object') {
                li.textContent = option.text || option.label;
                li.setAttribute('data-ctx-menu-value', option.value || option.text || option.label);

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
                    submenu.className = 'ctx-submenu';
                    buildContextMenuOptions(submenu, option.submenu);
                    li.appendChild(submenu);
                }
            }

            parentList.appendChild(li);
        });
    }

    const createdContextMenus = [];

    targets.forEach(target => {
        // If target doesn't have context menu class, add it
        if (!target.classList.contains('has-ctx-menu')) {
            target.classList.add('has-ctx-menu');
        }
        
        // Add additional container class if specified
        target.classList.add(containerClassName);

        // Remove existing context menu if present
        const existingMenu = target.querySelector('.ctx-menu-list');
        if (existingMenu) {
            existingMenu.remove();
        }

        const menuList = document.createElement('ul');
        menuList.className = 'ctx-menu-list';
        menuList.setAttribute('data-ctx-menu-value', ctxMenuValue);
        buildContextMenuOptions(menuList, options);

        target.appendChild(menuList);
        createdContextMenus.push(target);
    });

    // Rescan to initialize new context menus
    scan();

    return parentSelector?.startsWith('.') ? createdContextMenus : createdContextMenus[0];
}

// Expose globally
window.createContextMenu = createContextMenu;

/* ===================== */
/* HELPER FUNCTIONS */
/* ===================== */
function showContextMenu(container, menuList, x, y) {
    // Close any other active context menus first
    document.querySelectorAll('.has-ctx-menu.active').forEach(closeContextMenu);

    // Show the context menu
    container.classList.add('active');

    // Calculate position relative to the container
    const containerRect = container.getBoundingClientRect();
    const relativeX = x - containerRect.left;
    const relativeY = y - containerRect.top;

    // Position the context menu at cursor position relative to container
    menuList.style.left = `${relativeX}px`;
    menuList.style.top = `${relativeY}px`;

    // Adjust position if menu would go off-screen
    const rect = menuList.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust horizontal position
    if (rect.right > viewportWidth) {
        menuList.style.left = `${x - rect.width}px`;
    }

    // Adjust vertical position
    if (rect.bottom > viewportHeight) {
        menuList.style.top = `${y - rect.height}px`;
    }

    // Ensure menu doesn't go off the left or top edges
    if (parseInt(menuList.style.left) < 0) {
        menuList.style.left = '0px';
    }
    if (parseInt(menuList.style.top) < 0) {
        menuList.style.top = '0px';
    }
}

function closeContextMenu(container) {
    container.classList.remove('active');

    // Reset positioning
    const menuList = container.querySelector('.ctx-menu-list');
    if (menuList) {
        menuList.style.left = '';
        menuList.style.top = '';
    }
}