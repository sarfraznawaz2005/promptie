import { colors } from './colors';
import { createStorage } from '../storage';
import { writeJsonFile } from './fs';

export async function handleExport(exportPath: string): Promise<void> {
  const storage = await createStorage();
  const prompts = await storage.getAll();

  if (prompts.length === 0) {
    console.log(colors.warning(`No prompts found in storage.`));
    return;
  }

  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    prompts,
  };

  await writeJsonFile(exportPath, data);

  console.log(colors.success(`\n✓ Exported ${prompts.length} prompt(s) to ${exportPath}`));
}
