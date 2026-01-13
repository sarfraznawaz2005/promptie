import { Command } from 'commander';
import { createStorage, createCategoryStorage } from '../storage';
import { colors } from '../utils/colors';
import { withErrorHandling } from '../utils/error-handler';

export const sampleCommand = new Command('sample')
  .description('Create sample prompts and categories for testing (dev only)')
  .action(
    withErrorHandling(async () => {
      console.log(colors.info('Creating sample data for testing...'));

      const storage = await createStorage();
      const categoryStorage = await createCategoryStorage();

      // Create 5 sample categories
      const categories = [
        { name: 'AI', description: 'Artificial Intelligence prompts' },
        { name: 'Development', description: 'Software development prompts' },
        { name: 'Frontend', description: 'Frontend development prompts' },
        { name: 'Backend', description: 'Backend development prompts' },
        { name: 'Testing', description: 'Testing and QA prompts' },
      ];

      for (const category of categories) {
        await categoryStorage.save({
          name: category.name,
          description: category.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      // Create 10 sample prompts
      const prompts = [
        {
          name: 'typescript-expert',
          content:
            'You are a TypeScript expert who writes clean, type-safe code. Always use proper types, interfaces, and generics.',
          categories: ['Development', 'Frontend'],
        },
        {
          name: 'react-specialist',
          content:
            'You are a React specialist who follows modern React patterns, hooks, and best practices.',
          categories: ['Frontend', 'Development'],
        },
        {
          name: 'node-developer',
          content:
            'You are a Node.js developer who builds scalable server-side applications with Express and modern JavaScript.',
          categories: ['Backend', 'Development'],
        },
        {
          name: 'python-expert',
          content:
            'You are a Python expert who writes clean, efficient, and well-documented Python code following PEP 8 standards.',
          categories: ['Development', 'Backend'],
        },
        {
          name: 'ai-assistant',
          content:
            'You are a helpful AI assistant who provides clear, accurate, and concise responses to user queries.',
          categories: ['AI'],
        },
        {
          name: 'code-reviewer',
          content:
            'You are an experienced code reviewer who focuses on code quality, performance, security, and best practices.',
          categories: ['Development', 'Testing'],
        },
        {
          name: 'database-designer',
          content:
            'You are a database design expert who creates efficient, normalized database schemas with proper indexing.',
          categories: ['Backend', 'Development'],
        },
        {
          name: 'ui-ux-designer',
          content:
            'You are a UI/UX designer who creates beautiful, intuitive, and accessible user interfaces.',
          categories: ['Frontend', 'AI'],
        },
        {
          name: 'devops-engineer',
          content:
            'You are a DevOps engineer who sets up CI/CD pipelines, containerization, and infrastructure as code.',
          categories: ['Backend', 'Development'],
        },
        {
          name: 'security-expert',
          content:
            'You are a cybersecurity expert who identifies security vulnerabilities and implements secure coding practices.',
          categories: ['Development', 'Testing'],
        },
      ];

      const now = new Date();
      for (const prompt of prompts) {
        await storage.save({
          name: prompt.name,
          content: prompt.content,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          marker: prompt.name.toUpperCase().replace(/-/g, '-'),
          categories: prompt.categories,
        });
      }

      console.log(
        colors.success(`✓ Created 5 sample categories: ${categories.map(c => c.name).join(', ')}`)
      );
      console.log(
        colors.success(`✓ Created 10 sample prompts: ${prompts.map(p => p.name).join(', ')}`)
      );
      console.log(colors.info('Sample data created successfully!'));
    })
  );
