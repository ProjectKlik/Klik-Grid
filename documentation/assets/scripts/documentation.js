import { initControls as standardInitControls } from "../../../assets/scripts/modules/standard-controls.js";
import { initControls as dataInitControls } from "../../../assets/scripts/modules/data-controls.js";

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
            if(button && value) {
                // Handle radio button click
                console.log(`Radio button ${button.nextElementSibling.textContent.trim()} with value of ${value} clicked!`);
            }
        },
        onCheckboxButtonClick: (button, value) => {
            if(button && value) {
                // Handle checkbox button click
                console.log(`Checkbox button ${button.textContent.trim()} with value of ${value} clicked!`);
            }
        },
        onDropdownClick: (button, value) => {
            if(button && value) {
                // Handle dropdown click
                console.log(`Dropdown ${button.textContent.trim()} clicked, selected option: ${value}`);
            }
        },
        onSliderMove: (title, value) => {
            if(title && value) {
                // Handle slider move
                console.log(`Slider ${title.textContent.trim()} moved, current value: ${value}`);
            }
        }
    });

    // Initialize data controls
    dataInitControls({
        onCodeSnippetClick: () => {

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
});
