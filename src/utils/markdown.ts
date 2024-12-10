export function parseMarkdownToBlocks(markdown: string): any[] {
  return markdown.split('\n')
    .filter(line => line.trim())
    .map(line => ({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{
          type: 'text',
          text: { content: line }
        }]
      }
    }));
}