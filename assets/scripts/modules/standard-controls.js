import { button } from '../controls/button.js';
import { toggleButton } from '../controls/toggle-button.js';
import { radioButton } from '../controls/radio-button.js';
import { checkboxButton } from '../controls/checkbox-button.js';
import { dropdown } from '../controls/dropdown.js';
import { slider } from '../controls/slider.js';

export function initControls(callbacks = {}) {
    button(callbacks.onButtonClick);
    toggleButton(callbacks.onToggleButtonClick);
    radioButton(callbacks.onRadioButtonClick);
    checkboxButton(callbacks.onCheckboxButtonClick);
    dropdown(callbacks.onDropdownClick);
    slider(callbacks.onSliderMove);
}