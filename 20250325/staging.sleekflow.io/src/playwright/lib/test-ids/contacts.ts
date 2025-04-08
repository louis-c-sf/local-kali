export const CONTACTS_TEST_IDS = {
  contactsCreatePageCreateButton: 'contacts-create-page-create-button',
  contactsCreatePageInput: (fieldName: string) =>
    `contacts-create-page-input-${fieldName}`,
  contactDetailAboutSection: 'contact-detail-about-section',
  contactDetailHeaderThreeDotButton: 'contact-detail-header-three-dot-button',
  contactMenu: 'contact-menu',
  contactMenuToggle: 'contact-menu-toggle',
  contactsFilterConditionContactFieldAutocomplete: (index: string | number) =>
    `contacts-filter-condition-contact-field-autocomplete-${index}`,
  contactsFilterConditionFilterRuleInput: (index: string | number) =>
    `contacts-filter-condition-filter-rule-input-${index}`,
  contactsFilterConditionFilterValueInput: (index: string | number) =>
    `contacts-filter-condition-filter-value-input-${index}`,
  contactsFilterConditionFilterRemoveButton: (index: string | number) =>
    `contacts-filter-condition-filter-remove-button-${index}`,
  contactsTableSearchInput: 'contacts-table-search-input',
  contactsTableAdvancedFiltersButton: 'contacts-table-advanced-filters-button',
  contactsTableAdvancedFiltersDialog: 'contacts-table-contacts-filter-dialog',
  contactMoreActionsButton: 'contact-more-actions-button',
  importContactsButton: 'import-contacts-button',
  importContactsStandardOption: 'import-contacts-standard-option',
  importContactsExpressOption: 'import-contacts-express-option',
  importContactsStepDefineSubmitButton: 'step-define-submit',
  importContactsCompleteButton: 'confirmation-dialog-complete-button',
  importContactsConfirmCheckbox: 'import-confirmation-checkbox',
  importContactListDropdown: 'import-list-name',
  importContactStepPrepareNextButton: 'import-step-prepare-next-button',
  importContactStepUploadNextButton: 'import-step-upload-next-button',
  importContactStepMatchNextButton: 'import-step-match-next-button',
} as const;
