export type MessagesField = {
    count?: number;
    lastPostCreated?: number;
    lastUpdate?: number;
    messages?: [];
};

export type AuthData = {
    accessToken?: string;
    expiresIn?: number;
    refreshToken?: string;
};
