import type { Page } from "playwright";

export async function goToLink(page: Page, link: string) {
  await page.goto(link);

  return true;
}
