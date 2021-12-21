export class AuthError extends Error {
    message: string;
    id: string;

    constructor(message: string, id: string) {
        super();
        this.name = 'AuthError';
        this.message = message;
        this.id = id;
    }
}

export function isAuthError(e: unknown): e is AuthError {
    return (e as AuthError)?.name == 'AuthError';
}

export default { AuthError };
