import { chromium } from "playwright";
import { env } from "../env";
import { takeScreenshot } from "./actions/take-screenshot";
import { getGPT } from "./chain";
import { wait } from "./utils/wait";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1920, height: 1080 });

const context = `
CREDENTIALS:
- email: ${env.mentiEmail}
- password: ${env.mentiPassword}
`;

const agent = getGPT(page, context);

const instructions = ` Go to mentimeter.com
 Accept all cookies cookies
 Click the button for navigating to the login page
 Enter provided CREDENTIALS into the form ${context.replaceAll("\n", " ")}
 Click the login button using this EXACT locator text 'Log in'
`;

await agent.run(instructions.split("\n"));

console.log("Done");
await wait(10000);
await takeScreenshot(page);
await page.close();
process.exit(0);
