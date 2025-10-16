import type { ChatProvider } from "./ChatProvider";
import { GeminiProvider } from "./GeminiProvider";
import { OllamaProvider } from "./OllamaProvider";
// import { OpenAIProvider } from "./OpenAIProvider"; // Mantenha comentado por enquanto

export function getChatProvider(): ChatProvider {
  const provider = process.env.AI_PROVIDER?.toUpperCase();

  switch (provider) {
    // case "OPENAI":
    //   console.log("Usando o provedor: OpenAI");
    //   return new OpenAIProvider();
    case "OLLAMA":
      console.log("Usando o provedor: Ollama");
      return new OllamaProvider();
    case "GEMINI":
    default:
      console.log("Usando o provedor padrão: Gemini");
      try {
        return new GeminiProvider();
      } catch (error) {
        console.warn("Gemini provider failed, falling back to Ollama:", error);
        return new OllamaProvider();
      }
  }
}
