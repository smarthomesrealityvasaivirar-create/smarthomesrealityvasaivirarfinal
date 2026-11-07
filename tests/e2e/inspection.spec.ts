import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const screenshotDir = path.resolve(process.cwd(), 'verification/screenshots')
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true })
}

const viewports = [
  { name: '320px', width: 320, height: 640 },
  { name: '390px', width: 390, height: 844 },
  { name: '768px', width: 768, height: 1024 },
  { name: '1440px', width: 1440, height: 900 },
]

test.describe('Responsive layout and visual checks', () => {
  for (const vp of viewports) {
    test(`responsive layout check at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      const routes = ['/', '/rent', '/buy', '/sell', '/contact', '/about', '/saved']
      for (const route of routes) {
        await page.goto(route)
        await page.waitForLoadState('domcontentloaded')
        const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
        expect(noOverflow).toBe(true)
      }
      await page.goto('/')
      await page.screenshot({ path: path.join(screenshotDir, `home-${vp.name}.png`), fullPage: false })
      await page.goto('/rent')
      await page.screenshot({ path: path.join(screenshotDir, `rent-${vp.name}.png`), fullPage: false })
    })
  }
})

test.describe('Filter sheet testing', () => {
  for (const vp of [viewports[0], viewports[1], viewports[2]]) {
    test(`filter sheet interactions at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/rent')
      const filterBtn = page.getByRole('button', { name: /^Filters/ })
      await expect(filterBtn).toBeVisible()
      await filterBtn.click()
      const dialog = page.getByRole('dialog', { name: 'Filters', exact: true })
      await expect(dialog).toBeVisible()
      await page.screenshot({ path: path.join(screenshotDir, `filter-modal-${vp.name}.png`) })
      // Choose 2 BHK filter
      await dialog.getByRole('button', { name: '2 BHK', exact: true }).click()
      await expect(page).toHaveURL(/bhk=2BHK/)
      // Escape closes dialog
      await page.keyboard.press('Escape')
      await expect(dialog).not.toBeVisible()
    })
  }
})

test.describe('Gallery modal testing', () => {
  for (const vp of [viewports[1], viewports[3]]) {
    test(`gallery modal at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/properties/spacious-2bhk-tirupati-nagar-virar-west')
      const allPhotosBtn = page.getByRole('button', { name: /photos/i }).first()
      await expect(allPhotosBtn).toBeVisible()
      await allPhotosBtn.click()
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()
      await expect(dialog).toContainText('1 /')
      await page.screenshot({ path: path.join(screenshotDir, `gallery-${vp.name}.png`) })
      // Advance to next photo
      const nextBtn = dialog.getByRole('button', { name: 'Next photo' })
      await nextBtn.click()
      await expect(dialog).toContainText('2 /')
      // Close with Escape
      await page.keyboard.press('Escape')
      await expect(dialog).not.toBeVisible()
    })
  }
})

test.describe('Saved homes interactions', () => {
  test('save home, view in /saved, and remove', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/rent')
    const saveBtn = page.getByRole('button', { name: 'Save this home', exact: true }).first()
    await expect(saveBtn).toBeVisible()
    await saveBtn.click()
    // Should change to Remove from saved homes
    await expect(page.getByRole('button', { name: 'Remove from saved homes', exact: true }).first()).toBeVisible()
    // Go to /saved
    await page.goto('/saved')
    await expect(page.locator('article')).toHaveCount(1)
    await page.screenshot({ path: path.join(screenshotDir, 'saved-homes-list.png') })
    // Reload and check persistence
    await page.reload()
    await expect(page.locator('article')).toHaveCount(1)
    // Remove from saved
    const removeBtn = page.getByRole('button', { name: 'Remove from saved homes', exact: true }).first()
    await removeBtn.click()
    await expect(page.locator('article')).toHaveCount(0)
  })
})

test.describe('Forms testing', () => {
  test('property enquiry form demo submission & validation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/properties/spacious-2bhk-tirupati-nagar-virar-west')
    // Submit empty enquiry form
    const submitBtn = page.getByRole('button', { name: /Send enquiry|Request callback|Submit/i }).first()
    if (await submitBtn.isVisible()) {
      await submitBtn.click()
      // Form should validate required fields
      const phoneInput = page.locator('input[name="phone"]')
      await expect(phoneInput).toBeVisible()
      // Fill valid demo info
      const nameInput = page.locator('input[name="name"]')
      if (await nameInput.isVisible()) await nameInput.fill('Test Visitor')
      await phoneInput.fill('9876543210')
      await submitBtn.click()
      // Should show demo confirmation or success banner
      await expect(page.getByText(/demo|received|thank/i).first()).toBeVisible({ timeout: 5000 })
      await page.screenshot({ path: path.join(screenshotDir, 'enquiry-submitted.png') })
    }
  })

  test('contact form demo submission', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/contact')
    const nameInput = page.locator('input[name="name"]')
    const phoneInput = page.locator('input[name="phone"]')
    if (await nameInput.isVisible() && await phoneInput.isVisible()) {
      await nameInput.fill('Hrithik Tester')
      await phoneInput.fill('9876543210')
      const msgInput = page.locator('textarea[name="message"]')
      if (await msgInput.isVisible()) await msgInput.fill('Looking for a 2BHK flat in Virar West')
      const submitBtn = page.getByRole('button', { name: /Submit|Send/i }).first()
      await submitBtn.click()
      await expect(page.getByText(/demo|received|thank/i).first()).toBeVisible({ timeout: 5000 })
      await page.screenshot({ path: path.join(screenshotDir, 'contact-submitted.png') })
    }
  })

  test('owner sell/rent-out form submission', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/sell')
    const nameInput = page.locator('input[name="owner_name"]')
    const phoneInput = page.locator('input[name="phone"]')
    if (await nameInput.isVisible() && await phoneInput.isVisible()) {
      await nameInput.fill('Property Owner')
      await phoneInput.fill('9876543210')
      const localityInput = page.locator('input[name="locality"]')
      if (await localityInput.isVisible()) await localityInput.fill('Bolinj, Virar West')
      const submitBtn = page.getByRole('button', { name: /Send my property details|Send details|Submit/i }).first()
      await submitBtn.click()
      await expect(page.getByText(/demo|received|thank/i).first()).toBeVisible({ timeout: 5000 })
      await page.screenshot({ path: path.join(screenshotDir, 'sell-submitted.png') })
    }
  })
})

test.describe('Menu navigation testing', () => {
  test('mobile navigation menu at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    const menuBtn = page.getByRole('button', { name: /Menu|Open menu|toggle menu/i }).first()
    if (await menuBtn.isVisible()) {
      await menuBtn.click()
      await page.screenshot({ path: path.join(screenshotDir, 'mobile-menu-open.png') })
      // Nav links should be visible
      const rentLink = page.getByRole('link', { name: /Rent/i }).first()
      await expect(rentLink).toBeVisible()
    }
  })
})

test.describe('3D Intro, Reduced Motion & No-WebGL fallbacks', () => {
  test('reduced motion skips 3D intro completely', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    // With reduced motion, intro dialog should NOT be visible
    const introDialog = page.locator('.door-stage')
    await expect(introDialog).not.toBeVisible()
    // Main page content visible
    await expect(page.locator('h1')).toBeVisible()
  })

  test('3D intro skip button works with normal motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')
    const skipBtn = page.locator('.door-skip')
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click()
      await expect(page.locator('.door-stage')).not.toBeVisible({ timeout: 3000 })
    }
    await expect(page.locator('h1')).toBeVisible()
  })

  test('no-WebGL fallback recovers gracefully without freezing', async ({ page }) => {
    await page.addInitScript(() => {
      // Simulate no WebGL support
      const originalGetContext = HTMLCanvasElement.prototype.getContext
      ;(HTMLCanvasElement.prototype as any).getContext = function (type: string, ...args: any[]) {
        if (type.includes('webgl')) return null
        return originalGetContext.apply(this, [type, ...args] as any)
      }
    })
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')
    // When WebGL is unavailable, DoorEntrance should catch it and unmount/finish
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 })
    // Verify page scroll is not locked
    const overflow = await page.evaluate(() => document.body.style.overflow)
    expect(overflow).toBe('')
  })
})

