class ValidationError extends Error {
    constructor(message, code) {
        super(message);
        this.code = parseInt(code)
        this.name = "ValidationError";
    }
}

module.exports = ValidationError