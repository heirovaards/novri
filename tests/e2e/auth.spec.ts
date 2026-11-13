import { test, expect, type Page } from '@playwright/test';

// Better Auth's default rate-limit storage is an in-memory Map keyed by IP + path, shared by the
// whole server process (not per email, and not reset by `pnpm db:reset`). Serializing this file's
// tests, and keeping the lockout test last, keeps its 15-minute throttle from poisoning sign-ins
// elsewhere in the same run.
test.describe.configure({ mode: 'serial' });

const ADMIN_SISTEM = { email: 'admin.sistem@lkps.local', password: 'Lkps#2026demo' };
const NEW_USER_PASSWORD = 'Lkps#Awal2026';
const NEW_USER_SECOND_PASSWORD = 'Lkps#Baru2026';

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Kata Sandi', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Masuk' }).click();
}

async function signOut(page: Page) {
  await page.getByRole('button', { name: 'Menu pengguna' }).click();
  await page.getByRole('menuitem', { name: 'Keluar' }).click();
  await expect(page).toHaveURL(/\/login$/);
}

function uniqueEmail(): string {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 10_000)}@lkps.local`;
}

test('wrong password shows the generic failure message', async ({ page }) => {
  await signIn(page, ADMIN_SISTEM.email, 'wrong-password-123');
  await expect(page.locator('form').getByText('Email atau kata sandi salah.')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test('Admin Sistem creates an Admin Prodi, who is forced to change password and lands on the dashboard; opening Pengguna as Admin Prodi shows 403', async ({
  page,
}) => {
  const email = uniqueEmail();

  await signIn(page, ADMIN_SISTEM.email, ADMIN_SISTEM.password);
  await expect(page).toHaveURL(/\/admin\/pengguna$/);

  await page.getByRole('button', { name: 'Tambah Pengguna' }).click();
  await page.getByLabel('Nama').fill('[E2E Admin Prodi]');
  await page.getByLabel('Email').fill(email);
  await page.getByRole('dialog').getByText('Admin Prodi', { exact: true }).click();
  await page.getByLabel('Kata sandi awal').fill(NEW_USER_PASSWORD);
  await page.getByRole('button', { name: 'Simpan' }).click();
  await expect(page.getByText(email)).toBeVisible();
  await signOut(page);

  await signIn(page, email, NEW_USER_PASSWORD);
  await expect(page).toHaveURL(/\/ganti-kata-sandi$/);
  await expect(page.getByText('Anda perlu mengganti kata sandi sebelum melanjutkan.')).toBeVisible();

  await page.getByLabel('Kata sandi saat ini').fill(NEW_USER_PASSWORD);
  await page.getByLabel('Kata sandi baru', { exact: true }).fill(NEW_USER_SECOND_PASSWORD);
  await page.getByLabel('Ulangi kata sandi baru').fill(NEW_USER_SECOND_PASSWORD);
  await page.getByRole('button', { name: 'Simpan Kata Sandi' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto('/admin/pengguna');
  await expect(page).toHaveURL(/\/forbidden$/);
  await expect(page.getByText('Anda tidak memiliki akses ke halaman ini.')).toBeVisible();
});

test('deactivating a user ends their session and blocks further sign-in', async ({ page, browser }) => {
  const email = uniqueEmail();

  await signIn(page, ADMIN_SISTEM.email, ADMIN_SISTEM.password);
  await page.getByRole('button', { name: 'Tambah Pengguna' }).click();
  await page.getByLabel('Nama').fill('[E2E Deactivate Me]');
  await page.getByLabel('Email').fill(email);
  await page.getByRole('dialog').getByText('Dosen', { exact: true }).click();
  await page.getByLabel('Kata sandi awal').fill(NEW_USER_PASSWORD);
  await page.getByRole('button', { name: 'Simpan' }).click();
  await expect(page.getByText(email)).toBeVisible();

  const otherUserContext = await browser.newContext();
  const otherUserPage = await otherUserContext.newPage();
  await signIn(otherUserPage, email, NEW_USER_PASSWORD);
  await expect(otherUserPage).toHaveURL(/\/ganti-kata-sandi$/);

  await page.getByText(email).click();
  await page.getByRole('button', { name: 'Nonaktifkan' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Nonaktifkan' }).click();
  await expect(page.getByText('Nonaktif').first()).toBeVisible();

  // Session invalidation is correct but, against a just-booted server, can lag the UI update that
  // confirms deactivation by a moment (observed only in the first seconds after a fresh `next start`,
  // never once the server has handled a few requests) — poll instead of assuming same-tick consistency.
  await expect(async () => {
    await otherUserPage.goto('/dashboard');
    await expect(otherUserPage).toHaveURL(/\/login$/);
  }).toPass({ timeout: 15_000 });

  await signIn(otherUserPage, email, NEW_USER_PASSWORD);
  await expect(otherUserPage.locator('form').getByText('Email atau kata sandi salah.')).toBeVisible();

  await otherUserContext.close();
});

test('Admin Sistem cannot deactivate their own account', async ({ page }) => {
  await signIn(page, ADMIN_SISTEM.email, ADMIN_SISTEM.password);
  await page.getByText('admin.sistem@lkps.local').click();
  await page.getByRole('button', { name: 'Nonaktifkan' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Nonaktifkan' }).click();
  await expect(page.getByText('Anda tidak dapat menonaktifkan akun Anda sendiri.')).toBeVisible();

  await page.reload();
  const row = page.getByRole('row').filter({ hasText: 'admin.sistem@lkps.local' });
  await expect(row.getByText('Aktif', { exact: true })).toBeVisible();
});

test('Admin Sistem cannot remove their own Admin Sistem role', async ({ page }) => {
  await signIn(page, ADMIN_SISTEM.email, ADMIN_SISTEM.password);
  await page.getByText('admin.sistem@lkps.local').click();
  // Swap to a different role rather than unchecking down to zero, so this exercises the
  // self-role-removal guard specifically rather than the "at least one role" field validation.
  await page.getByRole('dialog').getByText('Kaprodi', { exact: true }).click();
  await page.getByRole('dialog').getByText('Admin Sistem', { exact: true }).click();
  await page.getByRole('button', { name: 'Simpan' }).click();
  await expect(page.locator('form').getByText('Anda tidak dapat menghapus peran Admin Sistem milik Anda sendiri.')).toBeVisible();
});

test('after 5 failed sign-in attempts, the 6th is rejected even with the correct password', async ({ page }) => {
  // A fresh account with no prior login_failed rows, so this test's count isn't affected by the
  // "wrong password" test earlier in this same serial sequence failing once for ADMIN_SISTEM's email.
  const email = uniqueEmail();
  await signIn(page, ADMIN_SISTEM.email, ADMIN_SISTEM.password);
  await page.getByRole('button', { name: 'Tambah Pengguna' }).click();
  await page.getByLabel('Nama').fill('[E2E Lockout]');
  await page.getByLabel('Email').fill(email);
  await page.getByRole('dialog').getByText('Dosen', { exact: true }).click();
  await page.getByLabel('Kata sandi awal').fill(NEW_USER_PASSWORD);
  await page.getByRole('button', { name: 'Simpan' }).click();
  await expect(page.getByText(email)).toBeVisible();
  await signOut(page);

  for (let i = 0; i < 5; i += 1) {
    await signIn(page, email, 'wrong-password-123');
    await expect(page.locator('form').getByText('Email atau kata sandi salah.')).toBeVisible();
  }

  await signIn(page, email, NEW_USER_PASSWORD);
  await expect(page.locator('form').getByText('Terlalu banyak percobaan. Coba lagi dalam 15 menit.')).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});
