export const AI_SETTINGS_TEST_IDS = {
  // Library tab
  aiSettingsLibrarySearchInput: 'ai-settings-library-search-input',
  aiSettingsLibraryUploadButton: 'ai-settings-library-upload-button',
  aiSettingsLibrarySortByFilter: 'ai-settings-library-sort-by-filter',
  aiSettingsLibraryTrainingStatusFilter:
    'ai-settings-library-training-status-filter',
  aiSettingsLibraryResetFiltersButton:
    'ai-settings-library-reset-filters-button',
  // Library table
  aiSettingsLibraryTable: 'ai-settings-library-table',
  aiSettingsLibraryTableContainer: 'ai-settings-library-table-container',
  aiSettingsLibraryTableHead: 'ai-settings-library-table-head',
  aiSettingsLibraryTableBody: 'ai-settings-library-table-body',
  aiSettingsLibraryTableActionBarDeleteButton:
    'ai-settings-library-table-action-bar-delete-button',
  // Source name cell
  aiSettingsLibrarySourceNameCellMenuButton: (id: string | number) =>
    `ai-settings-library-source-name-cell-menu-button-${id}`,
  aiSettingsLibrarySourceNameCellDeleteMenuItem: (id: string | number) =>
    `ai-settings-library-source-name-cell-delete-menu-item-${id}`,
  // Status cell
  aiSettingsLibraryStatusCellRetryButton: (id: string | number) =>
    `ai-settings-library-status-cell-retry-button-${id}`,
  // Source details dialog
  aiSettingsLibrarySourceDetailsDialog:
    'ai-settings-library-source-details-dialog',
  aiSettingsLibrarySourceDetailsCloseButton:
    'ai-settings-library-source-details-close-button',
  aiSettingsLibrarySourceDetailsPreviewButton:
    'ai-settings-library-source-details-preview-button',
  aiSettingsLibrarySourceDetailsDeleteButton:
    'ai-settings-library-source-details-delete-button',
  // Functions for dynamic test IDs
  aiSettingsLibraryDataSourceRow: (id: string | number) =>
    `ai-settings-library-data-source-row-${id}`,
  aiSettingsLibraryDataSourceName: (id: string | number) =>
    `ai-settings-library-data-source-name-${id}`,
  aiSettingsLibraryUploadNewSourceUploadZone:
    'ai-settings-library-upload-new-source-upload-zone',
  aiSettingsLibraryUploadNewSourceImportButton:
    'ai-settings-library-upload-new-source-import-button',
} as const;
