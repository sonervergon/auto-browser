import { nanoid } from "nanoid";
import type { Page } from "playwright";
import { wait } from "../utils/wait";

export const takeScreenshot = async (page: Page) => {
  try {
    await wait(5000);

    const now = new Date().toISOString();
    const name = `${now}-${nanoid(10)}`;
    const path = `./screenshots/${name}.png`;
    await page.screenshot({
      path,
      animations: "disabled",
    });
  } catch (error) {
    console.log(error);
  }
};
