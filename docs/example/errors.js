export class IllegalArgumentsError extends Error {
    constructor(message = "", ...args) {
        super(message, ...args);
        this.message = message;
    }
}

export class ValueError extends Error {
    constructor(message = "", ...args) {
        super(message, ...args);
        this.message = message;
    }
}
