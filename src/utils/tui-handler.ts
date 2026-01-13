// @ts-ignore - neo-neo-blessed has no TypeScript definitions
const blessed = require('neo-neo-blessed');
import { createStorage } from '../storage';

export async function handleTui(): Promise<void> {
  const storage = await createStorage();

  const screen = blessed.screen({
    smartCSR: true,
    title: 'Promptie - AI Prompt Manager',
  });

  const promptList = blessed.list({
    top: 0,
    left: 0,
    width: '25%',
    height: '100%',
    label: ' Prompts ',
    keys: true,
    vi: true,
    invertSelected: true,
    scrollbar: {
      ch: ' ',
      track: { bg: 'white' },
      style: { inverse: true },
    },
    style: {
      item: { fg: 'white' },
      selected: { fg: 'black', bg: 'white' },
      border: { fg: 'white' },
      scrollbar: { bg: 'blue' },
    },
    border: { type: 'line' },
  });

  let allPrompts: any[] = [];
  let filteredPrompts: any[] = [];

  const updateDetails = async (index: number) => {
    try {
      const selectedPrompt = filteredPrompts[index];
      if (selectedPrompt) {
        promptDetails.setContent(
          `{yellow-fg}{bold}Name:{/bold}{/yellow-fg} ${selectedPrompt.name}\n` +
            `{yellow-fg}{bold}Marker:{/bold}{/yellow-fg} ${selectedPrompt.marker}\n` +
            `{yellow-fg}{bold}Categories:{/bold}{/yellow-fg} ${selectedPrompt.categories?.join(', ') || 'None'}\n` +
            `{yellow-fg}{bold}Created:{/bold}{/yellow-fg} ${new Date(selectedPrompt.createdAt).toLocaleString()}\n` +
            `{yellow-fg}{bold}Updated:{/bold}{/yellow-fg} ${new Date(selectedPrompt.updatedAt).toLocaleString()}\n\n` +
            `{yellow-fg}{bold}Content:{/bold}{/yellow-fg}\n${blessed.escape(selectedPrompt.content)}`
        );
        promptDetails.scrollTo(0);
        screen.render();
      } else {
        promptDetails.setContent('No prompt selected');
        screen.render();
      }
    } catch (error: any) {
      promptDetails.setContent(`Error loading prompt details: ${error.message}`);
      screen.render();
    }
  };

  const loadPrompts = async () => {
    try {
      allPrompts = await storage.getAll();
      filteredPrompts = allPrompts;

      const items = filteredPrompts.map(p => p.name);
      promptList.setItems(items);
      promptList.setLabel(` Prompts (${filteredPrompts.length}) `);

      if (filteredPrompts.length > 0) {
        promptList.select(0);
        await updateDetails(0);
      } else {
        promptDetails.setContent('No prompts found');
        screen.render();
      }

      screen.render();
    } catch (error) {
      promptList.setItems(['Error loading prompts']);
      promptDetails.setContent('Error loading prompts');
      screen.render();
    }
  };

  const promptDetails = blessed.scrollabletext({
    top: 0,
    left: '25%',
    width: '75%',
    height: '100%',
    label: ' Prompt Details ',
    content: 'Select a prompt to view details',
    tags: true,
    keys: true,
    scrollbar: {
      ch: ' ',
      track: { bg: 'white' },
      style: { inverse: true },
    },
    style: {
      fg: 'white',
      border: { fg: 'white' },
      scrollbar: { bg: 'blue' },
    },
    border: { type: 'line' },
  });

  screen.append(promptList);
  screen.append(promptDetails);

  screen.key(['escape', 'q', 'C-c'], () => {
    screen.destroy();
    process.exit(0);
  });

  const switchPane = () => {
    if (screen.focused === promptList) {
      promptDetails.focus();
    } else {
      promptList.focus();
    }
  };

  const updateBorderColors = () => {
    if (screen.focused === promptList) {
      promptList.style.border.fg = 'yellow';
      promptDetails.style.border.fg = 'white';
    } else if (screen.focused === promptDetails) {
      promptList.style.border.fg = 'white';
      promptDetails.style.border.fg = 'yellow';
    }
    screen.render();
  };

  promptList.on('focus', updateBorderColors);
  promptList.on('blur', updateBorderColors);
  promptDetails.on('focus', updateBorderColors);
  promptDetails.on('blur', updateBorderColors);

  promptList.focus();
  updateBorderColors();

  screen.key(['tab', 'left', 'right'], () => {
    switchPane();
    updateBorderColors();
  });

  promptList.key(['up', 'down'], async () => {
    const selectedIndex = promptList.selected;
    if (selectedIndex >= 0) {
      await updateDetails(selectedIndex);
    }
  });

  await loadPrompts();

  promptList.focus();

  screen.render();
}
