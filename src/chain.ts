import { ChatOpenAI } from "langchain/chat_models/openai";
import { DynamicTool } from "langchain/tools";
import { findInPage, goToLink, interactWithPage } from "./actions";
import { takeScreenshot } from "./actions/take-screenshot";
import { AutoGPT, AutoGPTOutputParser } from "langchain/experimental/autogpt";
import { TruncatedOpenAIEmbeddings } from "./utils/TruncatedEmbeddings";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import type { Page } from "playwright";
import { env } from "../env";

const chatApi = new ChatOpenAI({
  temperature: 0,
  openAIApiKey: env.openaiKey,
  modelName: "gpt-3.5-turbo-0125", // "gpt-4-0125-preview",
});

export const getGPT = (page: Page) => {
  const tools = [
    new DynamicTool({
      name: "interact with the page",
      description:
        "perform an action on the current page. Returns success after the interaction is successful or an error message if the interaction failed. the task should be written as a directive what the browser should do.",
      func: async (task) => {
        await interactWithPage(chatApi, page, task);
        await takeScreenshot(page);
        return "Success";
      },
    }),
    new DynamicTool({
      name: "find in current page",
      description:
        "find something in the html body content of the current webpage. use this content to figure out your next step. the task should be written question explaining what you want to find.",
      func: async (task) => {
        const found = await findInPage(page, chatApi, task);
        return "Success: " + found;
      },
    }),
    new DynamicTool({
      name: "go to url",
      description:
        "go to a specific url. Returns the page content of the new page or an error message if the goto failed.",
      func: async (link) => {
        await goToLink(page, link);
        return "success";
      },
    }),
  ];
  const vectorStore = new MemoryVectorStore(
    new TruncatedOpenAIEmbeddings({ openAIApiKey: env.openaiKey })
  );

  return AutoGPT.fromLLMAndTools(chatApi, tools, {
    memory: vectorStore.asRetriever(),
    aiName: "Developer Digest Assistant",
    aiRole: "Assistant",
    humanInTheLoop: false,
    outputParser: new AutoGPTOutputParser(),
  });
};
