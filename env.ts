import { z } from "zod";

const envSchema = z.object({
  openaiKey: z.string(),
  mentiEmail: z.string(),
  mentiPassword: z.string(),
});

export const env = envSchema.parse({
  openaiKey: process.env.OPENAI_API_KEY,
  mentiEmail: process.env.MENTI_EMAIL,
  mentiPassword: process.env.MENTI_PASSWORD,
});
