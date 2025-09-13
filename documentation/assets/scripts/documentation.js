import { standardInitControls } from "../../../assets/scripts/modules/standard-controls.js";
import { dataInitControls } from "../../../assets/scripts/modules/data-controls.js";
import { drawingInitControls } from "../../../assets/scripts/modules/drawing-controls.js";

document.addEventListener('DOMContentLoaded', () => {
    standardInitControls({
        onButtonClick: (button, value) => {
            if (!button || !value) return;

            // Handle button click
            switch (value) {
                // Simple log cases
                case 'Sample':
                case 'Info':
                case 'Warning':
                case 'Error':
                case 'Success':
                case 'Filled Icon':
                case 'Outline Icon':
                    console.log(`Button ${button.textContent.trim()} with value of ${value} clicked`);
                    break;

                case 'Variable Grabber Sample':
                    button.textContent = window.getVariable('--ok');
                    break;

                // Message Box
                case 'Sample Message Box':
                    document.getElementById('dialog-overlay').style.display = 'block';

                    window.showMessageBox(
                        'Sample Message Box Title',
                        'Sample Message Box Description',
                        [
                            { text: window.getVariable('--yes'), buttonValue: 'Yes MSGBOX Button' },
                            { text: window.getVariable('--no'), buttonValue: 'No MSGBOX Button' }
                        ],
                        (_, value) => {
                            if (value === 'Yes MSGBOX Button') {
                                console.log('User Confirmed');
                            }
                            else {
                                console.log('User Declined')
                            }
                        });
                    break;

                // Notifications
                case 'Sample Info Notification':
                    window.showNotification('info', 'Info', 'Sample Info Notification');
                    break;

                case 'Sample Error Notification':
                    window.showNotification('error', 'Error', 'Sample Error Notification');
                    break;

                case 'Sample Warning Notification':
                    window.showNotification('warning', 'Warning', 'Sample Warning Notification');
                    break;

                case 'Sample Success Notification':
                    window.showNotification('success', 'Success', 'Sample Success Notification');
                    break;

                case 'Sample Special Notification':
                    window.showNotification('special', 'Special', 'Sample Special Notification');
                    break;

                // History Actions
                case 'Sample Undo Action':
                    window.actionHistory.undo();
                    break;
                case 'Sample Redo Action':
                    window.actionHistory.redo();
                    break;
                case 'Sample Add Action':
                    const svgIcon = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12h14" stroke="white" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        `;
                    window.actionHistory.addAction(svgIcon, 'Sample Action');
                    break;
                case 'Sample Clear Actions':
                    window.actionHistory.clear();
                    break;

                // Injection Cases
                case 'Sample Inject HTML':
                    window.inject("./assets/components/html/sample-component.html", "injector-sample-container");
                    break;
                case 'Sample Inject CSS':
                    window.inject("./assets/components/css/sample-component.css");
                    break;
                case 'Sample Inject JS':
                    window.inject("./assets/components/js/sample-component.js");
                    break;

                // Default
                default:
                    console.log(`Unknown button "${button.textContent.trim()}" with value of "${value}" clicked`);
                    break;
            }
        },
        onToggleButtonClick: (button, value) => {
            if (!button || !value) return;
            // Get the closest parent group
            const group = button.closest('.toggle-button-group');

            const languageHandlers = {
                en_us: () => {
                    document.documentElement.setAttribute('lang', 'en-US');
                },
                ru_ru: () => {
                    document.documentElement.setAttribute('lang', 'ru-RU');
                },
                az_az: () => {
                    document.documentElement.setAttribute('lang', 'az-AZ');
                }
            };

            const themeHandlers = {
                dark: () => {
                    document.documentElement.setAttribute('theme', 'dark');
                },
                gray: () => {
                    document.documentElement.setAttribute('theme', 'gray');
                }
            };

            switch (true) {
                case group.classList.contains('page-switcher'):
                    // Handle page switching
                    document.querySelectorAll('.page').forEach(div => {
                        const shouldShow = div.id === value;
                        div.classList.toggle('shown', shouldShow);
                    });
                    break;

                case group.classList.contains('sample-toggle-button'):
                    // Handle sample popup
                    console.log(`Toggle Button ${button.textContent.trim()} with value of ${value} clicked!`);
                    break;

                case group.classList.contains('language-switcher'):
                    // Handle language switching
                    if (languageHandlers[value]) {
                        languageHandlers[value]();
                    } else {
                        console.log('Unknown language selected:', value);
                    }
                    break;

                case group.classList.contains('theme-switcher'):
                    // Handle theme switching
                    if (themeHandlers[value]) {
                        themeHandlers[value]();
                    } else {
                        console.log('Unknown theme selected:', value);
                    }
                    break;

                default:
                    // No group found, handle accordingly
                    console.log('Failed to find toggle button group :(');
                    break;
            }
        },
        onRadioButtonClick: (button, value) => {
            if (!button || !value) return;
            // Handle radio button click
            console.log(`Radio button ${button.nextElementSibling.textContent.trim()} with value of ${value} clicked!`);
        },
        onCheckboxButtonClick: (button, label, value, isChecked) => {
            if (!button || !value) return;
            // Handle checkbox button click
            console.log(`Checkbox button ${label} with value of ${value} clicked, current state: ${isChecked}`);
        },
        onDropdownClick: (button, buttonValue, value) => {
            if (!button || !value) return;
            // Handle dropdown click
            console.log(`Dropdown ${buttonValue} clicked, selected option: ${value}`);
        },
        onSliderMove: (title, value) => {
            if (!title || !value) return;
            // Handle slider move
            console.log(`Slider ${title.textContent.trim()} moved, current value: ${value}`);
        },
        onTextInput: (input, text, value) => {
            if (!input || !value) return;
            // Handle text input
            console.log(`Text input ${input.placeholder} changed to ${text}`);
        },
        onTabClick: (tab, value) => {
            if (!tab || !value) return;
            // Handle tab click
            console.log(`Tab ${tab} clicked, value: ${value}`);
        },
        onSeparatorDrag: (container, dragbar) => {
            if (!container || !dragbar) return;
            // Handle separator move
            console.log(`Container ${container}'s dragbar moved with value of: ${dragbar}`);
        },
        onSocketDrag: (socket, socketItem) => {
            if (!socket || !socketItem) return;
            // Handle socket item drag
            console.log(`The socket ${socket}'s item is now ${socketItem}`);
        },
        onCollapsibleClick: (container, state) => {
            if (!container) return;
            console.log(`The collapsible menu ${container}'s state is now ${state}`);
        },
        onContextMenuClick: (container, ctxMenuValue, value) => {
            if (!container || !value) return;
            // Handle dropdown click
            console.log(`Context Menu ${ctxMenuValue} clicked, selected option: ${value}`);
        },
        onMessageBoxButtonClick: (button, value) => {
            if (!button || !value) return;
            console.log(`Message Box button ${button} clicked, value: ${value}`);
            document.getElementById('dialog-overlay').style.display = 'none';
        },
        onNotificationClose: (id, type, title, message) => {
            if (!id) return;
            console.log(`Notification with id of ${id} was closed`);
        }
    });

    // Initialize data controls
    dataInitControls({
        onCodeSnippetClick: (success) => {
            if (success) {
                console.log(`Code was copied to clipboard!`);
            }
        }
    });

    // Initialize drawing controls
    drawingInitControls({
        onColorPickerAction: (r, g, b, showPickerButton) => {
            if (!showPickerButton) return;
            // Handle color picker action
            console.log(`Color Picker ${showPickerButton}'s color is R = ${r}, G = ${g}, B = ${b}`);
        },
        onCurveEditorAction: (value, showEditorButton) => {
            if (!showEditorButton) return;
            // Handle curve editor action
            console.log(`Curve Editor ${showEditorButton}'s curve is ${value}`);
        }
    });

    // Change background color of the div based on span text content
    const colorShowcasers = document.querySelectorAll('.color-showcaser');

    colorShowcasers.forEach(showcaser => {
        const span = showcaser.querySelector('span');
        const div = showcaser.querySelector('div');

        const color = span.textContent.trim();
        div.style.backgroundColor = `var(${color})`;
    });

    // Load the neccesary page only and remove the loading screen
    document.querySelectorAll('.page').forEach(div => {
        div.classList.remove('shown');
    });

    document.getElementById('loading-screen').remove();
    document.querySelector('.page').classList.add('shown');
});
