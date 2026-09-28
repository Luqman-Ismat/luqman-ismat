// Display vocabulary shared by every card, table, badge and export. The worker assigns r.bucket / r.holds / r.notes2;
// this file only says how those values look. Nothing here classifies an assessment.
export const BUCKETS = [
  { key: 'All in scope', color: 'teal', hint: 'Scenario assessments' },
  { key: 'Pull in', color: 'pink', hint: 'Existing task moved earlier' },
  { key: 'Defer', color: 'blue', hint: 'Existing task moved later' },
  { key: 'Keep as planned', color: 'green', hint: 'No task date change proposed' },
  { key: 'Add task', color: 'amber', hint: 'Copy of a current-plan task' },
  { key: 'Engineering scope', color: 'purple', hint: 'No plan task clears minimum life' },
  { key: 'No breach in horizon', color: 'sage', hint: 'Under both limits to horizon' },
  { key: 'No task/no default', color: 'muted', hint: 'Nothing credits the assessment' },
  { key: 'Interval-driven', color: 'muted', hint: 'No risk curve · not optimized' },
];
export const bucketColor = b => BUCKETS.find(x => x.key === b)?.color || 'muted';
export const HOLDS = [
  { code: 'portfolio', label: 'Expected failures rise (no-harm flag)', color: 'amber', hint: 'Informational · the proposed plan counts more expected failures on a linked assessment; not a block', blocks: false },
  { code: 'conflict', label: 'Shared-task date conflict', color: 'amber', hint: 'One task number proposed on different dates', blocks: true },
  { code: 'uncleared', label: 'Breach not cleared', color: 'pink', hint: 'Breach in horizon with no task placed before it', blocks: false },
  { code: 'calendar', label: 'Plan ends at last TAR on file', color: 'sage', hint: 'Informational · nothing scheduled past the last TAR', blocks: false },
  { code: 'replacement', label: 'Replacement review', color: 'blue', hint: 'Informational · repeated rapid recurrences', blocks: false },
];
export const holdsOf = r => [...(r.holds || []), ...(r.notes2 || [])];
