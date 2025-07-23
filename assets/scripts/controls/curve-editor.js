export function curveEditor(callback) {
    document.querySelectorAll('.curve-editor-container:not([data-initialized])').forEach(container => {
        // Mark as initialized to prevent duplicate handlers
        container.dataset.initialized = 'true';

        // ==== COLOR PRESETS ====
        const systemPreset = [
            {
                points: [
                    { x: 0, y: 1, controlPoints: [{ x: 0.33, y: 0.67 }] },
                    { x: 1, y: 0, controlPoints: [{ x: 0.67, y: 0.33 }] }
                ]
            },
            {
                points: [
                    { x: 0, y: 1, controlPoints: [{ x: 0.42, y: 1 }] },
                    { x: 1, y: 0, controlPoints: [{ x: 1, y: 0.58 }] }
                ]
            },
            {
                points: [
                    { x: 0, y: 1, controlPoints: [{ x: 0, y: 0.42 }] },
                    { x: 1, y: 0, controlPoints: [{ x: 0.58, y: 0 }] }
                ]
            },
            {
                points: [
                    { x: 0, y: 1, controlPoints: [{ x: 0.42, y: 1 }] },
                    { x: 1, y: 0, controlPoints: [{ x: 0.58, y: 0 }] }
                ]
            },
            {
                points: [
                    { x: 0, y: 1, controlPoints: [{ x: 0.50, y: 1 }] },
                    { x: 1, y: 0, controlPoints: [{ x: 0.895, y: 0.03 }] }
                ]
            },
            {
                points: [
                    { x: 0, y: 1, controlPoints: [{ x: 0.105, y: 0.97 }] },
                    { x: 1, y: 0, controlPoints: [{ x: 0.50, y: 0 }] }
                ]
            },
            {
                points: [
                    { x: 0, y: 1, controlPoints: [{ x: 0.77, y: 1 }] },
                    { x: 1, y: 0, controlPoints: [{ x: 0.23, y: 0 }] }
                ]
            },
            {
                points: [
                    { x: 0, y: 1, controlPoints: [{ x: 0.36, y: 1.05 }] },
                    { x: 1, y: 0, controlPoints: [{ x: 0.66, y: -0.02 }] }
                ]
            },
            {
                points: [
                    { x: 0, y: 1, controlPoints: [{ x: 0.34, y: 1.02 }] },
                    { x: 1, y: 0, controlPoints: [{ x: 0.64, y: -0.05 }] }
                ]
            },
            {
                points: [
                    { x: 0, y: 1, controlPoints: [{ x: 0.2, y: 0.8 }] },
                    { x: 0.4, y: 0.4, controlPoints: [{ x: 0.3, y: 0.6 }, { x: 0.5, y: 0.2 }] },
                    { x: 0.8, y: 0.2, controlPoints: [{ x: 0.7, y: 0.35 }, { x: 0.9, y: 0.05 }] },
                    { x: 1, y: 0, controlPoints: [{ x: 0.95, y: 0.1 }] }
                ]
            }
        ];

        let userPresets = JSON.parse(localStorage.getItem('curveEditorUserPresets')) || [];

        // ==== DOM ELEMENT REFERENCES ====
        const elements = {
            container,
            popup: container.querySelector('.curve-editor-popup'),
            showEditor: container.querySelector('.curve-editor-showeditor'),
            preview: container.querySelector('.curve-editor-preview'),
            editingCanvas: container.querySelector('.curve-editor-editing-canvas'),
            pointsContainer: container.querySelector('.curve-editor-points-container'),
            editModeButton: container.querySelector('.curve-editor-popup-action-edit-points'),
            addModeButton: container.querySelector('.curve-editor-popup-action-add-points'),
            resetCurveButton: container.querySelector('.curve-editor-popup-action-reset-curve'),
            okButton: container.querySelector('.curve-editor-popup-action-ok'),
            cancelButton: container.querySelector('.curve-editor-popup-action-cancel'),
            presetContainer: container.querySelector('.curve-editor-preset-grid'),
            curvePresets: Array.from(container.querySelectorAll('.curve-editor-preset')),
            addPreset: container.querySelector('.curve-editor-preset-action-add'),
            removePreset: container.querySelector('.curve-editor-preset-action-remove')
        };

        // ==== CANVAS SETUP ====
        initCanvasSizes();
        const editingCanvasContext = elements.editingCanvas.getContext('2d');
        const previewCanvasContext = elements.preview.getContext('2d');

        // ==== CURVE EDITOR STATE ====
        const state = {
            points: [],
            selectedPoint: null,
            dragOffset: { x: 0, y: 0 },
            isDragging: false,
            mode: 'edit',
            activeMainPoint: null
        };

        const constants = {
            mainPointSize: 16,
            controlLineSize: 2,
            controlPointSize: 12
        };

        let currentCurve;

        // ==== INITIALIZE CURVE EDITOR ====
        initCurveEditor();

        // ==== HELPER: INITIALIZING UTILTIES ====
        function initCanvasSizes() {
            const canvasRect = elements.editingCanvas.getBoundingClientRect();
            elements.editingCanvas.width = canvasRect.width;
            elements.editingCanvas.height = canvasRect.height;
        }

        function initCurveEditor() {
            initializePresets();
            initializeDefaultCurve();
            updatePointElements();
            render();
            updatePreview();
            currentCurve = getCurrentCurveAsSystemFormat();

            elements.popup.classList.remove('active');
        }

        function initializePresets() {
            elements.presetContainer.innerHTML = '';

            systemPreset.forEach((preset) => {
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;

                // Add classes for system presets
                canvas.className = 'curve-editor-preset unremovable';

                // Add click handler
                canvas.addEventListener('click', (e) => {
                    elements.curvePresets.forEach(p => p.classList.remove('selected'));
                    e.currentTarget.classList.add('selected');
                    applyPreset(preset);
                });

                // Draw the preset curve
                drawPresetCurve(canvas, preset);

                // Add to preset grid
                elements.presetContainer.appendChild(canvas);
                elements.curvePresets.push(canvas);
            });

            userPresets.forEach((preset) => {
                const canvas = document.createElement('canvas');
                canvas.width = 64;
                canvas.height = 64;

                // Add class for user presets (no unremovable)
                canvas.className = 'curve-editor-preset';

                // Add click handler
                canvas.addEventListener('click', (e) => {
                    elements.curvePresets.forEach(p => p.classList.remove('selected'));
                    e.currentTarget.classList.add('selected');
                    applyPreset(preset);
                });

                // Draw the preset curve
                drawPresetCurve(canvas, preset);

                // Add to preset grid
                elements.presetContainer.appendChild(canvas);
                elements.curvePresets.push(canvas);
            });
        }

        function initializeDefaultCurve() {
            applyPreset(systemPreset[0]);
        }

        // ==== HELPER: UPDATE UTILTIES ====
        function updateControlPoints() {
            state.points.forEach((point, index) => {
                if (index === 0) {
                    // First point: one control point
                    if (point.controlPoints.length > 1) {
                        point.controlPoints = [point.controlPoints[point.controlPoints.length - 1]];
                    }
                } else if (index === state.points.length - 1) {
                    // Last point: one control point
                    if (point.controlPoints.length > 1) {
                        point.controlPoints = [point.controlPoints[0]];
                    }
                } else {
                    // Middle points: two control points
                    if (point.controlPoints.length === 1) {
                        point.controlPoints.push({
                            x: point.x + 50,
                            y: point.y + 25,
                            element: null,
                            lineElement: null
                        });
                    }
                }
            });
        }

        function updatePointElements() {
            // Clear existing point elements
            elements.pointsContainer.innerHTML = '';

            // Create main point elements
            state.points.forEach((point, index) => {
                point.element = createPointElement(point, index);

                // Add active class if this is the active main point
                if (index === state.activeMainPoint) {
                    point.element.classList.add('active');
                }
            });

            // Create control point elements for active main point
            if (state.activeMainPoint !== null) {
                const mainPoint = state.points[state.activeMainPoint];
                mainPoint.controlPoints.forEach((cp, cpIndex) => {
                    // Create control line
                    cp.lineElement = createControlLineElement(mainPoint, cp);

                    // Create control point
                    cp.element = createPointElement(cp, state.activeMainPoint, true, cpIndex);
                });
            }
        }

        function updatePointPosition(pointElement, x, y) {
            pointElement.style.left = `${x + constants.controlLineSize / 2}px`;
            pointElement.style.top = `${y + constants.controlLineSize / 2}px`;
        }

        function updateControlLine(lineElement, mainPoint, controlPoint) {
            const dx = controlPoint.x - mainPoint.x;
            const dy = controlPoint.y - mainPoint.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;

            lineElement.style.left = `${mainPoint.x + constants.mainPointSize / 2}px`;
            lineElement.style.top = `${mainPoint.y + constants.mainPointSize / 2 - constants.controlLineSize / 2}px`;
            lineElement.style.width = `${length}px`;
            lineElement.style.transform = `rotate(${angle}deg)`;
        }

        function updatePreview() {
            // Clear the preview canvas first
            previewCanvasContext.clearRect(0, 0, elements.preview.width, elements.preview.height);

            // Draw the editing canvas scaled to fit the preview canvas
            previewCanvasContext.drawImage(
                elements.editingCanvas,
                0, 0, elements.editingCanvas.width, elements.editingCanvas.height,
                0, 0, elements.preview.width, elements.preview.height
            );

            elements.popup.classList.remove('active');
        }
        
        // ==== HELPER: CREATION UTILTIES ====
        function createPointElement(point, index, isControlPoint = false, controlIndex = null) {
            const pointElement = document.createElement('div');
            pointElement.className = isControlPoint ? 'curve-editor-control-point' : 'curve-editor-main-point';

            // Set initial position
            if (!isControlPoint) {
                pointElement.style.left = `${point.x}px`;
                pointElement.style.top = `${point.y}px`;
            }
            else {
                pointElement.style.left = `${point.x + constants.controlLineSize / 2}px`;
                pointElement.style.top = `${point.y + constants.controlLineSize / 2}px`;
            }

            // Add data attributes for identification
            if (isControlPoint) {
                pointElement.dataset.mainIndex = index;
                pointElement.dataset.controlIndex = controlIndex;
                pointElement.dataset.pointType = 'control';
            } else {
                pointElement.dataset.index = index;
                pointElement.dataset.pointType = 'main';

                // Add special classes for fixed points
                const isFixed = (index === 0 || index === state.points.length - 1);
                if (isFixed) {
                    pointElement.classList.add('fixed');
                }
            }

            // Add event listeners
            pointElement.addEventListener('mousedown', handlePointMouseDown);
            pointElement.addEventListener('contextmenu', handlePointRightClick);

            elements.pointsContainer.appendChild(pointElement);
            return pointElement;
        }

        function createControlLineElement(mainPoint, controlPoint) {
            const lineElement = document.createElement('div');
            lineElement.className = 'curve-editor-control-line';

            // Calculate line position and angle
            const dx = controlPoint.x - mainPoint.x;
            const dy = controlPoint.y - mainPoint.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;

            lineElement.style.left = `${mainPoint.x + constants.mainPointSize / 2}px`;
            lineElement.style.top = `${mainPoint.y + constants.mainPointSize / 2 - constants.controlLineSize / 2}px`;
            lineElement.style.width = `${length}px`;
            lineElement.style.transform = `rotate(${angle}deg)`;
            lineElement.style.transformOrigin = '0 50%';

            elements.pointsContainer.appendChild(lineElement);
            return lineElement;
        }

        function applyPreset(preset) {
            const width = elements.editingCanvas.width;
            const height = elements.editingCanvas.height;

            // Convert normalized coordinates to canvas coordinates
            state.points = preset.points.map(point => ({
                type: 'main',
                x: point.x * width,
                y: point.y * height,
                element: null,
                controlPoints: point.controlPoints.map(cp => ({
                    x: cp.x * width,
                    y: cp.y * height,
                    element: null,
                    lineElement: null
                }))
            }));

            state.activeMainPoint = null;
            updatePointElements();
            render();
        }

        // ==== HELPER: MOUSE ACTIONS ====
        function handleMouseMove(e) {
            if (!state.isDragging || !state.selectedPoint) return;

            const rect = elements.pointsContainer.getBoundingClientRect();
            const target = e.target.dataset.pointType;
            let x;
            let y;
            if (target === 'main') {
                x = e.clientX - rect.left - state.dragOffset.x - constants.mainPointSize / 2;
                y = e.clientY - rect.top - state.dragOffset.y - constants.mainPointSize / 2;
            }
            else {
                x = e.clientX - rect.left - state.dragOffset.x - constants.controlPointSize / 2 - constants.controlLineSize / 2;
                y = e.clientY - rect.top - state.dragOffset.y - constants.controlPointSize / 2 - constants.controlLineSize / 2;
            }

            x = Math.max(0, Math.min(elements.editingCanvas.width, x));
            y = Math.max(0, Math.min(elements.editingCanvas.height, y));

            if (state.selectedPoint.type === 'main') {
                const index = state.selectedPoint.index;
                const point = state.points[index];

                // For first and last points, only allow vertical movement
                if (index === 0 || index === state.points.length - 1) {
                    // Keep original x position, only update y
                    x = point.x;
                    const deltaY = y - point.y;
                    point.y = y;

                    // Update point element position
                    updatePointPosition(point.element, x, y);

                    // Move control points vertically along with main point
                    point.controlPoints.forEach(cp => {
                        cp.y += deltaY;
                        cp.y = Math.max(0, Math.min(elements.editingCanvas.height, cp.y));

                        if (cp.element) {
                            updatePointPosition(cp.element, cp.x, cp.y);
                        }
                        if (cp.lineElement) {
                            updateControlLine(cp.lineElement, point, cp);
                        }
                    });
                } else {
                    // For middle points, allow full movement
                    const deltaX = x - point.x;
                    const deltaY = y - point.y;

                    point.x = x;
                    point.y = y;

                    // Update point element position
                    updatePointPosition(point.element, x, y);

                    // Move control points along with main point
                    point.controlPoints.forEach(cp => {
                        cp.x += deltaX;
                        cp.y += deltaY;

                        cp.x = Math.max(0, Math.min(elements.editingCanvas.width, cp.x));
                        cp.y = Math.max(0, Math.min(elements.editingCanvas.height, cp.y));

                        if (cp.element) {
                            updatePointPosition(cp.element, cp.x, cp.y);
                        }
                        if (cp.lineElement) {
                            updateControlLine(cp.lineElement, point, cp);
                        }
                    });
                }

            } else if (state.selectedPoint.type === 'control') {
                const mainPoint = state.points[state.selectedPoint.mainIndex];
                const controlPoint = mainPoint.controlPoints[state.selectedPoint.controlIndex];

                controlPoint.x = x;
                controlPoint.y = y;

                // Update control point element position
                updatePointPosition(controlPoint.element, x, y);

                // Update control line
                if (controlPoint.lineElement) {
                    updateControlLine(controlPoint.lineElement, mainPoint, controlPoint);
                }
            }

            render();
        }

        function handleMouseUp() {
            if (state.isDragging) {
                state.isDragging = false;
                document.body.style.cursor = 'default';

                elements.pointsContainer.querySelectorAll('.dragging').forEach(el => {
                    el.classList.remove('dragging');
                });
            }
        }

        function handleCanvasClick(e) {
            if (state.mode === 'add') {
                const rect = elements.editingCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                addPoint(x, y);
            }
        }

        function handlePointMouseDown(e) {
            e.preventDefault();
            e.stopPropagation();

            const pointElement = e.target;
            const pointType = pointElement.dataset.pointType;

            if (state.mode === 'edit') {
                if (pointType === 'main') {
                    const index = parseInt(pointElement.dataset.index);

                    // Toggle control point visibility
                    if (state.activeMainPoint !== index) {
                        state.activeMainPoint = index;
                    }

                    state.selectedPoint = { type: 'main', index: index };

                    startDragging(e, pointElement);

                    updatePointElements();
                    render();

                } else if (pointType === 'control') {
                    const mainIndex = parseInt(pointElement.dataset.mainIndex);
                    const controlIndex = parseInt(pointElement.dataset.controlIndex);

                    state.selectedPoint = { type: 'control', mainIndex: mainIndex, controlIndex: controlIndex };
                    startDragging(e, pointElement);
                }
            }
        }

        function handlePointRightClick(e) {
            e.preventDefault();

            if (state.mode === 'edit' || state.points.length <= 2) return;

            const pointElement = e.target;
            const pointType = pointElement.dataset.pointType;

            if (pointType === 'main') {
                const index = parseInt(pointElement.dataset.index);

                // Don't allow deleting first or last points
                if (index === 0 || index === state.points.length - 1) {
                    return;
                }

                state.points.splice(index, 1);
                if (state.activeMainPoint === index) {
                    state.activeMainPoint = null;
                } else if (state.activeMainPoint > index) {
                    state.activeMainPoint--;
                }

                updateControlPoints();
                updatePointElements();
                render();
            }
        }

        function startDragging(e, pointElement) {
            state.isDragging = true;

            const pointRect = pointElement.getBoundingClientRect();

            state.dragOffset = {
                x: e.clientX - (pointRect.left + pointRect.width / 2),
                y: e.clientY - (pointRect.top + pointRect.height / 2)
            };

            document.body.style.cursor = 'grabbing';
            pointElement.classList.add('dragging');
        }

        
        // ==== HELPER: POINT ADDITIONS ====
        function addPoint(x, y) {
            x = Math.max(0, Math.min(elements.editingCanvas.width, x));
            y = Math.max(0, Math.min(elements.editingCanvas.height, y));

            // Find the best position to insert the new point
            let insertIndex = state.points.length - 1;
            let minDistance = Infinity;

            for (let i = 0; i < state.points.length - 1; i++) {
                const p1 = state.points[i];
                const p2 = state.points[i + 1];
                const distance = distanceToSegment(x, y, p1.x, p1.y, p2.x, p2.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    insertIndex = i + 1;
                }
            }

            // Create control points for the new point
            const controlPoints = [];
            const prevPoint = state.points[insertIndex - 1];
            const nextPoint = state.points[insertIndex];

            if (prevPoint) {
                let cpX = Math.max(0, Math.min(elements.editingCanvas.width, x - 50));
                let cpY = Math.max(0, Math.min(elements.editingCanvas.height, y - 25));
                controlPoints.push({ x: cpX, y: cpY, element: null, lineElement: null });
            }

            if (nextPoint) {
                let cpX = Math.max(0, Math.min(elements.editingCanvas.width, x + 50));
                let cpY = Math.max(0, Math.min(elements.editingCanvas.height, y + 25));
                controlPoints.push({ x: cpX, y: cpY, element: null, lineElement: null });
            }

            const newPoint = {
                type: 'main',
                x: x,
                y: y,
                element: null,
                controlPoints: controlPoints
            };

            state.points.splice(insertIndex, 0, newPoint);
            updateControlPoints();
            updatePointElements();
            render();
        }

        function distanceToSegment(px, py, x1, y1, x2, y2) {
            const A = px - x1;
            const B = py - y1;
            const C = x2 - x1;
            const D = y2 - y1;

            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            let param = -1;

            if (lenSq !== 0) {
                param = dot / lenSq;
            }

            let xx, yy;

            if (param < 0) {
                xx = x1;
                yy = y1;
            } else if (param > 1) {
                xx = x2;
                yy = y2;
            } else {
                xx = x1 + param * C;
                yy = y1 + param * D;
            }

            const dx = px - xx;
            const dy = py - yy;
            return Math.sqrt(dx * dx + dy * dy);
        }
        
        // ==== HELPER: MODE SELECTION ====
        function setMode(mode) {
            state.mode = mode;
            state.activeMainPoint = null;

            // Update UI
            elements.editModeButton.classList.toggle('active', mode === 'edit');
            elements.addModeButton.classList.toggle('active', mode === 'add');

            elements.editingCanvas.style.cursor = mode === 'add' ? 'crosshair' : 'default';
            updatePointElements();
            render();
        }

        function drawCurve() {
            if (state.points.length < 2) return;

            editingCanvasContext.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-50').trim();;
            editingCanvasContext.lineWidth = 2;
            editingCanvasContext.beginPath();

            // Move to first point
            editingCanvasContext.moveTo(state.points[0].x, state.points[0].y);

            for (let i = 0; i < state.points.length - 1; i++) {
                const p1 = state.points[i];
                const p2 = state.points[i + 1];

                let cp1, cp2;

                if (i === 0) {
                    // First segment
                    cp1 = p1.controlPoints[0];
                    cp2 = p2.controlPoints[0];
                } else {
                    // Middle segments
                    cp1 = p1.controlPoints[1] || p1.controlPoints[0];
                    cp2 = p2.controlPoints[0];
                }

                editingCanvasContext.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
            }

            editingCanvasContext.stroke();
        }

        // ==== HELPER: MISC UTILITIES ====
        function resetCurve() {
            state.points = [];
            state.activeMainPoint = null;
            initializeDefaultCurve();
            updatePointElements();
            render();
        }

        function render() {
            editingCanvasContext.clearRect(0, 0, elements.editingCanvas.width, elements.editingCanvas.height);
            drawCurve();
        }

        // ==== HELPER: CONVERT JSON TO USABLE FORMAT ====
        function getCurrentCurveAsSystemFormat() {
            const width = elements.editingCanvas.width;
            const height = elements.editingCanvas.height;

            // Convert current points to normalized coordinates (0-1 range)
            const normalizedPoints = state.points.map(point => {
                const normalizedPoint = {
                    x: point.x / width,
                    y: point.y / height,
                    controlPoints: point.controlPoints.map(cp => ({
                        x: cp.x / width,
                        y: cp.y / height
                    }))
                };

                // For the first and last points, only keep one control point
                if (normalizedPoint.controlPoints.length > 1) {
                    if (point === state.points[0]) {
                        normalizedPoint.controlPoints = [normalizedPoint.controlPoints[0]];
                    } else if (point === state.points[state.points.length - 1]) {
                        normalizedPoint.controlPoints = [normalizedPoint.controlPoints[normalizedPoint.controlPoints.length - 1]];
                    }
                }

                return normalizedPoint;
            });

            return {
                points: normalizedPoints
            };
        }

        function drawPresetCurve(canvas, preset) {
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);

            // Convert normalized coordinates to canvas coordinates
            const convertedPoints = preset.points.map(point => ({
                x: point.x * width,
                y: point.y * height,
                controlPoints: point.controlPoints.map(cp => ({
                    x: cp.x * width,
                    y: cp.y * height
                }))
            }));

            // Draw the curve
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-neutral-50').trim() || '#888';
            ctx.lineWidth = 2;
            ctx.beginPath();

            if (convertedPoints.length >= 2) {
                ctx.moveTo(convertedPoints[0].x, convertedPoints[0].y);

                for (let i = 0; i < convertedPoints.length - 1; i++) {
                    const p1 = convertedPoints[i];
                    const p2 = convertedPoints[i + 1];

                    let cp1, cp2;

                    if (i === 0) {
                        cp1 = p1.controlPoints[0];
                        cp2 = p2.controlPoints[0];
                    } else {
                        cp1 = p1.controlPoints[1] || p1.controlPoints[0];
                        cp2 = p2.controlPoints[0];
                    }

                    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y);
                }

                ctx.stroke();
            }
        }

        // ==== EVENT LISTENERS: DRAGGING ====
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // ==== EVENT LISTENERS: ON/OFF ====
        elements.showEditor.addEventListener('click', () => {
            if (elements.popup.classList.contains('active')) {
                elements.popup.classList.remove('active');
            }
            else {
                elements.popup.classList.add('active');
            }
        });

        // ==== EVENT LISTENERS: ADD/REMOVE SWATCHES ====
        elements.addPreset.addEventListener('click', () => {
            // Add the new preset
            const newPreset = getCurrentCurveAsSystemFormat();
            userPresets.push(newPreset);

            // Update localStorage
            localStorage.setItem('curveEditorUserPresets', JSON.stringify(userPresets));

            // Refresh the presets display
            initializePresets();

            // Select the newly added preset (last user preset)
            if (elements.curvePresets.length > 0) {
                const lastPreset = elements.curvePresets[elements.curvePresets.length - 1];
                lastPreset.classList.add('selected');
                applyPreset(newPreset);
            }
        });

        elements.removePreset.addEventListener('click', () => {
            const selectedElement = container.querySelector('.curve-editor-preset.selected');

            // Only proceed if a removable preset is selected
            if (!selectedElement || selectedElement.classList.contains('unremovable')) {
                return;
            }

            // Find which user preset this is
            const presetIndex = Array.from(elements.presetContainer.children).indexOf(selectedElement);
            const userPresetIndex = presetIndex - systemPreset.length;

            // Verify it's a valid user preset
            if (userPresetIndex >= 0 && userPresetIndex < userPresets.length) {
                // Remove from user presets
                userPresets.splice(userPresetIndex, 1);

                // Update localStorage
                localStorage.setItem('curveEditorUserPresets', JSON.stringify(userPresets));

                // Reinitialize presets (this will clear selection)
                initializePresets();

                // Select the first system preset as default
                if (elements.curvePresets.length > 0) {
                    elements.curvePresets[0].classList.add('selected');
                    applyPreset(systemPreset[0]);
                }
            }
        });

        // ==== EVENT LISTENERS: ADD/EDIT/RESET CURVE ====
        elements.editModeButton.addEventListener('click', () => setMode('edit'));
        elements.addModeButton.addEventListener('click', () => setMode('add'));
        elements.resetCurveButton.addEventListener('click', resetCurve);

        // ==== EVENT LISTENER: ADD POINTS ====
        elements.editingCanvas.addEventListener('click', handleCanvasClick);

        // ==== EVENT LISTENERS: OK/CANCEL ====
        elements.okButton.addEventListener('click', () => {
            updatePreview();
            currentCurve = getCurrentCurveAsSystemFormat();
            if (callback) {
                callback(currentCurve, elements.container.dataset.curveEditorValue);
            }
        });
        elements.cancelButton.addEventListener('click', () => {
            resetCurve();
            elements.popup.classList.remove('active');
        });

        // ==== EVENT LISTENER: CLOSE ON OUTSIDE CLICK ====
        window.addEventListener('click', (e) => {
            if (elements.popup.classList.contains('active')) {
                if (!elements.popup.contains(e.target) && !elements.showEditor.contains(e.target)) {
                    state.activeMainPoint = null;

                    updatePointElements();
                    render();

                    elements.popup.classList.remove('active');
                }
            }
        });
    });
}