/** Return the form field name for a dynamic metric result. */
export function resultFieldName(metricId: string) {
  return `results[${metricId}]`;
}

/** Return the form field name for a PCR status control. */
export function pcrStatusFieldName(metricId: string) {
  return `${resultFieldName(metricId)}[status]`;
}

/** Return the form field name for a PCR CT control. */
export function pcrCtFieldName(metricId: string) {
  return `${resultFieldName(metricId)}[ct]`;
}

/** Return the form field name for a manual group conclusion. */
export function groupConclusionFieldName(groupId: string) {
  return `groupConclusions[${groupId}]`;
}
