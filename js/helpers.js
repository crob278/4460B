// Observer for starting shorts animation when in view
const options = { threshold: 0.3 };
const shortStart = (element, observer) => {
    let vis = element[0]; // Should only be 1 element
    if (vis.isIntersecting) {
        startShortsVis();
        observer.unobserve(vis.target);
    }
}
const shortsObserver = new IntersectionObserver(shortStart, options);

// Replace element 1 with element 2 (must already exist and 2 need d-none as a class)
const elementSwap = (e1, e2) => {
    e1.classList.add('d-none');
    e2.classList.remove('d-none');
}

// Event listener on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    let pauseBtn = document.getElementById('pause-button');
    let resetBtn = document.getElementById('reset-button');

    pauseBtn.addEventListener('click', () => {elementSwap(pauseBtn, resetBtn)});
    resetBtn.addEventListener('click', () => {elementSwap(resetBtn, pauseBtn)});
});




