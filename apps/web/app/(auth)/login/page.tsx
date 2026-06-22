import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { loginUrl } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagicLinkForm } from '@/components/auth/magic-link-form'

async function isAuthenticated(): Promise<boolean> {
  const token = cookies().get('token')?.value
  if (!token) return false
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/auth/me`,
      { headers: { Cookie: `token=${token}` }, cache: 'no-store' },
    )
    return res.ok
  } catch {
    return false
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  if (await isAuthenticated()) redirect('/dashboard')

  const errorMessage =
    searchParams.error === 'invalid_link'
      ? 'That sign-in link is invalid or has expired. Request a new one below.'
      : searchParams.error === 'missing_token'
        ? 'Something went wrong during sign-in. Please try again.'
        : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-2">
          <div className="text-3xl font-bold text-primary mb-1">DocVault</div>
          <CardTitle className="text-base font-normal text-muted-foreground">
            Sign in or create your account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {errorMessage && (
            <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center">
              Continue with
            </p>

            <Button asChild variant="outline" className="w-full h-11 gap-2.5" size="lg">
              <a href={loginUrl()}>
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </a>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <MagicLinkForm />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
