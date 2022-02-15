export class AuthError extends Error {
    message: string;
    /** account's id in the storage */
    id: string;
    /* invalidate refresh token */
    invalidateToken: boolean;

    constructor(message: string, id: string, invalidateToken?: boolean) {
        super();
        this.name = 'AuthError';
        this.message = message;
        this.id = id;
        this.invalidateToken = invalidateToken;
    }
}

export function isAuthError(e: unknown): e is AuthError {
    return (e as AuthError)?.name == 'AuthError';
}

export default { AuthError };
