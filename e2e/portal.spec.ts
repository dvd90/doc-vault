import { test, expect } from '@playwright/test'

async function loginAs(
  page: Parameters<typeof test>[1] extends (args: { page: infer P }) => void ? P : never,
  token: string,
) {
  await page.context().addCookies([{ name: 'token', value: token, domain: 'localhost', path: '/' }])
}

test('full flow: create template → create client → apply template → portal upload', async ({
  page,
  context,
}) => {
  // 1. Seed an authenticated accountant
  const seedRes = await page.request.post('http://localhost:4000/test/seed-user')
  const { token } = await seedRes.json()
  await loginAs(page, token)

  // 2. Create a template
  await page.goto('/templates')
  await page.click('button:has-text("New template")')
  await page.fill('#template-name', 'SA Pack')
  await page.fill('input[placeholder="e.g. P60"]', 'P60 from employer')
  await page.click('button:has-text("Create template")')
  await expect(page.getByText('SA Pack')).toBeVisible()

  // 3. Create a client (redirects to detail page)
  await page.goto('/clients')
  await page.click('button:has-text("Add client")')
  await page.fill('input[placeholder="Alice Smith"]', 'E2E Client')
  await page.fill('input[type="email"]', 'e2e@example.com')
  await page.fill('input[placeholder="2024-25"]', '2024-25')
  await page.click('button:has-text("Create client")')
  await expect(page).toHaveURL(/\/clients\/.+/)

  // 4. Apply template — the "SA Pack" button should be visible
  await expect(page.getByText('SA Pack')).toBeVisible()
  await page.click('button:has-text("SA Pack")')
  await expect(page.getByText('P60 from employer')).toBeVisible()

  // 5. Get the portal token from the URL / page content and open the portal
  const portalLinkEl = page.locator('a', { hasText: 'Open client portal' })
  const portalHref = await portalLinkEl.getAttribute('href')
  expect(portalHref).toBeTruthy()

  const portalPage = await context.newPage()
  await portalPage.goto(portalHref!)

  // 6. Portal is visible without auth
  await expect(portalPage.getByText('E2E Client')).toBeVisible()
  await expect(portalPage.getByText('P60 from employer')).toBeVisible()

  // 7. Upload a file to the first item
  const fileInput = portalPage.locator('input[type="file"]').first()
  await fileInput.setInputFiles({
    name: 'p60.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 mock pdf content'),
  })

  // 8. Item should be marked as complete
  await expect(portalPage.getByText(/uploaded|complete|done/i).first()).toBeVisible({
    timeout: 10000,
  })
})

test('portal returns 404 for unknown token', async ({ page }) => {
  await page.goto('/portal/definitely-not-a-real-token-xyz')
  await expect(page).toHaveURL(/portal/)
  // Should show 404 or not-found state
  await expect(page.getByText(/not found|404/i)).toBeVisible()
})

test('portal shows firm branding and client name', async ({ page }) => {
  const res = await page.request.post('http://localhost:4000/test/seed-client')
  const { portalToken } = await res.json()
  await page.goto(`/portal/${portalToken}`)
  await expect(page.getByText('Test Client')).toBeVisible()
  // Checklist item from seed
  await expect(page.getByText('P60')).toBeVisible()
})
