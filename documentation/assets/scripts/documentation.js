import { initControls as standardInitControls } from "../../../assets/scripts/modules/standard-controls.js";
import { initControls as dataInitControls } from "../../../assets/scripts/modules/data-controls.js";
import { initControls as drawingInitControls } from "../../../assets/scripts/modules/drawing-controls.js";

document.addEventListener('DOMContentLoaded', () => {
    standardInitControls({
        onButtonClick: (button, value) => {
            if (button && value) {

                // Handle button click
                switch (true) {
                    case value === 'Sample':
                        console.log(`Button ${button.textContent.trim()} with value of ${value} clicked`);
                        break;

                    case value === 'Info':
                        console.log(`Button ${button.textContent.trim()} with value of ${value} clicked`);
                        break;

                    case value === 'Warning':
                        console.log(`Button ${button.textContent.trim()} with value of ${value} clicked`);
                        break;

                    case value === 'Error':
                        console.log(`Button ${button.textContent.trim()} with value of ${value} clicked`);
                        break;

                    case value === 'Success':
                        console.log(`Button ${button.textContent.trim()} with value of ${value} clicked`);
                        break;
                    case value === 'Sample Message Box':
                        document.getElementById('dialog-overlay').style.display = 'block';

                        window.showMessageBox(
                            'Sample Message Box Title',
                            'Sample Message Box Description',
                            [
                                { text: 'Yes', buttonValue: 'Yes MSGBOX Button' },
                                { text: 'No', buttonValue: 'No MSGBOX Button' }
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
                    case value === 'Sample Info Notification':
                        window.showNotification('info', 'Info', 'Sample Info Notification');
                        break;

                    case value === 'Sample Error Notification':
                        window.showNotification('error', 'Error', 'Sample Error Notification');
                        break;

                    case value === 'Sample Warning Notification':
                        window.showNotification('warning', 'Warning', 'Sample Warning Notification');
                        break;

                    case value === 'Sample Success Notification':
                        window.showNotification('success', 'Success', 'Sample Success Notification');
                        break;

                    case value === 'Sample Special Notification':
                        window.showNotification('special', 'Special', 'Sample Special Notification');
                        break;

                    default:
                        console.log(`Button ${button.textContent.trim()} has value not listed in switch statement`);
                        break;
                }
            }
        },
        onToggleButtonClick: (button, value) => {
            if (button && value) {
                // Get the closest parent group
                const group = button.closest('.toggle-button-group');

                switch (true) {
                    case group.classList.contains('page-switcher'):
                        // Handle page switching
                        document.querySelectorAll('.page').forEach(div => {
                            const shouldShow = div.id === value;
                            div.classList.toggle('shown', shouldShow);
                        });
                        break;

                    case group.classList.contains('sample-popup'):
                        // Handle sample popup
                        console.log(`Toggle Button ${button.textContent.trim()} with value of ${value} clicked!`);
                        break;

                    default:
                        // No group found, handle accordingly
                        console.log('Failed to find toggle button group :(');
                        break;
                }
            }
        },
        onRadioButtonClick: (button, value) => {
            if (button && value) {
                // Handle radio button click
                console.log(`Radio button ${button.nextElementSibling.textContent.trim()} with value of ${value} clicked!`);
            }
        },
        onCheckboxButtonClick: (button, value) => {
            if (button && value) {
                // Handle checkbox button click
                console.log(`Checkbox button ${button.textContent.trim()} with value of ${value} clicked!`);
            }
        },
        onDropdownClick: (button, value) => {
            if (button && value) {
                // Handle dropdown click
                console.log(`Dropdown ${button.textContent.trim()} clicked, selected option: ${value}`);
            }
        },
        onSliderMove: (title, value) => {
            if (title && value) {
                // Handle slider move
                console.log(`Slider ${title.textContent.trim()} moved, current value: ${value}`);
            }
        },
        onTextInput: (input, value) => {
            if (input) {
                // Handle text input
                console.log(`Text input ${input.placeholder} changed to ${value}`);
            }
        },
        onTabClick: (tab, value) => {
            if (tab, value) {
                // Handle tab click
                console.log(`Tab ${tab} clicked, value: ${value}`);
            }
        },
        onSeparatorDrag: (container, dragbar) => {
            if (container && dragbar) {
                // Handle separator move
                console.log(`Container ${container}'s dragbar moved with value of: ${dragbar}`);
            }
        },
        onSocketDrag: (socket, socketItem) => {
            if (socket && socketItem) {
                // Handle socket item drag
                console.log(`The socket ${socket}'s item is now ${socketItem}`);
            }
        },
        onMessageBoxButtonClick: (button, value) => {
            if (button && value) {
                console.log(`Message Box button ${button} clicked, value: ${value}`);
                document.getElementById('dialog-overlay').style.display = 'none';
            }
        }
    });

    // Initialize data controls
    dataInitControls({
        onCodeSnippetClick: () => {

        }
    });

    // Initialize drawing controls
    drawingInitControls({
        onColorPickerAction: (r, g, b, showPickerButton) => {
            if (showPickerButton) {
                // Handle color picker action
                console.log(`Color Picker ${showPickerButton}'s color is R = ${r}, G = ${g}, B = ${b}`);
            }
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
