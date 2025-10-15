"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("../utils/logger");
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        logger_1.logger.error(`AppError: ${err.message}`, {
            statusCode: err.statusCode,
            path: req.path,
            method: req.method,
            stack: err.stack
        });
        return res.status(err.statusCode).json({
            error: err.message,
            statusCode: err.statusCode
        });
    }
    // Unexpected errors
    logger_1.logger.error(`Unexpected Error: ${err.message}`, {
        path: req.path,
        method: req.method,
        stack: err.stack
    });
    return res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production'
            ? 'Something went wrong'
            : err.message
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map