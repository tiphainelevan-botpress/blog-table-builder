import { Autonomous, z } from '@botpress/runtime';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default new Autonomous.Tool({
  name: 'generateTableHTML',
  description: 'Generates blog-ready HTML embed code from structured table data. Uses the exact Botpress blog table template with inline styles.',
  input: z.object({
    headers: z.array(z.string()).describe('Column header texts'),
    rows: z.array(z.array(z.string())).describe('Array of row arrays, each containing cell values'),
  }),
  output: z.object({
    html: z.string().describe('The complete HTML table code ready to paste into the blog CMS'),
  }),
  handler: async ({ headers, rows }) => {
    const colCount = headers.length;
    const firstWidth = '25%';
    const restWidth = (75 / (colCount - 1)).toFixed(1) + '%';

    let html = '<table style="width:100%; text-align: left; border-collapse: collapse;">\n';

    // Header row
    html += '  <tr style="border-bottom: 1px solid #d3d3d3;">\n';
    for (let i = 0; i < headers.length; i++) {
      const width = i === 0 ? firstWidth : restWidth;
      html += `    <td style="padding: 8px; width: ${width}; vertical-align: bottom; font-weight: 600;">${escapeHtml(headers[i])}</td>\n`;
    }
    html += '  </tr>\n';

    // Data rows
    for (const row of rows) {
      html += '  <tr style="border-bottom: 1px solid #d3d3d3;">\n';
      for (const cell of row) {
        html += `    <td style="padding: 8px; vertical-align: bottom;">${escapeHtml(cell)}</td>\n`;
      }
      html += '  </tr>\n';
    }

    html += '</table>';

    return { html };
  },
});