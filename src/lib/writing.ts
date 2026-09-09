import { getCollection } from 'astro:content';

export async function getPublishedWriting() {
  const posts = await getCollection('writing', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function editionLabel(data: {
  date: Date;
  updated?: Date;
  edition?: number;
}): string | null {
  const edition = data.edition ?? 1;
  const updated = data.updated;
  if (edition > 1 || (updated && updated.valueOf() !== data.date.valueOf())) {
    const parts: string[] = [];
    if (edition > 1) parts.push(`v${edition}`);
    if (updated) parts.push(`Updated ${formatDate(updated)}`);
    return parts.join(' · ');
  }
  return null;
}
