export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class PaymentRequiredError extends AppError {
  constructor() {
    super('Active subscription required', 402, 'PAYMENT_REQUIRED')
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public fields?: Record<string, string[]>,
  ) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}
