export const TICKETING_TEST_IDS = {
  ticketingCreateTicketDialog: 'ticketing-create-ticket-dialog',
  ticketingListItem: (id: string) => `ticketing-list-item-${id}`,
  ticketingEditTicketStatusDropdown: 'ticketing-edit-ticket-status-dropdown',
  ticketingEditTicketTypeDropdown: 'ticketing-edit-ticket-type-dropdown',
  ticketingEditTicketPriorityDropdown:
    'ticketing-edit-ticket-priority-dropdown',
  ticketingEditTicketAssigneeDropdownInput:
    'ticketing-edit-ticket-assignee-dropdown-input',
  ticketingEditTicketAssigneeDropdownMenu:
    'ticketing-edit-ticket-assignee-dropdown-menu',
  ticketingContactDetailContainer: 'ticketing-contact-detail-container',
  ticketingChannelDetailContainer: 'ticketing-channel-detail-container',
  // ticket card
  ticketCard: (ticketId: string) => `ticket-card-#${ticketId}`,
  ticketCardTitle: 'ticket-card-title',
  ticketCardChannel: 'ticket-card-channel',
  ticketCardResolvedAt: 'ticket-card-resolved-at',
  ticketCardAssignee: 'ticket-card-assignee',
  ticketCardDueDateSelect: 'ticket-card-due-date-select',
  ticketCardStatusSelect: 'ticket-card-status-select',
  ticketCardTypeSelect: 'ticket-card-type-select',
  ticketCardPrioritySelect: 'ticket-card-priority-select',
  ticketCardViewRelatedConversationButton:
    'ticketing-card-view-related-conversation-button',
  ticketingAssigneeDropdown: 'ticketing-assignee-dropdown',
  ticketingAssigneeDropdownMenu: 'ticketing-assignee-dropdown-menu',
  ticketingAssigneeFilterInput: 'ticketing-assignee-filter-input',
  ticketingAssigneeFilterMenu: 'ticketing-assignee-filter-menu',
  ticketingCreateTicketAssignToUserAssignButton:
    'ticketing-create-ticket-assign-to-user-assign-button',
  ticketingCreateTicketAssigneeInput: 'ticketing-create-ticket-assignee-input',
  ticketingCreateTicketAssigneeMenu: 'ticketing-create-ticket-assignee-menu',
  ticketingListItemAssigneeInput: 'ticketing-list-item-assignee-input',
  ticketingListItemAssigneeMenu: 'ticketing-list-item-assignee-menu',
  ticketingSearchInput: 'ticketing-search-input',
  ticketingViewTicketDialog: 'ticketing-view-ticket-dialog',
  ticketingViewTicketDialogGeneralTabButton:
    'ticketing-view-ticket-dialog-general-tab-button',
  ticketingViewTicketDialogCommentsTabButton:
    'ticketing-view-ticket-dialog-comments-tab-button',
  ticketingViewTicketDialogActivityTabButton:
    'ticketing-view-ticket-dialog-activity-tab-button',
  ticketingViewTicketDialogTicketTypeDropdown:
    'ticketing-view-ticket-dialog-ticket-type-dropdown',
  ticketingViewTicketDialogTicketPriorityDropdown:
    'ticketing-view-ticket-dialog-ticket-priority-dropdown',
  ticketingViewTicketDialogTicketStatusDropdown:
    'ticketing-view-ticket-dialog-ticket-status-dropdown',
  ticketingSelectDueDateButton: 'ticketing-select-due-date-header-button',
  ticketingCreateTicketTicketTitleInput:
    'ticketing-create-ticket-dialog-ticket-title',
  ticketingCreateTicketDueDateInput: 'ticketing-create-ticket-dialog-due-date',
  ticketingCreateTicketDescriptionInput:
    'ticketing-create-ticket-description-input',
  ticketingViewTicketDialogTicketTitle:
    'ticketing-view-ticket-dialog-ticket-title',
  ticketingViewTicketDialogTicketDescriptionInput:
    'ticketing-view-ticket-dialog-ticket-description-input',
  ticketingViewTicketDialogTicketSaveButton:
    'ticketing-view-ticket-dialog-ticket-save-button',
  ticketingViewTicketDialogAssignToUserAssignButton:
    'ticketing-view-ticket-dialog-assign-to-user-assign-button',
} as const;
