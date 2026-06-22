import { test, expect } from '@playwright/test'

test('Sign in link on landing page navigates to /login', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Sign in')
  await expect(page).toHaveURL('/login')
})

test('Get started CTA on landing page navigates to /login', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Get started free')
  await expect(page).toHaveURL('/login')
})

test('logged-in user visiting /login is redirected to /dashboard', async ({ page }) => {
  const res = await page.request.post('http://localhost:4000/test/seed-user')
  const { token } = await res.json()
  await page.context().addCookies([{ name: 'token', value: token, domain: 'localhost', path: '/' }])
  await page.goto('/login')
  await expect(page).toHaveURL('/dashboard')
})

test('unauthenticated user is redirected to login when visiting /dashboard', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/login/)
})

test('signing out redirects to the landing page', async ({ page }) => {
  const res = await page.request.post('http://localhost:4000/test/seed-user')
  const { token } = await res.json()
  await page.context().addCookies([{ name: 'token', value: token, domain: 'localhost', path: '/' }])
  await page.goto('/dashboard')
  await page.click('text=Sign out')
  await expect(page).toHaveURL('http://localhost:3000/')
})
