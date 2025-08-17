/**
 * Utility functions for ABG action plan processing
 */

export interface ActionPlanIssue {
  title: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
}

export interface ActionPlanResult {
  issue: ActionPlanIssue;
  success: boolean;
  data: string;
  error?: string;
  processingTimeMs?: number;
  requestId: string;
}

/**
 * Creates a combined action plan from multiple issues and their action plans
 */
export function createCombinedActionPlan(issues: ActionPlanIssue[], actionPlans: ActionPlanResult[]): string {
  const successfulPlans = actionPlans.filter(plan => plan.success);
  const failedPlans = actionPlans.filter(plan => !plan.success);
  
  let combinedPlan = `# Multiple Clinical Issues - Action Plans\n\n`;
  combinedPlan += `## Summary\n`;
  combinedPlan += `Analysis identified **${issues.length} clinical issues** requiring immediate attention.\n`;
  combinedPlan += `Generated **${successfulPlans.length} action plans** successfully.\n\n`;
  
  if (failedPlans.length > 0) {
    combinedPlan += `⚠️ **Note**: ${failedPlans.length} action plan(s) could not be generated due to service issues.\n\n`;
  }
  
  // Add individual action plans
  successfulPlans.forEach((plan, index) => {
    const issue = plan.issue;
    const severityIcon = issue.severity === 'high' ? '🚨' : issue.severity === 'medium' ? '⚠️' : 'ℹ️';
    
    combinedPlan += `---\n\n`;
    combinedPlan += `# ${severityIcon} Issue ${index + 1}: ${issue.title}\n`;
    combinedPlan += `**Severity**: ${issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)} | **Category**: ${issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}\n\n`;
    combinedPlan += plan.data;
    combinedPlan += `\n\n`;
  });
  
  // Add failed plans section if any
  if (failedPlans.length > 0) {
    combinedPlan += `---\n\n`;
    combinedPlan += `## Action Plans Not Generated\n`;
    combinedPlan += `The following issues were identified but action plans could not be generated:\n\n`;
    
    failedPlans.forEach((plan, index) => {
      combinedPlan += `### ${plan.issue.title}\n`;
      combinedPlan += `**Reason**: ${plan.error || 'Service unavailable'}\n`;
      combinedPlan += `**Recommendation**: Please consult clinical protocols for ${plan.issue.title} management.\n\n`;
    });
  }
  
  combinedPlan += `---\n\n`;
  combinedPlan += `## Next Steps\n`;
  combinedPlan += `1. **Review each action plan** above in order of severity\n`;
  combinedPlan += `2. **Implement immediate interventions** for high-severity issues first\n`;
  combinedPlan += `3. **Monitor patient response** to all interventions\n`;
  combinedPlan += `4. **Reassess condition** based on treatment response\n\n`;
  
  return combinedPlan;
}

/**
 * Extracts severity icon based on severity level
 */
export function getSeverityIcon(severity: 'high' | 'medium' | 'low'): string {
  switch (severity) {
    case 'high': return '🚨';
    case 'medium': return '⚠️';
    case 'low': return 'ℹ️';
    default: return 'ℹ️';
  }
}

/**
 * Formats category name for display
 */
export function formatCategoryName(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Formats severity name for display
 */
export function formatSeverityName(severity: string): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}