const popupPort = {
    port: null,
    postMessage: (msg) => popupPort.port && popupPort.port.postMessage(msg),
};

export default popupPort;
