import type { PostGroup } from '@/utils/post-group';

export type PortMessageId =
    | 'UPDATE_NOW' //
    | 'SCHEDULE_NEXT_UPDATE'
    | 'UPDATING_START'
    | 'UPDATING_END'
    | 'OPEN_GROUPS'
    | 'RATE_LIMITS';

export type OpenGroupsPayload = { groups: PostGroup[]; remove: boolean };
export type PortMessagePayload = unknown | null | OpenGroupsPayload;

export type PortMessage = {
    id: PortMessageId;
    payload?: PortMessagePayload;
};
