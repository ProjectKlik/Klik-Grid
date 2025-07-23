document.addEventListener('click', (event) => {
    if (event.target.matches('.sample-component-button')) {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

        // Find the closest parent with the class `.sample-component`
        const component = event.target.closest('.sample-component');
        if (component) {
            component.style.backgroundColor = randomColor;
        }
    }
});