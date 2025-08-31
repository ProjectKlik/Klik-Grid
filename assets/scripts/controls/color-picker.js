let globalCallbacks;

/* Initialization */
export function colorPicker(callback) {
    globalCallbacks = callback;
    scanColorPicker();
}

export function scanColorPicker() {
    document.querySelectorAll('.colorpicker-container:not([data-initialized])').forEach(container => {
        // Mark as initialized to prevent duplicate handlers
        container.dataset.initialized = 'true';

        // ==== COLOR PRESETS ====
        const systemPreset = [
            'black',
            '--color-neutral-900',
            '--color-neutral-700',
            '--color-neutral-500',
            '--color-neutral-300',
            '--color-neutral-100',
            'white',
            '--color-red-800',
            '--color-red-700',
            '--color-red-600',
            '--color-red-500',
            '--color-red-400',
            '--color-red-300',
            '--color-red-200',
            '--color-orange-800',
            '--color-orange-700',
            '--color-orange-600',
            '--color-orange-500',
            '--color-orange-400',
            '--color-orange-300',
            '--color-orange-200',
            '--color-yellow-800',
            '--color-yellow-700',
            '--color-yellow-600',
            '--color-yellow-500',
            '--color-yellow-400',
            '--color-yellow-300',
            '--color-yellow-200',
            '--color-green-800',
            '--color-green-700',
            '--color-green-600',
            '--color-green-500',
            '--color-green-400',
            '--color-green-300',
            '--color-green-200',
            '--color-cyan-800',
            '--color-cyan-700',
            '--color-cyan-600',
            '--color-cyan-500',
            '--color-cyan-400',
            '--color-cyan-300',
            '--color-cyan-200',
            '--color-blue-800',
            '--color-blue-700',
            '--color-blue-600',
            '--color-blue-500',
            '--color-blue-400',
            '--color-blue-300',
            '--color-blue-200',
            '--color-purple-800',
            '--color-purple-700',
            '--color-purple-600',
            '--color-purple-500',
            '--color-purple-400',
            '--color-purple-300',
            '--color-purple-200'
        ];

        let userPresets = JSON.parse(localStorage.getItem('colorPickerUserPresets')) || [];

        // ==== DOM ELEMENT REFERENCES ====
        const elements = {
            container,
            popup: container.querySelector('.colorpicker-popup'),
            showPicker: container.querySelector('.colorpicker-showpicker'),
            preview: container.querySelector('.colorpicker-preview'),
            colorCanvas: container.querySelector('.colorpicker-color-canvas'),
            colorCanvasMarker: container.querySelector('.colorpicker-color-canvas-marker'),
            oldColorPreview: container.querySelector('.colorpicker-picker-old-preview'),
            newColorPreview: container.querySelector('.colorpicker-picker-new-preview'),
            hueSlider: container.querySelector('.colorpicker-hue-slider'),
            hueSliderMarker: container.querySelector('.colorpicker-hue-slider-marker'),
            alphaSlider: container.querySelector('.colorpicker-alpha-slider'),
            alphaSliderMarker: container.querySelector('.colorpicker-alpha-slider-marker'),
            hexCodeField: container.querySelector('.colorpicker-hex-code'),
            colorSwatchGrid: container.querySelector('.colorpicker-swatch-grid'),
            colorSwatches: container.querySelectorAll('.colorpicker-swatch-color'),
            addSwatchButton: container.querySelector('.colorpicker-swatch-action-add'),
            removeSwatchButton: container.querySelector('.colorpicker-swatch-action-remove'),
            okButton: container.querySelector('.colorpicker-popup-action-ok'),
            cancelButton: container.querySelector('.colorpicker-popup-action-cancel'),
        };

        // ==== CANVAS SETUP ====
        initCanvasSizes();

        const colorCanvasContext = elements.colorCanvas.getContext('2d');
        const colorCanvasImageData = colorCanvasContext.createImageData(
            elements.colorCanvas.width, elements.colorCanvas.height
        );
        const colorCanvasData = colorCanvasImageData.data;
        const hueSliderContext = elements.hueSlider.getContext('2d');
        const alphaSliderContext = elements.alphaSlider.getContext('2d');

        // ==== COLOR PICKER STATE ====
        const currentColor = { r: 255, g: 0, b: 0, a: 255 };

        const markerHalfWidths = {
            hue: elements.hueSliderMarker.offsetWidth / 2,
            alpha: elements.alphaSliderMarker.offsetWidth / 2
        };

        let isDragging = {
            colorCanvasMarker: false,
            hueSliderMarker: false,
            alphaSliderMarker: false,
        };

        // ==== INITIALIZE COLOR PICKER ====
        initColorPicker();

        // ==== HELPER: INITIALIZING UTILTIES ====
        function initCanvasSizes() {
            const colorCanvasRect = elements.colorCanvas.getBoundingClientRect();
            elements.colorCanvas.width = colorCanvasRect.width;
            elements.colorCanvas.height = colorCanvasRect.height;

            const hueSliderRect = elements.hueSlider.getBoundingClientRect();
            elements.hueSlider.width = hueSliderRect.width;
            elements.hueSlider.height = hueSliderRect.height;

            const alphaSliderRect = elements.alphaSlider.getBoundingClientRect();
            elements.alphaSlider.width = alphaSliderRect.width;
            elements.alphaSlider.height = alphaSliderRect.height;
        }

        function initColorPicker() {
            elements.colorCanvasMarker.style.left = `${elements.colorCanvas.width - 1}px`;
            elements.colorCanvasMarker.style.top = '0px';
            elements.preview.style.backgroundColor = rgbaToString(currentColor);

            initializePresets();
            updateColorCanvas();
            updateHueCanvas();
            updateAlphaCanvas();
            updatePreviewColor(0, 0);
            updateHexField();
            swatchEventListenerUpdater();
            elements.popup.classList.remove('active');
        }

        function initializePresets() {
            elements.colorSwatchGrid.innerHTML = '';

            systemPreset.forEach(preset => {
                const swatch = document.createElement('div');
                swatch.className = 'colorpicker-swatch-color unremovable';
                swatch.style.backgroundColor = preset.startsWith('--') ? `var(${preset})` : preset;
                elements.colorSwatchGrid.appendChild(swatch);
            });

            userPresets.forEach(preset => {
                const swatch = document.createElement('div');
                swatch.className = 'colorpicker-swatch-color';
                swatch.style.backgroundColor = rgbaToString(preset);
                elements.colorSwatchGrid.appendChild(swatch);
            });

            updateColorSwatches();
        }

        // ==== HELPER: UPDATE UTILTIES ====
        function updateColorCanvas() {
            for (let y = 0; y < elements.colorCanvas.height; y++) {
                const vFactor = Math.min(1, elements.colorCanvas.height > 1 ?
                    y / (elements.colorCanvas.height - 1) : 0);

                for (let x = 0; x < elements.colorCanvas.width; x++) {
                    const hFactor = Math.min(1, elements.colorCanvas.width > 1 ?
                        x / (elements.colorCanvas.width - 1) : 0);

                    const rBlend = 255 * (1 - hFactor) + currentColor.r * hFactor;
                    const gBlend = 255 * (1 - hFactor) + currentColor.g * hFactor;
                    const bBlend = 255 * (1 - hFactor) + currentColor.b * hFactor;

                    const r = rBlend * (1 - vFactor);
                    const g = gBlend * (1 - vFactor);
                    const b = bBlend * (1 - vFactor);

                    const index = (y * elements.colorCanvas.width + x) * 4;
                    colorCanvasData[index] = Math.round(r);
                    colorCanvasData[index + 1] = Math.round(g);
                    colorCanvasData[index + 2] = Math.round(b);
                    colorCanvasData[index + 3] = 255;
                }
            }

            colorCanvasContext.putImageData(colorCanvasImageData, 0, 0);
        }

        function updateHueCanvas() {
            const gradient = hueSliderContext.createLinearGradient(0, 0, elements.hueSlider.width, 0);
            for (let i = 0; i <= 360; i += 60) {
                gradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
            }
            hueSliderContext.fillStyle = gradient;
            hueSliderContext.fillRect(0, 0, elements.hueSlider.width, elements.hueSlider.height);
        }

        function updateAlphaCanvas() {
            const patternSize = 10;
            const checkerCanvas = document.createElement('canvas');
            checkerCanvas.width = patternSize * 2;
            checkerCanvas.height = patternSize * 2;
            const checkerCanvasContext = checkerCanvas.getContext('2d');

            checkerCanvasContext.fillStyle = '#ccc';
            checkerCanvasContext.fillRect(0, 0, checkerCanvas.width, checkerCanvas.height);
            checkerCanvasContext.fillStyle = '#eee';
            checkerCanvasContext.fillRect(0, 0, patternSize, patternSize);
            checkerCanvasContext.fillRect(patternSize, patternSize, patternSize, patternSize);

            const pattern = alphaSliderContext.createPattern(checkerCanvas, 'repeat');
            alphaSliderContext.fillStyle = pattern;
            alphaSliderContext.fillRect(0, 0, elements.alphaSlider.width, elements.alphaSlider.height);

            const { r, g, b } = currentColor;
            const gradient = alphaSliderContext.createLinearGradient(0, 0, elements.alphaSlider.width, 0);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 1)`);
            alphaSliderContext.fillStyle = gradient;
            alphaSliderContext.fillRect(0, 0, elements.alphaSlider.width, elements.alphaSlider.height);
        }

        function updateHexField() {
            elements.hexCodeField.value = rgbaToHex(currentColor);
        }

        function updateColorSwatches() {
            elements.colorSwatches = container.querySelectorAll('.colorpicker-swatch-color');
        }

        function updateAllCanvases() {
            const hsv = rgbToHsv(currentColor.r, currentColor.g, currentColor.b);
            const tempColor = hslToRgb(hsv.h, 1, 0.5);
            const originalColor = { ...currentColor };

            currentColor.r = tempColor.r;
            currentColor.g = tempColor.g;
            currentColor.b = tempColor.b;
            updateColorCanvas();

            currentColor.r = originalColor.r;
            currentColor.g = originalColor.g;
            currentColor.b = originalColor.b;
            currentColor.a = originalColor.a;

            updateAlphaCanvas();
        }

        function updatePreviewColor(x, y) {
            const color = getColorAtPosition(x, y);
            if (color) {
                currentColor.r = color.r;
                currentColor.g = color.g;
                currentColor.b = color.b;
                elements.newColorPreview.style.backgroundColor = rgbaToString(currentColor);
                updateAlphaCanvas();
            }
        }

        // ==== HELPER: MOVE MARKERS ====
        function moveColorCanvasMarker(e) {
            const rect = elements.colorCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const clampedX = Math.max(0, Math.min(x, rect.width - 1));
            const clampedY = Math.max(0, Math.min(y, rect.height - 1));

            elements.colorCanvasMarker.style.left = `${clampedX}px`;
            elements.colorCanvasMarker.style.top = `${clampedY}px`;

            updatePreviewColor(clampedX, clampedY);
            updateHexField();
        }

        function moveHueSliderMarker(e) {
            const rect = elements.hueSlider.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const normalizedX = Math.max(0, Math.min(x / rect.width, 1));
            const quantizedX = quantizeToSteps(normalizedX, 255);
            const clampedX = quantizedX * rect.width;

            elements.hueSliderMarker.style.left = `${clampedX - markerHalfWidths.hue}px`;

            const hueFactor = clampedX / rect.width;
            const hue = hueFactor * 360;

            const canvasMarkerX = parseFloat(elements.colorCanvasMarker.style.left) || 200;
            const canvasMarkerY = parseFloat(elements.colorCanvasMarker.style.top) || 0;

            const saturation = canvasMarkerX / (elements.colorCanvas.width - 1);
            const luminance = 1 - (canvasMarkerY / (elements.colorCanvas.height - 1));

            const { r, g, b } = hslToRgb(hue, saturation, luminance);
            const baseHue = hslToRgb(hue, 1, 0.5);

            currentColor.r = baseHue.r;
            currentColor.g = baseHue.g;
            currentColor.b = baseHue.b;

            elements.newColorPreview.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${currentColor.a / 255})`;
            updateColorCanvas();
            updateAlphaCanvas();
            updatePreviewColor(canvasMarkerX, canvasMarkerY);
            updateHexField();
        }

        function moveAlphaSliderMarker(e) {
            const rect = elements.alphaSlider.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const normalizedX = Math.max(0, Math.min(x / rect.width, 1));
            const quantizedX = quantizeToSteps(normalizedX, 255);
            const clampedX = quantizedX * rect.width;

            elements.alphaSliderMarker.style.left = `${clampedX - markerHalfWidths.alpha}px`;
            currentColor.a = Math.round(quantizedX * 255);
            elements.newColorPreview.style.backgroundColor = rgbaToString(currentColor);
            updateAlphaCanvas();
            updateHexField();
        }

        // ==== HELPER: COLOR UPDATES ====
        function updateColorFromRgba(rgba) {
            currentColor.r = rgba.r;
            currentColor.g = rgba.g;
            currentColor.b = rgba.b;
            currentColor.a = rgba.a;

            const hsv = rgbToHsv(rgba.r, rgba.g, rgba.b);
            positionMarkersFromHsv(hsv);
            updateAllCanvases();
            elements.newColorPreview.style.backgroundColor = rgbaToString(currentColor);
            updateHexField();
        }

        function positionMarkersFromHsv(hsv) {
            // Hue slider
            const hueX = (hsv.h / 360) * elements.hueSlider.width;
            elements.hueSliderMarker.style.left = `${hueX - markerHalfWidths.hue}px`;

            // Color canvas
            const x = hsv.s * (elements.colorCanvas.width - 1);
            const y = (1 - hsv.v) * (elements.colorCanvas.height - 1);
            const clampedX = Math.max(0, Math.min(x, elements.colorCanvas.width - 1));
            const clampedY = Math.max(0, Math.min(y, elements.colorCanvas.height - 1));
            elements.colorCanvasMarker.style.left = `${clampedX}px`;
            elements.colorCanvasMarker.style.top = `${clampedY}px`;

            // Alpha slider
            const alphaX = (currentColor.a / 255) * elements.alphaSlider.width;
            elements.alphaSliderMarker.style.left = `${alphaX - markerHalfWidths.alpha}px`;
        }

        // ==== HELPER: SWATCH SELECTION ====
        function selectSwatch(e) {
            const style = getComputedStyle(e.currentTarget);
            let colorValue = style.backgroundColor;

            if (colorValue.startsWith('var(')) {
                const varName = colorValue.match(/var\((--[^)]*)\)/)[1];
                colorValue = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
            }

            const rgba = parseCssColorToRgba(colorValue);
            if (rgba) {
                updateColorFromRgba(rgba);
            }
        }

        function swatchEventListenerUpdater() {
            elements.colorSwatches.forEach(swatch => {
                if (swatch.dataset.addedListener) return;
                swatch.dataset.addedListener = 'true';

                swatch.addEventListener('click', (e) => {
                    elements.colorSwatches.forEach(s => s.classList.remove('selected'));
                    e.currentTarget.classList.add('selected');
                    selectSwatch(e);
                });
            });
        }

        // ==== HELPER: MISC UTILITIES ====
        function quantizeToSteps(value, steps = 255) {
            return Math.round(value * steps) / steps;
        }

        function revertToOldColor() {
            const oldColorRgba = parseCssColorToRgba(elements.oldColorPreview.style.backgroundColor);
            updateColorFromRgba(oldColorRgba);
        }

        function handleHexInputBlur() {
            const hex = this.value.trim();
            if (!isValidHex(hex)) {
                updateHexField();
                return;
            }

            const rgba = hexToRgba(hex);
            if (!rgba) {
                updateHexField();
                return;
            }

            updateColorFromRgba(rgba);
        }

        function getColorAtPosition(x, y) {
            const pixelX = Math.round(x);
            const pixelY = Math.round(y);

            if (pixelX >= 0 && pixelX < elements.colorCanvas.width &&
                pixelY >= 0 && pixelY < elements.colorCanvas.height) {
                const index = (pixelY * elements.colorCanvas.width + pixelX) * 4;
                return {
                    r: colorCanvasData[index],
                    g: colorCanvasData[index + 1],
                    b: colorCanvasData[index + 2],
                    a: colorCanvasData[index + 3]
                };
            }
            return null;
        }

        // ==== COLOR CONVERSION FUNCTIONS ====
        function hslToRgb(h, s, l) {
            h /= 360;
            let r, g, b;
            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }
            return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
        }

        function rgbToHsv(r, g, b) {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, v = max;
            const d = max - min;
            s = max === 0 ? 0 : d / max;

            if (max === min) {
                h = 0;
            } else {
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h *= 60;
            }
            return { h, s, v };
        }

        function rgbaToHex({ r, g, b, a }) {
            const toHex = (n) => Math.round(Math.min(255, Math.max(0, n)))
                .toString(16).padStart(2, '0').toUpperCase();

            return a !== 255 ?
                `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}` :
                `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }

        function hexToRgba(hex) {
            hex = hex.replace(/^#/, '');
            let r, g, b, a = 255;

            if (hex.length === 3 || hex.length === 4) {
                r = parseInt(hex[0] + hex[0], 16);
                g = parseInt(hex[1] + hex[1], 16);
                b = parseInt(hex[2] + hex[2], 16);
                if (hex.length === 4) a = parseInt(hex[3] + hex[3], 16);
            } else if (hex.length === 6 || hex.length === 8) {
                r = parseInt(hex.substring(0, 2), 16);
                g = parseInt(hex.substring(2, 4), 16);
                b = parseInt(hex.substring(4, 6), 16);
                if (hex.length === 8) a = parseInt(hex.substring(6, 8), 16);
            } else {
                return null;
            }

            return { r, g, b, a };
        }

        function isValidHex(hex) {
            return /^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(hex);
        }

        function parseCssColorToRgba(colorString) {
            const tempDiv = document.createElement('div');
            tempDiv.style.color = colorString;
            document.body.appendChild(tempDiv);
            const computedColor = getComputedStyle(tempDiv).color;
            document.body.removeChild(tempDiv);

            const rgbaMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/);
            if (rgbaMatch) {
                return {
                    r: parseInt(rgbaMatch[1]),
                    g: parseInt(rgbaMatch[2]),
                    b: parseInt(rgbaMatch[3]),
                    a: rgbaMatch[4] ? parseFloat(rgbaMatch[4]) * 255 : 255
                };
            }
            return null;
        }

        function rgbaToString({ r, g, b, a }) {
            return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
        }

        // ==== EVENT LISTENERS: DRAGGING ====
        elements.colorCanvas.addEventListener('mousedown', (e) => {
            isDragging.colorCanvasMarker = true;
            moveColorCanvasMarker(e);
        });

        elements.hueSlider.addEventListener('mousedown', (e) => {
            isDragging.hueSliderMarker = true;
            moveHueSliderMarker(e);
        });

        elements.alphaSlider.addEventListener('mousedown', (e) => {
            isDragging.alphaSliderMarker = true;
            moveAlphaSliderMarker(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging.colorCanvasMarker) moveColorCanvasMarker(e);
            if (isDragging.hueSliderMarker) moveHueSliderMarker(e);
            if (isDragging.alphaSliderMarker) moveAlphaSliderMarker(e);
        });

        document.addEventListener('mouseup', () => {
            isDragging = {
                colorCanvasMarker: false,
                hueSliderMarker: false,
                alphaSliderMarker: false,
            };
        });

        // ==== EVENT LISTENERS: ON/OFF & HEX CODE ====
        elements.showPicker.addEventListener('click', () => {
            if (elements.popup.classList.contains('active')) {
                elements.popup.classList.remove('active');
            } else {
                elements.oldColorPreview.style.backgroundColor = rgbaToString(currentColor);
                elements.popup.classList.add('active');
                const canvasMarkerX = parseFloat(elements.colorCanvasMarker.style.left) || 0;
                const canvasMarkerY = parseFloat(elements.colorCanvasMarker.style.top) || 0;
                updatePreviewColor(canvasMarkerX, canvasMarkerY);
            }
        });

        elements.hexCodeField.addEventListener('blur', handleHexInputBlur);

        // ==== EVENT LISTENERS: ADD/REMOVE SWATCHES ====
        elements.addSwatchButton.addEventListener('click', () => {
            const rgba = {
                r: currentColor.r,
                g: currentColor.g,
                b: currentColor.b,
                a: currentColor.a
            };

            const newSwatch = document.createElement('div');
            newSwatch.classList.add('colorpicker-swatch-color');
            newSwatch.style.backgroundColor = rgbaToString(rgba);
            elements.colorSwatchGrid.appendChild(newSwatch);
            updateColorSwatches();
            swatchEventListenerUpdater();

            userPresets.push(rgba);
            localStorage.setItem('colorPickerUserPresets', JSON.stringify(userPresets));
        });

        elements.removeSwatchButton.addEventListener('click', () => {
            for (let swatch of elements.colorSwatches) {
                if (swatch.classList.contains('selected') && !swatch.classList.contains('unremovable')) {
                    const style = getComputedStyle(swatch);
                    const bgColor = style.backgroundColor;
                    const rgbaMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);

                    if (rgbaMatch) {
                        const r = parseInt(rgbaMatch[1]);
                        const g = parseInt(rgbaMatch[2]);
                        const b = parseInt(rgbaMatch[3]);
                        // Handle both formats: rgba(R,G,B,A) and rgb(R,G,B)
                        const a = rgbaMatch[4] ? Math.round(parseFloat(rgbaMatch[4]) * 255) : 255;

                        userPresets = userPresets.filter(savedColor =>
                            !(savedColor.r === r &&
                                savedColor.g === g &&
                                savedColor.b === b &&
                                savedColor.a === a)
                        );
                        localStorage.setItem('colorPickerUserPresets', JSON.stringify(userPresets));
                    }

                    swatch.remove();
                    break;
                }
            }
            updateColorSwatches();
        });

        // ==== EVENT LISTENERS: OK/CANCEL ====
        elements.okButton.addEventListener('click', () => {
            elements.preview.style.backgroundColor = rgbaToString(currentColor);
            elements.popup.classList.remove('active');
            if (globalCallbacks) {
                globalCallbacks(currentColor.r, currentColor.g, currentColor.b, elements.container.dataset.colorpickerValue);
            }
        });

        elements.cancelButton.addEventListener('click', () => {
            revertToOldColor();
            elements.popup.classList.remove('active');
        });

        // ==== EVENT LISTENER: CLOSE ON OUTSIDE CLICK ====
        window.addEventListener('click', (event) => {
            if (elements.popup.classList.contains('active') &&
                !elements.popup.contains(event.target) &&
                !elements.showPicker.contains(event.target)) {
                revertToOldColor();
                elements.popup.classList.remove('active');
            }
        });
    });
}

/* Programmatical Creation */
function createColorPicker(parentSelector, value, className) {
    // Spawn the color picker in the specified parent
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
    
    const createdColorPickers = [];
    
    targets.forEach(target => {
        const container = document.createElement('div');
        container.className = `colorpicker-container ${className}`.trim();
        container.dataset.colorpickerValue = value;
        
        // HTML template
        container.innerHTML = `
            <button class="colorpicker-showpicker">
                <div class="colorpicker-preview"></div>
                <svg class="fill-icon" viewBox="0 0 24 24">
                    <path d="M18 9c.852 0 1.297 .986 .783 1.623l-.076 .084l-6 6a1 1 0 0 1 -1.32 .083l-.094 -.083l-6 -6l-.083 -.094l-.054 -.077l-.054 -.096l-.017 -.036l-.027 -.067l-.032 -.108l-.01 -.053l-.01 -.06l-.004 -.057v-.118l.005 -.058l.009 -.06l.01 -.052l.032 -.108l.027 -.067l.07 -.132l.065 -.09l.073 -.081l.094 -.083l.077 -.054l.096 -.054l.036 -.017l.067 -.027l.108 -.032l.053 -.01l.06 -.01l.057 -.004l12.059 -.002z" />
                </svg>
            </button>
            <div class="colorpicker-popup active">
                <div class="colorpicker-popup-content">
                    <div class="colorpicker-popup-left">
                        <div class="colorpicker-color-canvas-container">
                            <canvas class="colorpicker-color-canvas"></canvas>
                            <div class="colorpicker-color-canvas-marker"></div>
                        </div>
                        <div class="colorpicker-color-row">
                            <div class="colorpicker-picker-old-preview"></div>
                            <div class="colorpicker-picker-new-preview"></div>
                        </div>
                        <hr class="no-margin">
                        <div class="colorpicker-hue-slider-container">
                            <canvas class="colorpicker-hue-slider"></canvas>
                            <div class="colorpicker-hue-slider-marker"></div>
                        </div>
                        <div class="colorpicker-alpha-slider-container">
                            <canvas class="colorpicker-alpha-slider"></canvas>
                            <div class="colorpicker-alpha-slider-marker"></div>
                        </div>
                        <hr class="no-margin">
                        <div class="colorpicker-hex-code-container">
                            <input class="colorpicker-hex-code text-input" type="text" placeholder="Hex Code">
                        </div>
                    </div>
                    <div class="colorpicker-popup-right">
                        <div class="colorpicker-swatch-container">
                            <span class="colorpicker-swatch-label">Color Swatches:</span>
                            <div class="colorpicker-swatch-grid"></div>
                            <button class="colorpicker-swatch-action-add" data-button-value="Add Swatch Button">Add Swatch</button>
                            <button class="colorpicker-swatch-action-remove" data-button-value="Remove Swatch Button">Remove Swatch</button>
                        </div>
                    </div>
                </div>
                <div class="colorpicker-popup-action">
                    <button class="colorpicker-popup-action-ok" data-button-value="Ok Button">Ok</button>
                    <button class="colorpicker-popup-action-cancel" data-button-value="Cancel Button">Cancel</button>
                </div>
            </div>
        `;
        
        target.appendChild(container);
        createdColorPickers.push(container);
    });
    
    // Rescan to initialize new color picker(s)
    scanColorPicker();
    
    return isClass ? createdColorPickers : createdColorPickers[0];
}

// Expose globally
window.createColorPicker = createColorPicker;