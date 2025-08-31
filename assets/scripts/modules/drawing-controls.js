import { colorPicker } from "../controls/color-picker.js";
import { curveEditor } from "../controls/curve-editor.js";

export function drawingInitControls(callbacks = {}) {
    colorPicker(callbacks.onColorPickerAction);
    curveEditor(callbacks.onCurveEditorAction);
}