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

            try {
                // Copy the code to clipboard
                await navigator.clipboard.writeText(codeBlock.textContent);
            }
            catch {
                // Fallback for unsupported browsers
                const textarea = document.createElement('textarea');
                textarea.value = codeBlock.textContent;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                
                document.body.appendChild(textarea);

                textarea.focus();
                textarea.select();

                document.execCommand('copy');
                
                document.body.removeChild(textarea);
            }

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
