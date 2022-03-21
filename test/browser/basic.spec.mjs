import { test, expect } from '@playwright/test'
const baseUrl = 'http://localhost:3333'

test('basic mock login', async ({ page }) => {
  await page.goto(`${baseUrl}`)
  const login = await page.locator('text=Github')
  await login.click()
  const user = await page.locator('text=John Doe')
  await user.click()
  const message = await page.locator('text=Hello')
  const text = await message.innerText()

  await expect(text).toBe('Hello John Doe You Made it!')
})

test('basic mock logout', async ({ page }) => {
  await page.goto(`${baseUrl}`)
  let login = await page.locator('text=Github')
  await login.click()
  const user = await page.locator('text=John Doe')
  await user.click()
  const logout = await page.locator('text=logout')
  await logout.click()
  await page.goto(`${baseUrl}`)
  login = await page.locator('text=Github')
  const text = await login.innerText()

  await expect(text).toBe('Login with Github')
})
