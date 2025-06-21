export function colorPicker(callback) {
    document.querySelectorAll('.colorpicker-container').forEach(container => {
        // Skip if already initialized
        if (container.dataset.colorPickerInitialized) return;
        container.dataset.colorPickerInitialized = 'true';

        // Element References
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

        // Canvas Sizes Setup
        const colorCanvasRect = elements.colorCanvas.getBoundingClientRect();
        elements.colorCanvas.width = colorCanvasRect.width;
        elements.colorCanvas.height = colorCanvasRect.height;

        const hueSliderRect = elements.hueSlider.getBoundingClientRect();
        elements.hueSlider.width = hueSliderRect.width;
        elements.hueSlider.height = hueSliderRect.height;

        const alphaSliderRect = elements.alphaSlider.getBoundingClientRect();
        elements.alphaSlider.width = alphaSliderRect.width;
        elements.alphaSlider.height = alphaSliderRect.height;

        // Canvas Contexts and Data
        const colorCanvasContext = elements.colorCanvas.getContext('2d');
        const colorCanvasImageData = colorCanvasContext.createImageData(elements.colorCanvas.width, elements.colorCanvas.height);
        const colorCanvasData = colorCanvasImageData.data;

        const hueSliderContext = elements.hueSlider.getContext('2d');
        const alphaSliderContext = elements.alphaSlider.getContext('2d');

        // Marker Half-Width Calculations for Centering
        const markerHalfWidths = { hue: elements.hueSliderMarker.offsetWidth / 2, alpha: elements.alphaSliderMarker.offsetWidth / 2 };

        // State Variables
        const currentColor = { r: 255, g: 0, b: 0, a: 255 };
        let isDragging = {
            colorCanvasMarker: false,
            hueSliderMarker: false,
            alphaSliderMarker: false,
        };

        // --- Helper Functions ---
        function updateColorCanvas() {
            for (let y = 0; y < elements.colorCanvas.height; y++) {
                const vFactor = Math.min(1, elements.colorCanvas.height > 1 ? y / (elements.colorCanvas.height - 1) : 0);

                for (let x = 0; x < elements.colorCanvas.width; x++) {
                    const hFactor = Math.min(1, elements.colorCanvas.width > 1 ? x / (elements.colorCanvas.width - 1) : 0);

                    // Horizontal blend: white to selected color
                    const rBlend = 255 * (1 - hFactor) + currentColor.r * hFactor;
                    const gBlend = 255 * (1 - hFactor) + currentColor.g * hFactor;
                    const bBlend = 255 * (1 - hFactor) + currentColor.b * hFactor;

                    // Vertical fade to black (simulating brightness)
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

            if (callback) {
                callback(currentColor.r, currentColor.g, currentColor.b, elements.container.dataset.pickerValue);
            }
        }

        function updatePreviewColor(x, y) {
            const color = getColorAtPosition(x, y);

            if (color) {
                currentColor.r = color.r;
                currentColor.g = color.g;
                currentColor.b = color.b;
                elements.newColorPreview.style.backgroundColor = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a / 255})`;
                updateAlphaCanvas();
            }
        }

        function getColorAtPosition(x, y) {
            const pixelX = Math.round(x);
            const pixelY = Math.round(y);

            if (pixelX >= 0 && pixelX < elements.colorCanvas.width && pixelY >= 0 && pixelY < elements.colorCanvas.height) {
                const index = (pixelY * elements.colorCanvas.width + pixelX) * 4;
                const r = colorCanvasData[index];
                const g = colorCanvasData[index + 1];
                const b = colorCanvasData[index + 2];
                const a = colorCanvasData[index + 3];
                return { r, g, b, a };
            }

            return null;
        }

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

            const alphaFactor = clampedX / rect.width;
            currentColor.a = Math.round(alphaFactor * 255);
            elements.newColorPreview.style.backgroundColor = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a / 255})`;

            updateAlphaCanvas();
            updateHexField();
        }

        function handleHexInputBlur() {
            const hex = this.value.trim();
            if (!isValidHex(hex)) {
                updateHexField(); // Revert to previous value
                return;
            }

            const rgba = hexToRgba(hex);
            if (!rgba) {
                updateHexField();
                return;
            }

            // Update currentColor directly with the RGBA values
            currentColor.r = rgba.r;
            currentColor.g = rgba.g;
            currentColor.b = rgba.b;
            currentColor.a = rgba.a;

            // Get HSV for positioning the markers correctly
            const hsv = rgbToHsv(rgba.r, rgba.g, rgba.b);

            // Position the hue slider marker
            const hueX = (hsv.h / 360) * elements.hueSlider.width;
            elements.hueSliderMarker.style.left = `${hueX - markerHalfWidths.hue}px`;

            // Update the base hue for the color canvas (this is what the canvas shows as the "pure" color)
            const newHslRgb = hslToRgb(hsv.h, 1, 0.5);
            // But don't overwrite currentColor! Instead, use this for canvas updates only
            const tempColor = { r: newHslRgb.r, g: newHslRgb.g, b: newHslRgb.b };

            // Temporarily store current color
            const originalColor = { ...currentColor };

            // Set the base hue color for canvas rendering
            currentColor.r = tempColor.r;
            currentColor.g = tempColor.g;
            currentColor.b = tempColor.b;

            // Update the canvas with the pure hue
            updateColorCanvas();

            // Restore the actual selected color
            currentColor.r = originalColor.r;
            currentColor.g = originalColor.g;
            currentColor.b = originalColor.b;
            currentColor.a = originalColor.a;

            // Update alpha canvas with the actual color
            updateAlphaCanvas();

            // Position the color canvas marker based on saturation and value
            const x = hsv.s * (elements.colorCanvas.width - 1);
            const y = (1 - hsv.v) * (elements.colorCanvas.height - 1);
            const clampedX = Math.max(0, Math.min(x, elements.colorCanvas.width - 1));
            const clampedY = Math.max(0, Math.min(y, elements.colorCanvas.height - 1));
            elements.colorCanvasMarker.style.left = `${clampedX}px`;
            elements.colorCanvasMarker.style.top = `${clampedY}px`;

            // Position the alpha slider marker
            const alphaX = (currentColor.a / 255) * elements.alphaSlider.width;
            elements.alphaSliderMarker.style.left = `${alphaX - markerHalfWidths.alpha}px`;

            // Update the preview with the actual selected color
            elements.newColorPreview.style.backgroundColor = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a / 255})`;

            // Update hex field to ensure it shows the correct value
            updateHexField();
        }

        function selectSwatch(e) {
            const style = getComputedStyle(e.currentTarget);
            let colorValue = style.backgroundColor;

            // Handle CSS variables if present
            if (colorValue.startsWith('var(')) {
                const varName = colorValue.match(/var\((--[^)]*)\)/)[1];
                colorValue = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
            }

            // Convert the color value to RGBA
            const rgba = parseCssColorToRgba(colorValue);

            if (rgba) {
                currentColor.r = rgba.r;
                currentColor.g = rgba.g;
                currentColor.b = rgba.b;
                currentColor.a = rgba.a;

                // Update the color picker state based on the selected swatch color
                const hsv = rgbToHsv(rgba.r, rgba.g, rgba.b);

                const hueX = (hsv.h / 360) * elements.hueSlider.width;
                elements.hueSliderMarker.style.left = `${hueX - markerHalfWidths.hue}px`;

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

                const x = hsv.s * (elements.colorCanvas.width - 1);
                const y = (1 - hsv.v) * (elements.colorCanvas.height - 1);
                const clampedX = Math.max(0, Math.min(x, elements.colorCanvas.width - 1));
                const clampedY = Math.max(0, Math.min(y, elements.colorCanvas.height - 1));
                elements.colorCanvasMarker.style.left = `${clampedX}px`;
                elements.colorCanvasMarker.style.top = `${clampedY}px`;

                const alphaX = (currentColor.a / 255) * elements.alphaSlider.width;
                elements.alphaSliderMarker.style.left = `${alphaX - markerHalfWidths.alpha}px`;

                elements.newColorPreview.style.backgroundColor = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a / 255})`;
                updateHexField();
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

        function loadSavedSwatches() {
            const savedSwatches = JSON.parse(localStorage.getItem('savedSwatches')) || [];

            for (let rgba of savedSwatches) {
                const swatch = document.createElement('div');
                swatch.classList.add('colorpicker-swatch-color');
                swatch.style.backgroundColor = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;

                elements.colorSwatchGrid.appendChild(swatch);
            }

            elements.colorSwatches = container.querySelectorAll('.colorpicker-swatch-color');
        }

        function quantizeToSteps(value, steps = 255) {
            return Math.round(value * steps) / steps;
        }

        function revertToOldColor() {
            const oldColorRgba = parseCssColorToRgba(elements.oldColorPreview.style.backgroundColor);

            currentColor.r = oldColorRgba.r;
            currentColor.g = oldColorRgba.g;
            currentColor.b = oldColorRgba.b;
            currentColor.a = oldColorRgba.a;
        }

        // --- Event Listeners ---
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

        elements.hexCodeField.addEventListener('blur', handleHexInputBlur);

        elements.showPicker.addEventListener('click', () => {
            if (elements.popup.classList.contains('active')) {
                elements.popup.classList.remove('active');
            }
            else {
                elements.oldColorPreview.style.backgroundColor = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a / 255})`;
                elements.popup.classList.add('active');
                const canvasMarkerX = parseFloat(elements.colorCanvasMarker.style.left) || 0;
                const canvasMarkerY = parseFloat(elements.colorCanvasMarker.style.top) || 0;
                updatePreviewColor(canvasMarkerX, canvasMarkerY);
            }
        });

        elements.addSwatchButton.addEventListener('click', () => {
            const rgba = {
                r: currentColor.r,
                g: currentColor.g,
                b: currentColor.b,
                a: currentColor.a / 255
            };

            const newSwatch = document.createElement('div');
            newSwatch.classList.add('colorpicker-swatch-color');
            newSwatch.style.backgroundColor = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;

            elements.colorSwatchGrid.appendChild(newSwatch);

            elements.colorSwatches = container.querySelectorAll('.colorpicker-swatch-color');

            swatchEventListenerUpdater();

            let savedSwatches = JSON.parse(localStorage.getItem('savedSwatches')) || [];
            savedSwatches.push(rgba);
            localStorage.setItem('savedSwatches', JSON.stringify(savedSwatches));
        });

        elements.removeSwatchButton.addEventListener('click', () => {
            for (let swatch of elements.colorSwatches) {
                if (swatch.classList.contains('selected') && !swatch.classList.contains('unremovable')) {
                    const style = getComputedStyle(swatch);
                    const bgColor = style.backgroundColor;

                    const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)?\)/);
                    if (match) {
                        const [, r, g, b, a] = match;
                        const targetColor = {
                            r: parseInt(r),
                            g: parseInt(g),
                            b: parseInt(b),
                            a: parseFloat(a || 1)
                        };

                        let savedSwatches = JSON.parse(localStorage.getItem('savedSwatches')) || [];

                        savedSwatches = savedSwatches.filter(swatch =>
                            !(swatch.r === targetColor.r &&
                                swatch.g === targetColor.g &&
                                swatch.b === targetColor.b &&
                                swatch.a === targetColor.a)
                        );

                        localStorage.setItem('savedSwatches', JSON.stringify(savedSwatches));
                    }

                    swatch.remove();
                    break;
                }
            }

            elements.colorSwatches = container.querySelectorAll('.colorpicker-swatch-color');
        });

        elements.okButton.addEventListener('click', () => {
            elements.preview.style.backgroundColor = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a / 255})`;
            elements.popup.classList.remove('active');
        });

        elements.cancelButton.addEventListener('click', () => {
            revertToOldColor();

            elements.popup.classList.remove('active');
        });

        // Close dropdown if clicking outside
        window.addEventListener('click', (event) => {
            if (elements.popup.classList.contains('active')) {
                if (!elements.popup.contains(event.target) && !elements.showPicker.contains(event.target)) {
                    revertToOldColor();
                    elements.popup.classList.remove('active');
                }
            }
        });

        // --- Color Conversion Functions ---
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
            r /= 255;
            g /= 255;
            b /= 255;

            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, v = max;
            const d = max - min;
            s = max === 0 ? 0 : d / max;

            if (max === min) {
                h = 0;
            }
            else {
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }
                h *= 60;
            }

            return { h, s, v };
        }

        function rgbaToHex({ r, g, b, a }) {
            const toHex = (n) => {
                // Ensure `n` is an integer and clamped to 0-255
                const clamped = Math.round(Math.min(255, Math.max(0, n)));
                return clamped.toString(16).padStart(2, '0').toUpperCase();
            };
            if (a !== 255) {
                return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
            }
            else {
                return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
            }
        }

        function hexToRgba(hex) {
            hex = hex.replace(/^#/, '');

            let r, g, b, a = 255;

            if (hex.length === 3 || hex.length === 4) {
                r = parseInt(hex[0] + hex[0], 16);
                g = parseInt(hex[1] + hex[1], 16);
                b = parseInt(hex[2] + hex[2], 16);
                if (hex.length === 4) {
                    a = parseInt(hex[3] + hex[3], 16);
                }
            }
            else if (hex.length === 6 || hex.length === 8) {
                r = parseInt(hex.substring(0, 2), 16);
                g = parseInt(hex.substring(2, 4), 16);
                b = parseInt(hex.substring(4, 6), 16);
                if (hex.length === 8) {
                    a = parseInt(hex.substring(6, 8), 16);
                }
            }
            else {
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


        // --- Initialization ---
        const x = colorCanvasRect.left;
        const clampedX = Math.max(0, Math.min(x, colorCanvasRect.width - 1));
        elements.colorCanvasMarker.style.left = `${clampedX}px`;
        elements.colorCanvasMarker.style.top = `${0}px`;

        elements.preview.style.backgroundColor = `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a / 255})`;

        updateColorCanvas();
        updateHueCanvas();
        updateAlphaCanvas();
        updatePreviewColor(clampedX, 0);
        updateHexField();
        loadSavedSwatches();
        swatchEventListenerUpdater();

        elements.popup.classList.remove('active');
    });
}
