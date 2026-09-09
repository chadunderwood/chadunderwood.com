import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    edition: z.number().default(1),
    summary: z.string().optional(),
    draft: z.boolean().default(false),
    example: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    featuredImage: z.string().optional(),
    sourceUrl: z.string().optional(),
  }),
});

export const collections = { writing };
