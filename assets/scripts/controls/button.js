let globalCallbacks;

/* Initialization */
export function button(callback) {
  globalCallbacks = callback;
  scanButton();
}

export function scanButton() {
  document.querySelectorAll('.button-group').forEach(group => {
    group.querySelectorAll('button:not([data-initialized])').forEach(button => {
      // Mark as initialized to prevent duplicate handlers
      button.dataset.initialized = 'true';

      button.addEventListener('click', () => {
        // Pass both the button element and its data-button-value to callback
        globalCallbacks?.(button, button.dataset.buttonValue);
      });
    });
  });
}

/* Programmatical Creation */
function createButton(label, value, parentSelector, className, variant, orientation, iconHTML, iconPosition) {
  // Spawn the button in the specified parent
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

  const createdButtons = [];

  targets.forEach(target => {
    let group;

    // Use existing group or create a new one
    if (!parentSelector) {
      group = document.createElement('div');
      group.className = `button-group`;
      target.appendChild(group);
    }
    else {
      if (target.classList.contains('button-group')) {
        group = target;
      }
      else {
        group = document.createElement('div');
        group.className = `button-group`;
        target.appendChild(group);
      }
    }

    const btn = document.createElement('button');

    // Add icon if provided
    if (iconHTML) {
      if (iconPosition === 'after') {
        btn.innerHTML = `${label || ''}${iconHTML}`;
      }
      else {
        btn.innerHTML = `${iconHTML}${label || ''}`;
      }
    }
    else {
      if (label) btn.textContent = label;
    }

    if (value) btn.dataset.buttonValue = value;
    if (className) className.split(' ').forEach(c => group.classList.add(c));
	if (variant) variant.split(' ').forEach(c => btn.classList.add(c));
    if (orientation) group.classList.add(orientation);

    group.appendChild(btn);
    createdButtons.push(btn);
  });

  // Rescan to initialize new button(s)
  scanButton();

  return isClass ? createdButtons : createdButtons[0];
}

// Expose globally
window.createButton = createButton;