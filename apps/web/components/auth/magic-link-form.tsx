'use client'

import { useState } from 'react'
import { requestMagicLink } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function MagicLinkForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError('')
    try {
      await requestMagicLink(email)
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-700">
        <p className="font-medium">Check your inbox</p>
        <p className="mt-1 text-emerald-600">
          We sent a sign-in link to <span className="font-medium">{email}</span>. It expires in 1
          hour.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@firm.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'sending'}
        />
      </div>
      {status === 'error' && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" variant="outline" className="w-full" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
      </Button>
    </form>
  )
}
