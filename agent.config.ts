import { z, defineConfig } from '@botpress/runtime';

export default defineConfig({
    name: 'blog-table-builder',
    description: 'An AI agent that converts Google Docs tables into blog-ready HTML embeds with content review.',

    bot: {
        state: z.object({}),
    },

    user: {
        state: z.object({
            lastTableHeaders: z.array(z.string()).optional(),
            lastTableRows: z.array(z.array(z.string())).optional(),
            lastGeneratedHTML: z.string().optional(),
        }),
    },

    dependencies: { "integrations": { "webchat": { "version": "webchat@0.3.0", "enabled": true }, "chat": { "version": "chat@0.7.6", "enabled": true } } },
});
