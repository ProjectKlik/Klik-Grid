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
                        (button, value) => {
                            if (value === 'Yes MSGBOX Button') {
                                console.log('User Confirmed');
                            }
                            else {
                                console.log('User Declined')
                            }
                        });
                    break;

                // Drilldown Menu
                case 'Sample Drilldown Menu':
                    const cube = `
                        <svg class="outline-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 16.008v-8.018a1.98 1.98 0 0 0 -1 -1.717l-7 -4.008a2.016 2.016 0 0 0 -2 0l-7 4.008c-.619 .355 -1 1.01 -1 1.718v8.018c0 .709 .381 1.363 1 1.717l7 4.008a2.016 2.016 0 0 0 2 0l7 -4.008c.619 -.355 1 -1.01 1 -1.718z"/>
                            <path d="M12 22v-10"/>
                            <path d="M12 12l8.73 -5.04"/>
                            <path d="M3.27 6.96l8.73 5.04"/>
                        </svg>
                    `;

                    const stackFront = `
                        <svg class="outline-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4l-8 4l8 4l8 -4l-8 -4" fill="currentColor"/>
                            <path d="M8 14l-4 2l8 4l8 -4l-4 -2"/>
                            <path d="M8 10l-4 2l8 4l8 -4l-4 -2"/>
                        </svg>
                    `;

                    const stackMiddle = `
                        <svg class="outline-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 10l4 -2l-8 -4l-8 4l4 2"/>
                            <path d="M12 12l-4 -2l-4 2l8 4l8 -4l-4 -2l-4 2z" fill="currentColor"/>
                            <path d="M8 14l-4 2l8 4l8 -4l-4 -2"/>
                        </svg>
                    `;

                    const stackBack = `
                        <svg class="outline-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 8l8 4l8 -4l-8 -4z"/>
                            <path d="M12 16l-4 -2l-4 2l8 4l8 -4l-4 -2l-4 2z" fill="currentColor"/>
                            <path d="M8 10l-4 2l4 2m8 0l4 -2l-4 -2"/>
                        </svg>
                    `;

                    document.getElementById('dialog-overlay').style.display = 'block';

                    window.showDrilldownMenu(
                        "Sample Drilldown",
                        [
                            { text: "Sample Item 1", buttonValue: "item_button_sample_item_layer_1", icon: cube },
                            {
                                text: "Sample Category 1",
                                buttonValue: "page_button_sample_category_layer_1",
                                icon: stackFront,
                                items: [
                                    { text: "Sample Item 2", buttonValue: "item_button_sample_item_layer_2", icon: cube },
                                    {
                                        text: "Sample Category 2",
                                        buttonValue: "page_button_sample_category_layer_2",
                                        icon: stackMiddle,
                                        items: [
                                            { text: "Sample Item 3", buttonValue: "item_button_sample_item_layer_3", icon: cube },
                                            {
                                                text: "Sample Category 3",
                                                buttonValue: "page_button_sample_category_layer_3",
                                                icon: stackBack,
                                                items: [
                                                    { text: "Sample Item 4", buttonValue: "item_button_sample_item_layer_4", icon: cube },
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ],
                        (button, value) => {
                            switch (value) {
                                case 'item_button_sample_item_layer_1':
                                case 'item_button_sample_item_layer_2':
                                case 'item_button_sample_item_layer_3':
                                case 'item_button_sample_item_layer_4':
                                    document.querySelector('.drilldown-container').remove();
                                    document.getElementById('dialog-overlay').style.display = 'none';
                                    break;
                            }
                        }
                    );
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
        onDrilldownMenuButtonClick: (button, value) => {
            if (!button || !value) return;
            console.log(`Drilldown Menu button ${button} clicked, value: ${value}`);

            switch (value) {
                case 'close':
                    document.getElementById('dialog-overlay').style.display = 'none';
                    break;
            }
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
