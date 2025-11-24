import type { ChatProvider } from "./ChatProvider";
import { OpenAIProvider } from "./OpenAIProvider";

export function getChatProvider(): ChatProvider {
  const provider = process.env.AI_PROVIDER?.toUpperCase();

  console.log("Usando o provedor: OpenAI (ChatGPT)");
  return new OpenAIProvider();
}
