import { Command } from 'commander';
import { colors } from '../utils/colors';

export const devRulesCommand = new Command('dev-rules')
  .description('Display the comprehensive development rules for the Promptie app (dev only)')
  .action(() => {
    console.log(colors.header('# 🚀 Promptie Development Rules\n'));

    console.log(colors.header('## You must always follow these rules:\n'));

    console.log(
      '- If you are unsure about any requirement, behavior, or implementation detail, ask clarifying questions **before** writing code.'
    );
    
    console.log(
      '- At every step, provide a **high-level explanation** of what changes were made and why.'
    );
    
    console.log(
      "- After implementing changes or new features, always provide a list of **suggestions or improvements**, even if they differ from the user's original request."
    );
    
    console.log(
      '- If the user requests a change or feature that is an **anti-pattern** or violates well-established best practices, clearly explain the issue and ask for confirmation before proceeding.'
    );
    
    console.log('- Use `backlog` for all task and issue management.');
    
    console.log(
      '- After implementing changes or new features, ensure that `README.md`, `AGENTS.md`, and the `onboard` command are fully updated and remain in sync with the codebase.'
    );
    
    console.log(
      '- After completing any code changes, always run `npm run build`, `npm run lint`, `npm run typecheck`, and `npm test` to verify correctness and stability.'
    );
    
    console.log('- All new features must be fully covered by appropriate automated tests.');
    
  });
