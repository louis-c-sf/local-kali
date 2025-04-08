export const SETTINGS_TEST_IDS = {
  settingsLayoutHeader: 'settings-layout-header',
  settingsAddProfilePictureButton: 'settings-add-profile-picture-button',
  settingsMenuDrawer: 'settings-menu-drawer',
  settingsMenuToggleButton: 'settings-menu-toggle-button',
  settingsMenuCloseButton: 'settings-menu-close-button',
  settingsMenu: 'settings-menu',
  settingsMenuToggle: 'settings-menu-toggle',
  settingsDeletedContactsSelectedRowCount:
    'settings-deleted-contacts-selected-row-count',
  settingsDeletedContactsContainer: 'settings-deleted-contacts-container',
  settingsDeletedContactsTable: 'settings-deleted-contacts-table',
  settingsDeletedContactsTableSelectAllCheckbox:
    'settings-deleted-contacts-table-select-all-checkbox',
  settingsDeletedContactsPagination: 'settings-deleted-contacts-pagination',
  settingsDeletedContactsRestoreButton:
    'settings-deleted-contacts-restore-button',
  settingsDeletedContactsPermanentlyDeleteButton:
    'settings-deleted-contacts-permanently-delete-button',
  settingsDeletedContactsRowActionsMenu:
    'settings-deleted-contacts-row-actions-menu',
  settingsDeletedContactsRowCheckbox: (userProfileId: string) =>
    `settings-deleted-contacts-row-checkbox-${userProfileId}`,
  settingsDeletedContactsRestoreDialog:
    'settings-deleted-contacts-restore-dialog',
  settingsDeletedContactsPermanentlyDeleteDialog:
    'settings-deleted-contacts-permanently-delete-dialog',
  settingsDeletedContactsExceedLimitDialog:
    'settings-deleted-contacts-exceed-limit-dialog',
  settingsDeletedContactsPermanentlyDeleteInput:
    'settings-deleted-contacts-permanently-delete-input',
  settingsDeletedContactsSelectAllButton:
    'settings-deleted-contacts-select-all-button',
  settingsDeletedContactsRestoreDialogButton:
    'settings-deleted-contacts-restore-dialog-button',
  settingsDeletedContactsPermanentlyDeleteDialogButton:
    'settings-deleted-contacts-permanently-delete-dialog-button',
  settingsDeletedContactsDialogCloseButton:
    'settings-deleted-contacts-dialog-close-button',
  settingsDeletedContactsTableRow: (userProfileId: string) =>
    `settings-deleted-contacts-table-row-${userProfileId}`,
  settingsDataPrivacyTableActionMenu: (id: string | number) =>
    `settings-data-privacy-table-action-menu-${id}`,
  settingsDataPrivacyTableActionMenuButton: (id: string | number) =>
    `settings-data-privacy-table-action-menu-button-${id}`,
  settingsDataPrivacyTableSearchInput:
    'settings-data-privacy-table-search-input',
  settingsDataPrivacyEditPatternDialog:
    'settings-data-privacy-edit-pattern-dialog',
  settingsRolesAndPermissionsDeleteDialog:
    'settings-roles-and-permissions-delete-dialog',
  settingsUserManagementSearchUserInput:
    'settings-user-management-search-user-input',
  settingsUserManagementFilterRoleSelect:
    'settings-user-management-filter-role-select',
  settingsUserManagementFilterTeamSelect:
    'settings-user-management-filter-team-select',
  settingsUserManagementFilterJoinedDateFilter:
    'settings-user-management-filter-joined-date-filter',
  settingsInviteByEmailTeamsSelect: 'settings-invite-by-email-teams-select',
  settingsInviteByLinkTeamsSelect: 'settings-invite-by-link-teams-select',
  settingsIntegrationDisconnectionWhatsappPhoneInput: (index: number) =>
    `settings-integration-disconnection-whatsapp-phone-input-${index}`,
  settingsIntegrationDisconnectionWhatsappDisconnectTrashButton: (
    index: number,
  ) =>
    `settings-integration-disconnection-whatsapp-disconnect-trash-button-${index}`,
  settingsIntegrationDisconnectionEmailInput: (index: number) =>
    `settings-integration-disconnection-email-input-${index}`,
  settingsIntegrationDisconnectionEmailDisconnectTrashButton: (index: number) =>
    `settings-integration-disconnection-email-disconnect-trash-button-${index}`,
  settingsIntegrationDisconnectionAddEmailButton:
    'settings-integration-disconnection-add-email-button',
  settingsIntegrationDisconnectionAddWhatsappButton:
    'settings-integration-disconnection-add-whatsapp-button',
  settingsManagePlanTabs: 'settings-manage-plan-tabs',
  settingsManagePlanCurrencyDropdown: 'settings-manage-plan-currency-dropdown',
  settingsManagePlanBackToTop: 'settings-manage-plan-back-to-top',
  settingsManagePlanHeaderCardStartup:
    'settings-manage-plan-header-card-startup',
  settingsManagePlanHeaderCardPro: 'settings-manage-plan-header-card-pro',
  settingsManagePlanHeaderCardPremium:
    'settings-manage-plan-header-card-premium',
  settingsManagePlanHeaderCardEnterprise:
    'settings-manage-plan-header-card-enterprise',
  settingsManagePlanFeatureListStartup:
    'settings-manage-plan-feature-list-startup',
  settingsManagePlanFeatureListPro: 'settings-manage-plan-feature-list-pro',
  settingsManagePlanFeatureListPremium:
    'settings-manage-plan-feature-list-premium',
  settingsManagePlanFeatureListEnterprise:
    'settings-manage-plan-feature-list-enterprise',
  settingsManagePlanTable: 'settings-manage-plan-table',
  settingsManagePlanCancelSection: 'settings-manage-plan-cancel-section',
} as const;
