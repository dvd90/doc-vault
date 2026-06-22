import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ClientsView } from './clients-view'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/lib/use-toast', () => ({
  toast: vi.fn(),
}))

import { api } from '@/lib/api'

describe('ClientsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /clients/:id after creating a client', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      id: 'client-123',
      name: 'Alice',
      email: 'alice@test.com',
      taxYear: '2024-25',
      status: 'not_started',
      createdAt: new Date().toISOString(),
    })

    render(<ClientsView initialClients={[]} />)

    fireEvent.click(screen.getAllByText('Add client')[0])

    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Alice' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alice@test.com' } })
    fireEvent.change(screen.getByLabelText('Tax year'), { target: { value: '2024-25' } })

    fireEvent.click(screen.getByText('Create client'))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/clients/client-123')
    })
  })

  it('shows existing clients in the list', () => {
    const clients = [
      {
        id: 'c1',
        name: 'Bob Jones',
        email: 'bob@test.com',
        taxYear: '2024-25',
        status: 'in_progress',
        createdAt: new Date().toISOString(),
      },
    ]
    render(<ClientsView initialClients={clients} />)
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
  })
})
