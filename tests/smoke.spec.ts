import { expect, test } from '@playwright/test';

test.describe('SafeSpace smoke suite', () => {
  test.beforeEach(async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        pageErrors.push(message.text());
      }
    });

    test.info().attach('page-errors-buffer', {
      body: Buffer.from(JSON.stringify(pageErrors)),
      contentType: 'application/json',
    });
  });

  test('home page renders primary value props', async ({ page }) => {
    await page.goto('/#/');

    await expect(page.getByRole('heading', { name: /Every renter deserves/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Enter your address$/ }).first()).toBeVisible();
    await expect(page.getByText('What SafeSpace Does')).toBeVisible();
    await expect(page.getByText('Cities with Full Coverage')).toBeVisible();
  });

  test('property lookup route renders merged lookup shell', async ({ page }) => {
    await page.goto('/#/property-lookup');

    await expect(page.getByRole('heading', { name: /^Property Lookup$/ })).toBeVisible();
    await expect(page.getByText(/Research health history, landlord reviews/i)).toBeVisible();
    await expect(page.getByText('How Property Lookup Works')).toBeVisible();
    await expect(page.getByText('Health & Safety')).toBeHidden();
  });

  test('report flow exposes evidence tiers', async ({ page }) => {
    await page.goto('/#/report');

    await expect(page.getByRole('heading', { name: /Report a Health or Safety Issue/i })).toBeVisible();
    await expect(page.getByText('Before You Report')).toBeVisible();
    await expect(page.getByText('How SafeSpace grades evidence')).toBeVisible();
    await expect(page.getByText(/Level 4: official agency notice/i)).toBeVisible();
    await expect(page.getByText(/Sign in to continue/i)).toBeVisible();
  });

  test('review flow renders multi-step review experience', async ({ page }) => {
    await page.goto('/#/review');

    await expect(page.getByRole('heading', { name: /Rate Your Rental Experience/i })).toBeVisible();
    await expect(page.getByText(/takes under 90 seconds/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Where did you live\?/i })).toBeVisible();
  });

  test('know your rights supports Colorado research cities', async ({ page }) => {
    await page.goto('/#/know-your-rights?city=longmont-co');

    await expect(page.getByRole('heading', { name: /Know Your Rights/i })).toBeVisible();
    await expect(page.getByText(/Longmont, CO Tenant Protections/i)).toBeVisible();
    await expect(page.getByText('Jurisdiction Layers')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Boulder County|Weld County/ }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Colorado Tenant Law$/ })).toBeVisible();
  });

  test('Colorado city page shows layered jurisdiction data', async ({ page }) => {
    await page.goto('/#/city/longmont-co');

    await expect(page.getByRole('heading', { name: /Longmont, CO/i })).toBeVisible();
    await expect(page.getByText('County, State, and Federal Layers')).toBeVisible();
    await expect(page.getByText(/Federal Housing Protections/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Leave a Review/i })).toBeVisible();
  });
});
