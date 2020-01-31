/* eslint-disable import/prefer-default-export */

export class AuthError extends Error {
    constructor(message) {
        super();
        this.name = 'AuthError';
        this.message = message;
    }
}

export default { AuthError };
