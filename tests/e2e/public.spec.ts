import { test, expect } from '@playwright/test'
// Run against a PRODUCTION BUILD in demo mode, without Supabase environment variables.
test('all public pages fit a phone', async ({ page }) => {
  for (const route of ['/', '/rent', '/buy', '/contact', '/sell', '/about', '/saved']) {
    await page.goto(route)
    await expect(page.locator('h1')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
})
test('filters are keyboard dismissible and update the URL', async ({page}) => {
  await page.goto('/rent')
  await page.getByRole('button', { name: /^Filters/ }).click()
  const dialog = page.getByRole('dialog', { name: 'Filters', exact: true })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: '2 BHK', exact: true }).click()
  await expect(page).toHaveURL(/bhk=2BHK/)
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
})
test('saved homes persist after reload', async ({page}) => {
  await page.goto('/rent')
  await page.getByRole('button', {name:'Save this home',exact:true}).first().click()
  await page.reload()
  await expect(page.getByRole('button',{name:'Remove from saved homes',exact:true}).first()).toBeVisible()
  await page.goto('/saved')
  await expect(page.locator('article')).toHaveCount(1)
})
test('gallery opens, advances, and closes',async({page})=>{
  await page.goto('/properties/spacious-2bhk-tirupati-nagar-virar-west')
  await page.getByRole('button',{name:'All 4 photos'}).click()
  const dialog=page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button',{name:'Next photo'}).click()
  await expect(dialog).toContainText('2 / 4')
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
})
test('demo submissions explicitly say they were not saved',async({request})=>{
  const response=await request.post('/api/enquiries',{data:{name:'Test User',phone:'9876543210',website:''}})
  expect(response.ok()).toBe(true)
  expect(await response.json()).toEqual({ok:true,demo:true})
})
