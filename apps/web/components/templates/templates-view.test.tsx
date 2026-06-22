import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TemplatesView } from './templates-view'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

vi.mock('@/lib/api', () => ({
  api: { post: vi.fn(), delete: vi.fn() },
}))

vi.mock('@/lib/use-toast', () => ({ toast: vi.fn() }))

import { api } from '@/lib/api'

const mockTemplates = [
  {
    id: 't1',
    name: 'Self Assessment Pack',
    items: [{ id: 'i1', label: 'P60', required: true, sortOrder: 0 }],
  },
  { id: 't2', name: 'Ltd Company Pack', items: [] },
]

describe('TemplatesView', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('shows empty state when no templates', () => {
    render(<TemplatesView initialTemplates={[]} />)
    expect(screen.getByText(/no templates yet/i)).toBeInTheDocument()
  })

  it('renders each template name', () => {
    render(<TemplatesView initialTemplates={mockTemplates} />)
    expect(screen.getByText('Self Assessment Pack')).toBeInTheDocument()
    expect(screen.getByText('Ltd Company Pack')).toBeInTheDocument()
  })

  it('shows item count for each template', () => {
    render(<TemplatesView initialTemplates={mockTemplates} />)
    expect(screen.getByText(/1 item/i)).toBeInTheDocument()
    expect(screen.getByText(/0 items/i)).toBeInTheDocument()
  })

  it('opens create dialog when New template button is clicked', () => {
    render(<TemplatesView initialTemplates={[]} />)
    fireEvent.click(screen.getAllByText(/new template/i)[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('creates a template and adds it to the list', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      id: 't3',
      name: 'New Pack',
      items: [{ id: 'i2', label: 'Bank statement', required: true, sortOrder: 0 }],
    })

    render(<TemplatesView initialTemplates={[]} />)
    fireEvent.click(screen.getAllByText(/new template/i)[0])

    fireEvent.change(screen.getByLabelText(/template name/i), { target: { value: 'New Pack' } })
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. P60/i), {
      target: { value: 'Bank statement' },
    })
    fireEvent.click(screen.getByText(/create template/i))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/templates',
        expect.objectContaining({ name: 'New Pack' }),
      )
      expect(screen.getByText('New Pack')).toBeInTheDocument()
    })
  })

  it('deletes a template after confirm', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce(undefined)
    vi.stubGlobal('confirm', () => true)

    render(<TemplatesView initialTemplates={mockTemplates} />)
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/templates/t1')
      expect(screen.queryByText('Self Assessment Pack')).not.toBeInTheDocument()
    })
  })
})
