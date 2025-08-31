import { button } from '../controls/button.js';
import { toggleButton } from '../controls/toggle-button.js';
import { radioButton } from '../controls/radio-button.js';
import { checkboxButton } from '../controls/checkbox-button.js';
import { dropdown } from '../controls/dropdown.js';
import { slider } from '../controls/slider.js';
import { textInput } from '../controls/text-input.js';
import { tab } from '../controls/tab.js';
import { separator } from '../controls/separator.js';
import { socket } from '../controls/socket.js';
import { collapsibleMenu } from '../controls/collapsible-menu.js';
import { contextMenu } from '../controls/context-menu.js';
import { messageBox } from '../controls/message-box.js';
import { notification } from '../controls/notification.js';

export function standardInitControls(callbacks = {}) {
    button(callbacks.onButtonClick);
    toggleButton(callbacks.onToggleButtonClick);
    radioButton(callbacks.onRadioButtonClick);
    checkboxButton(callbacks.onCheckboxButtonClick);
    dropdown(callbacks.onDropdownClick);
    slider(callbacks.onSliderMove);
    textInput(callbacks.onTextInput);
    tab(callbacks.onTabClick);
    separator(callbacks.onSeparatorDrag);
    socket(callbacks.onSocketDrag);
    collapsibleMenu(callbacks.onCollapsibleClick);
    contextMenu(callbacks.onContextMenuClick);
    messageBox(callbacks.onMessageBoxButtonClick);
    notification(callbacks.onNotificationClose);
}