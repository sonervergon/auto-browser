import { OpenAIEmbeddings } from "@langchain/openai";

export class TruncatedOpenAIEmbeddings extends OpenAIEmbeddings {
  async embedQuery(text: string) {
    return super.embedQuery(text.slice(0, 8000));
  }

  async embedDocuments(documents: string[]) {
    return super.embedDocuments(
      documents.map((document) => document.slice(0, 8000))
    );
  }
}
