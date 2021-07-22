export class AuthError extends Error {
    constructor(message: string) {
        super();
        this.name = 'AuthError';
        this.message = message;
    }
}

export default { AuthError };
