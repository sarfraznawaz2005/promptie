import { Command } from 'commander';
import { colors } from '../utils/colors';

export const colorsCommand = new Command('colors')
  .description('Preview all colors used by Promptie with examples')
  .action(() => {
    console.log(colors.welcome('🎨 Promptie Color Palette & Usage Guide\n'));

    console.log(colors.section('UI Element Colors:'));
    console.log(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    );

    console.log(
      `${colors.dataKey('System Info:')} ${colors.info('This appears to be your first time running Promptie.')}`
    );
    console.log(`${colors.dataKey('Welcome:')} ${colors.welcome('Welcome to Promptie!')}`);
    console.log(
      `${colors.dataKey('Instructions:')} ${colors.instruction('Please choose where to store your prompts:')}`
    );
    console.log(
      `${colors.dataKey('Options:')} ${colors.option('1. Default location: C:\\Users\\...')}`
    );
    console.log(
      `${colors.dataKey('User Prompts:')} ${colors.prompt('Enter your choice (1, 2, or 3):')}`
    );
    console.log(`${colors.dataKey('User Input:')} ${colors.userInput('my-prompt-name')}`);
    console.log(
      `${colors.dataKey('Success:')} ${colors.success('Configuration saved successfully!')}`
    );
    console.log(
      `${colors.dataKey('Errors:')} ${colors.error('Directory does not exist. Please provide an existing path.')}`
    );
    console.log(
      `${colors.dataKey('Confirmations:')} ${colors.confirm('Use default marker (MY-PROMPT)?')}`
    );
    console.log(`${colors.dataKey('Section Headers:')} ${colors.section('Review Your Prompt')}`);
    console.log(
      `${colors.dataKey('Data Keys:')} ${colors.dataKey('Name:')} ${colors.dataValue('my-prompt')}`
    );
    console.log(
      `${colors.dataKey('Indicators:')} ${colors.indicator('√')} ${colors.success('Success indicator')}`
    );
    console.log(
      `${colors.dataKey('Selections:')} ${colors.selection('»')} ${colors.selectedItem('Selected option')}`
    );
    console.log('');

    console.log(colors.section('Color Categories & Usage:'));
    console.log(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    );

    const colorExamples = [
      { name: 'info', color: colors.info, usage: 'System status messages, informational text' },
      { name: 'welcome', color: colors.welcome, usage: 'Application headers, welcome messages' },
      {
        name: 'instruction',
        color: colors.instruction,
        usage: 'Guidance text, instructions to users',
      },
      { name: 'option', color: colors.option, usage: 'Menu options, lists, numbered items' },
      { name: 'prompt', color: colors.prompt, usage: 'Questions requiring user input' },
      {
        name: 'userInput',
        color: colors.userInput,
        usage: 'Echoed user responses, input confirmation',
      },
      { name: 'success', color: colors.success, usage: 'Successful operations, confirmations' },
      { name: 'error', color: colors.error, usage: 'Error messages, failures, warnings' },
      { name: 'confirm', color: colors.confirm, usage: 'Confirmation prompts, yes/no questions' },
      {
        name: 'selection',
        color: colors.selection,
        usage: 'Selection interfaces, highlighted items',
      },
      { name: 'selectedItem', color: colors.selectedItem, usage: 'Currently selected menu items' },
      { name: 'availableItem', color: colors.availableItem, usage: 'Available options in menus' },
      { name: 'section', color: colors.section, usage: 'Section dividers, major headings' },
      { name: 'dataKey', color: colors.dataKey, usage: 'Labels for data pairs (Name:, Value:)' },
      { name: 'dataValue', color: colors.dataValue, usage: 'Actual data values, content' },
      { name: 'actionPrompt', color: colors.actionPrompt, usage: 'Action menu prompts' },
      { name: 'actionSelected', color: colors.actionSelected, usage: 'Selected actions in menus' },
      {
        name: 'actionAvailable',
        color: colors.actionAvailable,
        usage: 'Available actions in menus',
      },
      {
        name: 'indicator',
        color: colors.indicator,
        usage: 'Checkmarks, progress indicators, arrows',
      },
      {
        name: 'text',
        color: colors.text,
        usage: 'General text content, descriptions, and emphasized bold text',
      },
    ];

    colorExamples.forEach(({ name, color, usage }) => {
      console.log(`${colors.dataKey(`${name}:`)} ${color(`${name} color example`)}`);
      console.log(`  ${colors.metadata(`Usage: ${usage}`)}`);
      console.log('');
    });

    console.log(colors.section('Accessibility Notes:'));
    console.log(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    );
    console.log(colors.instruction('• All colors are optimized for dark terminal backgrounds'));
    console.log(colors.instruction('• High contrast ratios ensure readability'));
    console.log(colors.instruction('• Colors degrade gracefully on monochrome terminals'));
    console.log(
      colors.instruction('• Colorblind-friendly palette avoids problematic combinations')
    );
    console.log('');

    console.log(colors.section('Customization:'));
    console.log(
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    );
    console.log(colors.instruction('Colors can be modified in: src/utils/colors.ts'));
    console.log(colors.instruction('Run this command anytime to preview changes: pti colors'));
    console.log('');
  });
