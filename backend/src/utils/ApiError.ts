export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, message: string, code = "error", details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, message, "bad_request", details);
  }
  static unauthorized(message = "You must be signed in to do that.") {
    return new ApiError(401, message, "unauthorized");
  }
  static forbidden(message = "You do not have permission to do that.") {
    return new ApiError(403, message, "forbidden");
  }
  static notFound(message = "Not found.") {
    return new ApiError(404, message, "not_found");
  }
  static serviceUnavailable(message: string, code = "service_unavailable") {
    return new ApiError(503, message, code);
  }
}
