const requestIdleCallback = jest.fn();
window.requestIdleCallback = requestIdleCallback;

export default requestIdleCallback;
