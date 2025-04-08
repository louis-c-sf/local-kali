export const TABS = {
  agents: 'agents',
  library: 'library',
  settings: 'settings',
} as const;

export type AiSettingsTab = (typeof TABS)[keyof typeof TABS];

export const STATUS_COLOR: Record<string, 'mustard' | 'forest' | 'red'> = {
  pending: 'mustard',
  processing: 'mustard',
  completed: 'forest',
  failed: 'red',
};

export const PAGE_STORAGE_LIMIT = 1000;

export const isEnableAiAgents = (companyId: string | undefined) =>
  Boolean(
    import.meta.env.VITE_AI_AGENTS_COMPANIES?.split(',')?.find(
      (c: string) => c === companyId,
    ),
  );
