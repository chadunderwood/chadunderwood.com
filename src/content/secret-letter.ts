/** Secret letter body — never rendered into /secret/ HTML at build time. Loaded only after unlock. */
export const secretLetter = {
  title: 'You found the quiet door',
  dek: 'Not in the sitemap. Soft-gated behind the home bio unlock.',
  paragraphs: [
    'This page is a placeholder letter. Replace with something personal — an odd project, a photo, a note to future Chad. Discovery still counts toward the home counter.',
    'If you arrived here through the unmarked word: welcome. The door isn’t locked — it’s just quiet.',
  ],
} as const;
