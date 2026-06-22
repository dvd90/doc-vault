import { test, expect } from '@playwright/test'

test('creating a client redirects to the client detail page', async ({ page }) => {
  const res = await page.request.post('http://localhost:4000/test/seed-user')
  const { token } = await res.json()
  await page.context().addCookies([
    { name: 'token', value: token, domain: 'localhost', path: '/' },
  ])

  await page.goto('/clients')
  await page.click('button:has-text("Add client")')
  await page.fill('input[placeholder="Alice Smith"]', 'Test Client')
  await page.fill('input[type="email"]', 'testclient@example.com')
  await page.fill('input[placeholder="2024-25"]', '2024-25')
  await page.click('button:has-text("Create client")')

  await expect(page).toHaveURL(/\/clients\/.+/)
  await expect(page.getByText('Send invite')).toBeVisible()
})
