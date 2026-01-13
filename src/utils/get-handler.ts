import { createStorage } from '../storage';
import { colors } from './colors';

export async function handleGet(name: string, all?: boolean): Promise<void> {
  const storage = await createStorage();

  const prompt = await storage.get(name);
  if (!prompt) {
    console.log(colors.error(`Prompt "${name}" not found in storage.`));
    console.log(colors.metadata(`Use "pti list" to see available prompts.`));
    return;
  }

  if (all) {
    // Output all fields as JSON
    console.log(JSON.stringify(prompt, null, 2));
  } else {
    // Output only content
    console.log(prompt.content);
  }
}
