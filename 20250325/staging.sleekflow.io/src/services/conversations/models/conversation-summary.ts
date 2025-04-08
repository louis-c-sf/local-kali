export const ConversationSummaryStatus = [
  'open',
  'closed',
  'pending',
  'all',
] as const;

export type ConversationSummaryStatus =
  typeof ConversationSummaryStatus[number];

export type ConversationSummary = {
  [K in ConversationSummaryStatus]: {
    assigned?: number;
    total?: number;
    unassignedCount?: number;
  };
};
