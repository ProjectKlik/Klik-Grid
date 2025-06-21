export function separator(callback) {
    document.querySelectorAll('.separator-container').forEach(container => {
        if (container.dataset.separatorInitialized) return;
        container.dataset.separatorInitialized = 'true';

        let isDragging = false;
        let currentBar = null;
        let startPos = 0;
        let prevPane, nextPane, parentContainer;

        const handleMouseDown = e => {
            if (!e.target.classList.contains('drag-bar')) return;
            isDragging = true;
            currentBar = e.target;
            const isH = currentBar.classList.contains('horizontal');

            startPos = isH ? e.clientY : e.clientX;
            prevPane = currentBar.previousElementSibling;
            nextPane = currentBar.nextElementSibling;
            parentContainer = currentBar.parentElement;

            document.body.style.userSelect = 'none';
        };

        const handleMouseMove = e => {
            if (!isDragging) return;
            e.preventDefault();

            const isH = currentBar.classList.contains('horizontal');
            const pos = isH ? e.clientY : e.clientX;
            const rawDelta = pos - startPos;

            const panes = Array.from(parentContainer.children)
                .filter(n => n.classList.contains('pane'));
            const minSize = 100;

            // current sizes of the two panes you're interacting with
            const prevSize = isH ? prevPane.offsetHeight : prevPane.offsetWidth;
            const nextSize = isH ? nextPane.offsetHeight : nextPane.offsetWidth;

            // clamp the delta so neither pane drops below `minSize`
            const maxDelta = nextSize - minSize;            // can't shrink nextPane below min
            const minDelta = minSize - prevSize;            // can't shrink prevPane below min
            const delta = Math.max(minDelta, Math.min(rawDelta, maxDelta));
            const newPrev = prevSize + delta;
            const applied = newPrev - prevSize;

            // 1) fix prevPane exactly
            prevPane.style.flex = `0 0 ${newPrev}px`;

            // 2) freeze all the other non‑adjacent panes
            panes.forEach(p => {
                if (p !== prevPane && p !== nextPane) {
                    const sz = isH ? p.offsetHeight : p.offsetWidth;
                    p.style.flex = `0 0 ${sz}px`;
                }
            });

            // 3) let nextPane stretch/compress to fill remaining space,
            //    but our clamping above guarantees it won't go < minSize
            nextPane.style.flex = '1 1 auto';

            // shift our origin so further deltas are relative
            startPos += applied;

            if (callback) {
                callback(container.dataset.separatorValue, currentBar.dataset.separatorValue);
            }
        };

        const handleMouseUp = () => {
            isDragging = false;
            currentBar = null;
            document.body.style.userSelect = '';
        };

        container.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        container.cleanupResizable = () => {
            container.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    });
}
