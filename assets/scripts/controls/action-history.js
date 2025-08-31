let globalCallbacks;

/* Initialization */
export function actionHistory(callback) {
    globalCallbacks = callback;
    scanActionHistory();
}

export function scanActionHistory() {
    const containers = document.querySelectorAll('.action-history-container:not([data-initialized])');
    const apis = [];
    
    containers.forEach(container => {
        // Mark as initialized to prevent duplicate handlers
        container.dataset.initialized = 'true';
        
        const content = container.querySelector('.action-history-content');
        if (!content) {
            console.warn('No .action-history-content found inside container');
            return;
        }
        
        let currentIndex = -1;
        const actions = [];
        
        function formatTime(date) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        
        function createActionElement({ icon, text, time }, index) {
            const actionEl = document.createElement('div');
            actionEl.className = 'action-history-item';
            actionEl.dataset.index = index;
            actionEl.innerHTML = `
            <span class="icon">${icon}</span>
            <div class="info">
                <span class="text">${text}</span>
                <span class="time">${time}</span>
            </div>
        `;
            return actionEl;
        }
        
        function updateOpacity() {
            actions.forEach((_, idx) => {
                const el = content.querySelector(`.action-history-item[data-index="${idx}"]`);
                if (!el) return;
                if (idx > currentIndex) {
                    el.classList.add('undone');
                } else {
                    el.classList.remove('undone');
                }
            });
        }
        
        function addAction(icon, text) {
            if (currentIndex < actions.length - 1) {
                for (let i = actions.length - 1; i > currentIndex; i--) {
                    const el = content.querySelector(`.action-history-item[data-index="${i}"]`);
                    if (el) el.remove();
                    actions.pop();
                }
            }
            const time = formatTime(new Date());
            const action = { icon, text, time };
            actions.push(action);
            currentIndex++;
            const actionEl = createActionElement(action, currentIndex);
            content.appendChild(actionEl);
            if (globalCallbacks) globalCallbacks({ type: 'add', index: currentIndex, action, container });
            updateOpacity();
        }
        
        function undo() {
            if (currentIndex < 0) return;
            currentIndex--;
            updateOpacity();
            if (globalCallbacks) globalCallbacks({ type: 'undo', index: currentIndex, container });
        }
        
        function redo() {
            if (currentIndex >= actions.length - 1) return;
            currentIndex++;
            updateOpacity();
            if (globalCallbacks) globalCallbacks({ type: 'redo', index: currentIndex, container });
        }
        
        function clear() {
            actions.length = 0;
            currentIndex = -1;
            content.innerHTML = '';
            if (globalCallbacks) globalCallbacks({ type: 'clear', container });
        }
        
        // Create API object for this container
        const api = {
            container,
            addAction,
            undo,
            redo,
            clear,
            // Additional helper methods
            getCurrentIndex: () => currentIndex,
            getActions: () => [...actions],
            getActionsCount: () => actions.length
        };
        
        apis.push(api);
    });
    
    // Create global API similar to radio button pattern
    const globalAPI = {
        addAction: (icon, text, containerIndex = null) => {
            if (apis.length === 0) return;
            
            if (containerIndex !== null && apis[containerIndex]) {
                apis[containerIndex].addAction(icon, text);
            } else if (apis.length === 1) {
                apis[0].addAction(icon, text);
            } else {
                // Multiple containers - add to all
                apis.forEach(api => api.addAction(icon, text));
            }
        },
        
        undo: (containerIndex = null) => {
            if (apis.length === 0) return;
            
            if (containerIndex !== null && apis[containerIndex]) {
                apis[containerIndex].undo();
            } else if (apis.length === 1) {
                apis[0].undo();
            } else {
                apis.forEach(api => api.undo());
            }
        },
        
        redo: (containerIndex = null) => {
            if (apis.length === 0) return;
            
            if (containerIndex !== null && apis[containerIndex]) {
                apis[containerIndex].redo();
            } else if (apis.length === 1) {
                apis[0].redo();
            } else {
                apis.forEach(api => api.redo());
            }
        },
        
        clear: (containerIndex = null) => {
            if (apis.length === 0) return;
            
            if (containerIndex !== null && apis[containerIndex]) {
                apis[containerIndex].clear();
            } else if (apis.length === 1) {
                apis[0].clear();
            } else {
                apis.forEach(api => api.clear());
            }
        },
        
        // Helper methods
        getContainerCount: () => apis.length,
        getContainer: (index) => apis[index] || null,
        getAllContainers: () => apis
    };
    
    // Expose to window
    window.actionHistory = globalAPI;
    
    // Return based on number of containers found
    if (apis.length === 0) {
        console.warn('No .action-history-container elements found');
        return null;
    } else if (apis.length === 1) {
        return apis[0];
    } else {
        return apis;
    }
}

/* Programmatical Creation */
function createActionHistory(parentSelector, className) {
    // Determine targets similar to radio button logic
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

    const createdActionHistory = [];

    targets.forEach(target => {
        // Create container
        const container = document.createElement('div');
        container.className = `action-history-container ${className}`.trim();
        
        // Create header
        const header = document.createElement('div');
        header.className = 'action-history-header';
        header.textContent = 'Action History';
        
        // Create content area
        const content = document.createElement('div');
        content.className = 'action-history-content';
        
        container.appendChild(header);
        container.appendChild(content);
        target.appendChild(container);
        createdActionHistory.push(container);
    });

    // Rescan to initialize new container(s)
    scanActionHistory();

    return isClass ? createdActionHistory : createdActionHistory[0];
}

// Expose globally
window.createActionHistory = createActionHistory;