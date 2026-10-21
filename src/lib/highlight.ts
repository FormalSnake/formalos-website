const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Just enough Starlark colouring for the snippets on this page: comments and strings.
export function highlight(code: string): string {
  return code
    .split('\n')
    .map((line) => {
      if (line.trimStart().startsWith('#')) return `<span class="tok-c">${escape(line)}</span>`;
      return escape(line).replace(/"[^"]*"/g, (m) => `<span class="tok-s">${m}</span>`);
    })
    .join('\n');
}
