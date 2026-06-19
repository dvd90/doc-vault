declare global {
  namespace Express {
    interface User {
      userId: string
      firmId: string
    }
  }
}
export {}
