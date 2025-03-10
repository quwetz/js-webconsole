export class IllegalArgumentsError extends Error {
  constructor(message = "", ...args) {
    super(message, ...args);
    this.message = message;
  }
}
