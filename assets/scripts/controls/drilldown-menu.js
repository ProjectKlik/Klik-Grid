let drilldownMenuCallback = null;
let navigationStack = [];
let menuTitle = '';
let currentContainer = null;

export function drilldownMenu(callback) {
    drilldownMenuCallback = callback;
    window.showDrilldownMenu = showDrilldownMenu;
}

function showDrilldownMenu(title, items, callback) {
    menuTitle = title;
    navigationStack = [];
    
    const globalCallback = drilldownMenuCallback;
    
    const currentCallback = (button, value) => {
        if (globalCallback) {
            globalCallback(button, value);
        }

        if (callback) {
            callback(button, value);
        }
    };
    
    currentContainer = getDrilldownContainer(currentCallback);
    renderDrilldown(items, [], currentCallback);
    
    return currentContainer;
}

function renderDrilldown(items, breadcrumb, callback) {
    if (!currentContainer) return;
    
    const breadcrumbText = breadcrumb.length > 0 ? breadcrumb.join(' > ') : '';
    const backButtonClass = navigationStack.length > 0 ? ' shown' : '';
    
    // Only update the dynamic parts instead of recreating everything
    const breadcrumbEl = currentContainer.querySelector('.drilldown-breadcrumb');
    const backButton = currentContainer.querySelector('.drilldown-back-button');
    const itemsContainer = currentContainer.querySelector('.drilldown-items-container');
    
    // Update breadcrumb
    if (breadcrumbText) {
        if (!breadcrumbEl) {
            // Create breadcrumb if it doesn't exist
            const headerDiv = currentContainer.querySelector('.drilldown-header div');
            const newBreadcrumb = document.createElement('blockquote');
            newBreadcrumb.className = 'drilldown-breadcrumb property';
            newBreadcrumb.textContent = breadcrumbText;
            headerDiv.appendChild(newBreadcrumb);
        } else {
            breadcrumbEl.textContent = breadcrumbText;
        }
    } else if (breadcrumbEl) {
        breadcrumbEl.remove();
    }
    
    // Update back button
    if (backButton) {
        backButton.className = `drilldown-back-button${backButtonClass}`;
        
        // Update back button event listener
        backButton.replaceWith(backButton.cloneNode(true));
        const newBackButton = currentContainer.querySelector('.drilldown-back-button');
        
        if (navigationStack.length > 0) {
            newBackButton.addEventListener('click', () => {
                const previous = navigationStack.pop();
                renderDrilldown(previous.items, previous.breadcrumb, callback);
            });
        }
    }
    
    // Update items
    if (itemsContainer) {
        itemsContainer.innerHTML = items.map(item => {
            return `
            <div class="drilldown-item">
                ${item.icon || ''}
                <span>${escapeHTML(item.text)}</span>
            </div>
            `;
        }).join('');
        
        // Attach event listeners to new items
        itemsContainer.querySelectorAll('.drilldown-item').forEach((itemEl, index) => {
            const item = items[index];
            itemEl.addEventListener('click', () => {
                if (item.items && item.items.length > 0) {
                    navigationStack.push({ items, breadcrumb });
                    renderDrilldown(item.items, [...breadcrumb, item.text], callback);
                } else {
					callback?.(item, item.buttonValue);
                    
                    currentContainer?.remove();
                    currentContainer = null;
                    document.getElementById('dialog-overlay').style.display = 'none';
                }
            });
        });
    }
}

function getDrilldownContainer(callback) {
    document.querySelector('.drilldown-container')?.remove();
    
    const container = document.createElement('div');
    container.className = 'drilldown-container';
    
    // Create the static structure once
    container.innerHTML = `
    <div class="drilldown">
        <div class="drilldown-header">
            <div>
                <h3 class="drilldown-title no-top-margin">${escapeHTML(menuTitle)}</h3>
            </div>
            <button class="flat drilldown-close" data-button-value="close-drilldown">&times;</button>
        </div>
        <div class="drilldown-body">
            <button class="drilldown-back-button">
                <svg class="outline-icon" viewBox="0 0 24 24">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M9 14l-4 -4l4 -4" />
                    <path d="M5 10h11a4 4 0 1 1 0 8h-1" />
                </svg>
                Go Back
            </button>
            <div class="drilldown-items-container"></div>
        </div>
    </div>
    `;
    
    document.body.appendChild(container);
    
    // Attach close event listener once
    container.querySelector('.drilldown-close')?.addEventListener('click', () => {
        callback?.('close-drilldown', 'close-drilldown');
        container.remove();
        currentContainer = null;
    });
    
    return container;
}

function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));
}