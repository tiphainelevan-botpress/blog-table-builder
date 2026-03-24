import { Autonomous, z } from '@botpress/runtime';

export default new Autonomous.Tool({
  name: 'parseTable',
  description: 'Parses raw text (tab-separated or pipe-separated) into structured table data with headers and rows. Use this when the user pastes a table.',
  input: z.object({
    rawText: z.string().describe('The raw table text pasted by the user, with rows separated by newlines and columns by tabs or pipes'),
  }),
  output: z.object({
    success: z.boolean(),
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    columnCount: z.number(),
    rowCount: z.number(),
    error: z.string().optional(),
  }),
  handler: async ({ rawText }) => {
    const lines = rawText.trim().split('\n').filter((l) => l.trim());

    if (lines.length < 2) {
      return { success: false, headers: [], rows: [], columnCount: 0, rowCount: 0, error: 'Need at least 2 lines (header + 1 row)' };
    }

    // Try tab-separated first (Google Docs default)
    let headers = lines[0].split('\t').map((s) => s.trim());

    if (headers.length >= 2) {
      const rows: string[][] = [];
      for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split('\t').map((s) => s.trim());
        if (cells.length === headers.length) {
          rows.push(cells);
        }
      }
      if (rows.length > 0) {
        return { success: true, headers, rows, columnCount: headers.length, rowCount: rows.length };
      }
    }

    // Fallback: pipe-separated (markdown tables)
    headers = lines[0].split('|').map((s) => s.trim()).filter(Boolean);

    if (headers.length < 2) {
      return { success: false, headers: [], rows: [], columnCount: 0, rowCount: 0, error: 'Could not detect table format. Use tab or pipe separators.' };
    }

    const rows: string[][] = [];
    for (let i = 1; i < lines.length; i++) {
      if (/^[\s|:\-]+$/.test(lines[i])) continue;
      const cells = lines[i].split('|').map((s) => s.trim()).filter(Boolean);
      if (cells.length === headers.length) {
        rows.push(cells);
      }
    }

    if (rows.length === 0) {
      return { success: false, headers: [], rows: [], columnCount: 0, rowCount: 0, error: 'No valid data rows found.' };
    }

    return { success: true, headers, rows, columnCount: headers.length, rowCount: rows.length };
  },
});
