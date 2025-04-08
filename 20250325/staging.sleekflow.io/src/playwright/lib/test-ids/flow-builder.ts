export const FLOWBUILDER_TEST_IDS = {
  flowBuilderNodeFormDrawer: 'node-form-drawer',
  flowBuilderCreateDialog: 'flow-builder-create-dialog',
  flowBuilderCreateButton: 'flow-builder-create-button',
  flowBuilderCloseDialogButton: 'flow-builder-close-dialog-button',
  flowBuilderStepButton: (type: string) => `flow-builder-step-button-${type}`,
  flowBuilderClassicTypeOption: 'flow-builder-classic-type-option',
  flowBuilderPlusTypeOption: 'flow-builder-plus-type-option',
  flowBuilderTemplateSearchInput: 'flow-builder-template-search-input',
  flowBuilderTemplateTypeMenuItem: (id: string) =>
    `flow-builder-template-type-menu-item-${id}`,
  flowBuilderTemplateCard: (id: string) =>
    `flow-builder-template-card-${id || 'unknown'}`,
  flowBuilderNameInput: 'flow-builder-name-input',
  flowBuilderReEnrollmentSwitch: 'flow-builder-re-enrollment-switch',
  flowBuilderAllCustomersRadio: 'flow-builder-all-customers-radio',
  flowBuilderNotSuccessCheckbox: 'flow-builder-not-success-checkbox',
  flowBuilderInProgressRadio: 'flow-builder-in-progress-radio',
  flowBuilderChannelSelect: 'flow-builder-channel-select',
  flowBuilderConditionSwitch: 'flow-builder-condition-switch',
  flowBuilderConditionTypeSelect: (index: number) =>
    `flow-builder-condition-type-select-${index}`,
  flowBuilderConditionKeywordInput: (index: number, idx: number) =>
    `flow-builder-condition-keyword-input-${index}-${idx}`,
  flowBuilderConditionAddKeywordButton:
    'flow-builder-condition-add-keyword-button',
  flowBuilderConditionAddConditionButton:
    'flow-builder-condition-add-condition-button',
  flowBuilderStatusChip: 'flow-builder-status-chip',
  flowBuilderSaveAsDraftButton: 'flow-builder-save-as-draft-button',
  flowBuilderSaveConfirmButton: 'flow-builder-save-confirm-button',
  flowBuilderPublishButton: 'flow-builder-publish-button',
  flowBuilderPublishConfirmButton: 'flow-builder-publish-confirm-button',
  flowBuilderActionTypeSelect: 'flow-builder-action-type-select',
  flowBuilderActionInternalNoteInput: 'flow-builder-action-internal-note-input',
  flowBuilderSearchInput: 'flow-builder-search-input',
  flowBuilderListingTableRow: (id: string) =>
    `flow-builder-listing-table-row-${id}`,
  flowBuilderCreateNewFlowButton: 'flow-builder-create-new-flow-button',
  flowBuilderConditionAddBranchButton:
    'flow-builder-condition-add-branch-button',
} as const;
