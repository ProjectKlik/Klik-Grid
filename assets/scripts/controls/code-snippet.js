export function codeSnippet(callback) {
    document.querySelectorAll('.code-container').forEach(container => {
        const button = container.querySelector('.code-header button');
        const codeBlock = container.querySelector('code');
        const filePath = codeBlock.getAttribute('content');

        if (filePath) {
            (async () => {
                try {
                    const res = await fetch(filePath);
                    if (!res.ok) throw new Error('File is missing or file path is incorrect');
                    const text = await res.text();
                    codeBlock.textContent = text;
                } catch (err) {
                    codeBlock.textContent = 'Error fetching code snippet. Cause: ' + err.message + '\n\nFile path: ' + filePath;
                }
            })();
        }

        button.addEventListener('click', async () => {
            // Store the original text of the button
            const originalText = button.innerText;

            // Copy the code to clipboard
            navigator.clipboard.writeText(codeBlock.textContent);

            // Change the button text to "Copied!"
            button.innerText = 'Copied!';

            // Reset the button text after 2 seconds
            setTimeout(() => {
                button.innerText = originalText;
            }, 2000);
            
            // Call callback if provided and pass the button and value
            if (callback) callback(true);
        });
    });
}
