// Observer for starting shorts animation when in view
const shortsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            startShortsVis();
            observer.unobserve(entry.target); // Triggers once
        }
    });
}, { threshold: 0.3 });

// Event Listener to swap Pause & Reset buttons
document.addEventListener('DOMContentLoaded', () => {
    const pauseButton = document.getElementById('pause-button');
    const resetButton = document.getElementById('reset-button');

    pauseButton.addEventListener('click', () => {
        pauseButton.classList.add('d-none'); 
        resetButton.classList.remove('d-none');
    });
    resetButton.addEventListener('click', () => {
        resetButton.classList.add('d-none'); 
        pauseButton.classList.remove('d-none');
    });
});




