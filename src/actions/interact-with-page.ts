import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import type { Page } from "playwright";
import { expect } from "playwright/test";
import { parseSite } from "../utils/parse-html";
import { preprocessJsonInput } from "../utils";
import { nanoid } from "nanoid";
import { env } from "../../env";

const AsyncFunction = async function () {}.constructor;

export async function interactWithPage(
  chatApi: ChatOpenAI,
  page: Page,
  task: string
) {
  const code = await getPlayWrightCode(page, chatApi, task);
  await execPlayWrightCode(page, code as string);
  return Promise.resolve();
}

async function queryGPT(chatApi: ChatOpenAI, messages: any[]) {
  const completion = await chatApi.invoke(messages);

  const cleanedCommands = preprocessJsonInput(completion.text);

  return cleanedCommands;
}

async function getPlayWrightCode(
  page: Page,
  chatApi: ChatOpenAI,
  task: string
) {
  const systemPrompt = `
You are a Senior SDET tasked with writing Playwright code for testing purposes. Your role involves implementing specific task-based code segments within a larger test file, following the instructions provided closely. Assume that common imports like 'test' and 'expect' from '@playwright/test' are already at the top of the file.

CREDENTIALS: 
     - email: "${env.mentiEmail}"
     - password: "${env.mentiPassword}"

Context:
- Your computer is a Mac. Cmd is the meta key, META.
- The browser is already open.
- Current page URL: ${await page.evaluate("location.href")}.
- Current page title: ${await page.evaluate("document.title")}.
- Overview of the site in HTML format:
\`\`\`
${await parseSite(page)}
\`\`\`

Key Points:
- Include a script for accepting cookies
- Start directly with Playwright actions as described in the user task, without adding extraneous steps or assertions.
- Include assertions like 'expect' statements only when they are specifically requested in the user task.
- Minimal, relevant comments should be used to clarify complex actions or essential aspects of the test's purpose.
- Apply 'frameLocator' for content in nested iframes, as needed based on the task requirements.

User Task: [Insert the specific user task here, including any detailed instructions related to the execution, waiting for specific conditions, or explicit requests for assertions and waits.]

Expected Code Format:
\`\`\`
// [Insert Playwright code based on the task description. Begin with necessary actions directly, and include 'waitForLoadState', assertions, or 'expect' statements only if explicitly requested in the task. Comments should be concise and pertinent, especially for complex actions or decisions.]
\`\`\`

The objective is to create Playwright code that is efficient, precise, and perfectly aligned with the task's requirements, integrating seamlessly into the larger test file. All actions and comments should be relevant and necessary, catering to a senior-level professional's understanding of the testing scenario.`;

  return await queryGPT(chatApi, [
    new SystemMessage(systemPrompt),
    new HumanMessage(task),
  ]);
}

async function execPlayWrightCode(page: Page, code: string) {
  const dependencies = [
    { param: "page", value: page },
    { param: "expect", value: expect },
  ];
  console.log(code);

  const func = AsyncFunction(...dependencies.map((d) => d.param), code);
  const args = dependencies.map((d) => d.value);
  console.log("interacted");

  return await func(...args);
}
