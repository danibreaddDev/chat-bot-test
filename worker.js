// worker.ts
import { MLCEngineWorkerHandler, MLCEngine } from "@mlc-ai/web-llm";

// Hookup an MLCEngine to a worker handler
const engine = new MLCEngine();
const handler = new MLCEngineWorkerHandler(engine);
onmessage = msg => {
  handler.onmessage(msg);
};