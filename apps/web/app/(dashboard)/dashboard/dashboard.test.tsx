import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecentClientsTable } from './recent-clients-table'
import { OnboardingSteps } from './onboarding-steps'

const mockClients = [
  { id: 'c1', name: 'Alice Smith', email: 'alice@test.com', taxYear: '2024-25', status: 'in_progress', createdAt: new Date().toISOString() },
  { id: 'c2', name: 'Bob Jones', email: 'bob@test.com', taxYear: '2023-24', status: 'not_started', createdAt: new Date().toISOString() },
  { id: 'c3', name: 'Carol White', email: 'carol@test.com', taxYear: '2024-25', status: 'complete', createdAt: new Date().toISOString() },
]

describe('RecentClientsTable', () => {
  it('renders each client name', () => {
    render(<RecentClientsTable clients={mockClients} />)
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.getByText('Carol White')).toBeInTheDocument()
  })

  it('renders a View link for each client', () => {
    render(<RecentClientsTable clients={mockClients} />)
    const links = screen.getAllByRole('link', { name: /view/i })
    expect(links).toHaveLength(3)
    expect(links[0]).toHaveAttribute('href', '/clients/c1')
  })

  it('shows status badges', () => {
    render(<RecentClientsTable clients={mockClients} />)
    expect(screen.getByText('In progress')).toBeInTheDocument()
    expect(screen.getByText('Not started')).toBeInTheDocument()
    expect(screen.getByText('Complete')).toBeInTheDocument()
  })

  it('renders empty state message when no clients', () => {
    render(<RecentClientsTable clients={[]} />)
    expect(screen.getByText(/no clients yet/i)).toBeInTheDocument()
  })
})

describe('OnboardingSteps', () => {
  it('renders three steps', () => {
    render(<OnboardingSteps />)
    expect(screen.getByText(/create a client/i)).toBeInTheDocument()
    expect(screen.getByText(/apply a template/i)).toBeInTheDocument()
    expect(screen.getByText(/send the invite/i)).toBeInTheDocument()
  })

  it('has a link to create a client', () => {
    render(<OnboardingSteps />)
    const link = screen.getByRole('link', { name: /add your first client/i })
    expect(link).toHaveAttribute('href', '/clients')
  })
})
