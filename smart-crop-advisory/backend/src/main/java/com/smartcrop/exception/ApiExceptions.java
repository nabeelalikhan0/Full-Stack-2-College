package com.smartcrop.exception;

/** Small family of exceptions mapped to HTTP status codes by GlobalExceptionHandler. */
public final class ApiExceptions {
    private ApiExceptions() {}

    public static class NotFound extends RuntimeException {
        public NotFound(String message) { super(message); }
    }

    public static class BadRequest extends RuntimeException {
        public BadRequest(String message) { super(message); }
    }

    public static class Conflict extends RuntimeException {
        public Conflict(String message) { super(message); }
    }

    public static class Unauthorized extends RuntimeException {
        public Unauthorized(String message) { super(message); }
    }
}
