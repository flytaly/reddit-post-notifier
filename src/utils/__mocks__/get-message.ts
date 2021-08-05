import messages from '../../../extension/_locales/en/messages.json';

type LocaleMessage = keyof typeof messages;

const getMsg = (msg: LocaleMessage): string => messages[msg].message;

export default getMsg;
