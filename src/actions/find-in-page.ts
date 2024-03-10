import type { Page } from "playwright";
import { parseSite } from "../utils/parse-html";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function findInPage(
  page: Page,
  chatApi: ChatOpenAI,
  task: string
) {
  const systemPrompt = `
    You are a programmer and your job is to pick out information in code to a pm. You are working on an html file. You will extract the necessary content asked from the information provided. 

    Context:
    Your computer is a mac. Cmd is the meta key, META.
    The browser is already open. 
    Current page url is ${await page.evaluate("location.href")}.
    Current page title is ${await page.evaluate("document.title")}.

    Here is the overview of the site. Format is in html:
    \`\`\`
    ${await parseSite(page)}
    \`\`\`

    `;

  const completion = await chatApi.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(task),
  ]);
  return completion.text;
}
