window.inject = (() => {
    const injectedFiles = new Set();

    const createStyleElement = (content, filePath) => {
        const style = document.createElement('style');
        style.textContent = content;
        style.setAttribute('data-injected-file', filePath);
        document.head.appendChild(style);
    };

    const createScriptElement = (content, filePath) => {
        const script = document.createElement('script');
        script.textContent = content;
        script.setAttribute('data-injected-file', filePath);
        document.head.appendChild(script);
    };

    const getTargetElements = (targetSelector) => {
        if (!targetSelector) return [document.body];

        // Try different selector methods
        const idElement = document.getElementById(targetSelector);
        if (idElement) return [idElement];

        const classElements = document.querySelectorAll(`.${targetSelector}`);
        if (classElements.length) return Array.from(classElements);

        const datasetElements = document.querySelectorAll(`[data-${targetSelector}]`);
        if (datasetElements.length) return Array.from(datasetElements);

        const genericElement = document.querySelector(targetSelector);
        if (genericElement) return [genericElement];

        return [];
    };

    return function (filePath, targetSelector = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${filePath}: ${response.status}`);
                }

                const fileExtension = filePath.split('.').pop().toLowerCase();
                const content = await response.text();

                if (injectedFiles.has(filePath)) {
                    console.warn(`File already injected: ${filePath}`);
                    return;
                }

                switch (fileExtension) {
                    case 'css':
                        createStyleElement(content, filePath);
                        injectedFiles.add(filePath);
                        resolve();
                        break;

                    case 'js':
                        createScriptElement(content, filePath);
                        injectedFiles.add(filePath);
                        resolve();
                        break;

                    case 'html':
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(content, 'text/html');
                        const targetElements = getTargetElements(targetSelector);

                        if (targetElements.length === 0) {
                            throw new Error(`Target element not found: ${targetSelector}`);
                        }

                        const bodyContent = doc.body.innerHTML;
                        targetElements.forEach(element => {
                            element.insertAdjacentHTML('beforeend', bodyContent);
                        });
                        resolve();
                        break;

                    default:
                        throw new Error(`Unsupported file type: ${fileExtension}`);
                }
            } catch (error) {
                console.error('Injection failed:', error);
                reject(error);
            }
        })
    };
})();