
export default function debounce(callback, wait) {
    let timerId;

    return function (...args) {
        clearTimeout(timerId);
    
        timerId = setTimeout(() => {
            callback(...args);
        }, wait);
    };
}