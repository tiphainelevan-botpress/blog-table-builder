import { Autonomous, z } from '@botpress/runtime';

export default new Autonomous.Tool({
  name: 'reviewTableContent',
  description: 'Reviews table content for structural issues: empty cells, column mismatches, overly long cells, and inconsistent capitalization. Returns a list of issues with suggested fixes.',
  input: z.object({
    headers: z.array(z.string()).describe('Column header texts'),
    rows: z.array(z.array(z.string())).describe('Array of row arrays'),
  }),
  output: z.object({
    issues: z.array(
      z.object({
        type: z.enum(['typo', 'suggestion', 'info']),
        cell: z.string(),
        problem: z.string(),
        fix: z.string(),
      })
    ),
    isClean: z.boolean(),
    summary: z.string(),
  }),
  handler: async ({ headers, rows }) => {
    const issues: Array<{ type: 'typo' | 'suggestion' | 'info'; cell: string; problem: string; fix: string }> = [];

    // Check for empty cells
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        if (!rows[r][c] || rows[r][c].trim() === '') {
          issues.push({
            type: 'info',
            cell: `Row ${r + 1}, column "${headers[c]}"`,
            problem: 'Empty cell detected',
            fix: 'Add content or mark as N/A',
          });
        }
      }
    }

    // Check for inconsistent row lengths
    for (let r = 0; r < rows.length; r++) {
      if (rows[r].length !== headers.length) {
        issues.push({
          type: 'typo',
          cell: `Row ${r + 1}`,
          problem: `Has ${rows[r].length} columns but headers have ${headers.length}`,
          fix: 'Ensure all rows have the same number of columns',
        });
      }
    }

    // Check for overly long cells (>80 chars = probably too much info)
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        if (rows[r][c] && rows[r][c].length > 80) {
          issues.push({
            type: 'suggestion',
            cell: rows[r][c],
            problem: 'Cell contains a lot of text - each cell should ideally convey one clear idea',
            fix: 'Shorten to one concise point',
          });
        }
      }
    }

    // Check for inconsistent capitalization within columns
    for (let c = 0; c < headers.length; c++) {
      const vals = rows.map((r) => r[c]).filter(Boolean);
      if (vals.length < 3) continue;
      const startsUpper = vals.filter((v) => v[0] === v[0].toUpperCase()).length;
      const startsLower = vals.filter((v) => v[0] === v[0].toLowerCase()).length;
      if (startsUpper > 0 && startsLower > 0) {
        const majority = startsUpper >= startsLower ? 'uppercase' : 'lowercase';
        issues.push({
          type: 'info',
          cell: `Column "${headers[c]}"`,
          problem: `Mixed capitalization - most entries start ${majority} but some don't`,
          fix: 'Standardize capitalization across all rows in this column',
        });
      }
    }

    const isClean = issues.length === 0;
    const typos = issues.filter((i) => i.type === 'typo').length;
    const suggestions = issues.filter((i) => i.type === 'suggestion').length;
    const infos = issues.filter((i) => i.type === 'info').length;
    const summary = isClean
      ? 'No issues found - content is clean and consistent.'
      : `Found ${issues.length} issue(s): ${typos} typo(s), ${suggestions} suggestion(s), ${infos} info note(s).`;

    return { issues, isClean, summary };
  },
});