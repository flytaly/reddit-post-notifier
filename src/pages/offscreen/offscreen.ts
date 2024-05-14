interface Message {
    type: string;
    data: string;
    target: string;
}

async function handleMessages(message: Message) {
    if (message.target !== 'offscreen')
        return false;

    switch (message.type) {
        case 'PLAY_AUDIO':
            {
                const audio = new Audio();
                audio.src = message.data;
                await audio.play();
            }
            break;
        default:
            console.warn(`Unexpected message type received: '${message.type}'.`);
            return false;
    }
}

export function sendToBackground(type: unknown, data: unknown) {
    void chrome.runtime.sendMessage({ type, target: 'background', data });
}

chrome.runtime.onMessage.addListener((msg: Message) => void handleMessages(msg));

export default {};
