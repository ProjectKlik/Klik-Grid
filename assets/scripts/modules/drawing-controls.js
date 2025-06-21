import { colorPicker } from "../controls/color-picker.js";

export function initControls(callbacks = {}) {
    colorPicker(callbacks.onColorPickerAction);
}