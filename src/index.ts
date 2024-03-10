import { chromium } from "playwright";
import { takeScreenshot } from "./actions/take-screenshot";
import { getGPT } from "./chain";
import { wait } from "./utils/wait";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1920, height: 1080 });

const agent = getGPT(page);

const instructions = `
 Go to mentimeter.com
 Accept cookies
 Click the login button
 Enter CREDENTIALS into the form
 Click the login button using this EXACT locator text 'Log in'
`;

await agent.run(instructions.split("\n"));

console.log("Done");
await wait(10000);
await takeScreenshot(page);
await page.close();
process.exit(0);
