import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  PaymentRequiredError,
  ValidationError,
} from './AppError'

describe('AppError classes', () => {
  it('NotFoundError has correct status and code', () => {
    const err = new NotFoundError('Client')
    expect(err.statusCode).toBe(404)
    expect(err.code).toBe('NOT_FOUND')
    expect(err.message).toBe('Client not found')
  })

  it('UnauthorizedError has correct status and code', () => {
    const err = new UnauthorizedError()
    expect(err.statusCode).toBe(401)
    expect(err.code).toBe('UNAUTHORIZED')
  })

  it('ForbiddenError has correct status and code', () => {
    const err = new ForbiddenError()
    expect(err.statusCode).toBe(403)
    expect(err.code).toBe('FORBIDDEN')
  })

  it('PaymentRequiredError has correct status and code', () => {
    const err = new PaymentRequiredError()
    expect(err.statusCode).toBe(402)
    expect(err.code).toBe('PAYMENT_REQUIRED')
  })

  it('ValidationError has correct status and code', () => {
    const err = new ValidationError('Bad input', { name: ['too short'] })
    expect(err.statusCode).toBe(400)
    expect(err.code).toBe('VALIDATION_ERROR')
    expect(err.fields).toEqual({ name: ['too short'] })
  })

  it('AppError is instanceof Error', () => {
    const err = new AppError('test', 500, 'SERVER_ERROR')
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('AppError')
  })
})
