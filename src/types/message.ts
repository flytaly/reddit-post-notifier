export type PortMessageId =
    | 'UPDATE_NOW' //
    | 'SCHEDULE_NEXT_UPDATE'
    | 'UPDATING_START'
    | 'UPDATING_END';

export type PortMessagePayload = unknown | null;

export type PortMessage = {
    id: PortMessageId;
    payload?: PortMessagePayload;
};
