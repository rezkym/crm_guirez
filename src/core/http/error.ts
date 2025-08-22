import { HTTP_STATUS } from "./httpStatus";

export class HttpError extends Error {
    constructor(
        public readonly statusCode: number,
        message: string,
        public readonly details?: unknown,
        public readonly isOperational = true
    ) {
        super(message);
        this.name = "HttpError";
        Error.captureStackTrace?.(this, this.constructor);
    }
}

export class BadRequestError extends HttpError {
    constructor(m = "Bad Request", d?: unknown) {
        super(HTTP_STATUS.BAD_REQUEST, m, d);
    }
}
export class UnauthorizedError extends HttpError {
    constructor(m = "Unauthorized", d?: unknown) {
        super(HTTP_STATUS.UNAUTHORIZED, m, d);
    }
}
export class ForbiddenError extends HttpError {
    constructor(m = "Forbidden", d?: unknown) {
        super(HTTP_STATUS.FORBIDDEN, m, d);
    }
}
export class NotFoundError extends HttpError {
    constructor(m = "Not Found", d?: unknown) {
        super(HTTP_STATUS.NOT_FOUND, m, d);
    }
}
export class ConflictError extends HttpError {
    constructor(m = "Conflict", d?: unknown) {
        super(HTTP_STATUS.CONFLICT, m, d);
    }
}
export class UnprocessableEntityError extends HttpError {
    constructor(m = "Unprocessable Entity", d?: unknown) {
        super(HTTP_STATUS.UNPROCESSABLE_ENTITY, m, d);
    }
}
export class InternalServerError extends HttpError {
    constructor(m = "Internal Server Error", d?: unknown) {
        super(HTTP_STATUS.INTERNAL_SERVER_ERROR, m, d, false);
    }
}