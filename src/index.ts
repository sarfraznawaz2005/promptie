#!/usr/bin/env node

import { Command } from 'commander';
import { createCommand } from './commands/create';
import { editCommand } from './commands/edit';

import { applyCommand } from './commands/apply';
import { listCommand } from './commands/list';
import { uiCommand } from './commands/tui';
import { cleanCommand } from './commands/clean';
import { deleteCommand } from './commands/delete';
import { exportCommand } from './commands/export';
import { importCommand } from './commands/import';
import { searchCommand } from './commands/search';

import { getCommand } from './commands/get';
import { runCommand } from './commands/run';
import { categoryCommand } from './commands/category';
import { statsCommand } from './commands/stats';
import { locationCommand } from './commands/location';
import { onboardCommand } from './commands/onboard';
import { colorsCommand } from './commands/colors';
import { sampleCommand } from './commands/sample';
import { devRulesCommand } from './commands/dev-guide';
import packageJson from '../package.json';

const program = new Command();

program.name('pti').description('Manage AI prompts!').version(packageJson.version);

program.addCommand(createCommand);
program.addCommand(editCommand);

program.addCommand(applyCommand);
program.addCommand(listCommand);

program.addCommand(uiCommand);

program.addCommand(getCommand);
program.addCommand(runCommand);
program.addCommand(cleanCommand);
program.addCommand(deleteCommand);
program.addCommand(exportCommand);
program.addCommand(importCommand);
program.addCommand(searchCommand);
program.addCommand(categoryCommand);
program.addCommand(statsCommand);
program.addCommand(locationCommand);
program.addCommand(onboardCommand);
program.addCommand(colorsCommand, { hidden: true });
program.addCommand(sampleCommand, { hidden: true });
program.addCommand(devRulesCommand, { hidden: true });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
