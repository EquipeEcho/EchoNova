import type { ChatProvider } from "./ChatProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { OllamaProvider } from "./OllamaProvider";

export function getChatProvider(): ChatProvider {
  const provider = process.env.AI_PROVIDER?.toUpperCase();

  switch (provider) {
    case "OLLAMA":
      console.log("Usando o provedor: Ollama");
      return new OllamaProvider();
    case "OPENAI":
    default:
      console.log("Usando o provedor: OpenAI (ChatGPT)");
      try {
        return new OpenAIProvider();
      } catch (error) {
        console.warn("OpenAI provider failed, falling back to Ollama:", error);
        return new OllamaProvider();
      }
  }
}
