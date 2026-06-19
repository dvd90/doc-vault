import { vi } from 'vitest'
vi.mock('../services/reminder.service', () => ({
  ReminderService: { sendPendingReminders: vi.fn().mockResolvedValue(3) },
}))
import { api } from '../test/helpers'

describe('POST /internal/reminders/send', () => {
  it('returns 401 without cron secret header', async () => {
    expect((await api.post('/internal/reminders/send')).status).toBe(401)
  })
  it('returns 401 with wrong secret', async () => {
    expect((await api.post('/internal/reminders/send').set('x-cron-secret', 'wrong')).status).toBe(401)
  })
  it('returns 200 with count when secret is correct', async () => {
    process.env.CRON_SECRET = 'test-cron-secret'
    const res = await api.post('/internal/reminders/send').set('x-cron-secret', 'test-cron-secret')
    expect(res.status).toBe(200)
    expect(res.body.sent).toBe(3)
  })
})
