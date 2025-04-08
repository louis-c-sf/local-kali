export const INBOX_TEST_IDS = {
  inboxPage: 'inbox-page',
  inboxMenu: 'inbox-menu',
  inboxMenuToggle: 'inbox-menu-toggle',
  inboxMenuToggleClose: 'inbox-menu-toggle-close',
  inboxSearchConversationsFilterTab: 'inbox-search-conversations-filter-tab',
  inboxConversationsSearchbar: 'inbox-conversations-search-bar',
  inboxConversationsStatusFilterButton:
    'inbox-conversations-status-filter-button',
  inboxShopifyStoreDialog: 'inbox-shopify-store-dialog',
  inboxFilterConversationTrigger: 'inbox-filter-conversation-trigger',
  inboxConversationWindow: 'inbox-conversation-window',
  inboxCollaboratorsMenuTrigger: 'inbox-collaborators-menu-trigger',
  inboxFilterLabelsPanel: 'inbox-filter-labels-panel',
  inboxMyInboxMenuItem: 'my-inbox-menu-item',
  inboxCompanyInboxMenuItem: 'company-inbox-menu-item',
  inboxAddCollaboratorsMenu: 'inbox-add-collaborators-menu',
  inboxAddCollaboratorsButton: 'inbox-add-collaborators-button',
  inboxCollaboratorsSearchInput: 'inbox-collaborators-search-input',
  inboxAddCollaboratorsList: 'inbox-add-collaborators-list',
  inboxCollaboratorMenuExistingCollaboratorsList:
    'inbox-collaborator-menu-existing-collaborators-list',
  inboxExistingCollaboratorsList: 'inbox-existing-collaborators-list',
  inboxConversationInput: 'inbox-conversation-input',
  inboxSavedReplySuggestions: 'inbox-saved-reply-suggestions',
  inboxConversationUserProfile: 'inbox-conversation-user-profile',
  inboxSearchConversationList: 'search-conversations-list',
  inboxUnassignedTab: 'inbox-unassigned-tab',
  inboxAssignedTab: 'inbox-assigned-tab',
  inboxAiSmartSummaryButton: 'inbox-ai-smart-summary-button',
  inboxAiSmartReplyButton: 'inbox-ai-smart-reply-button',
  inboxAiEnrichmentDiscardChangesButton:
    'inbox-ai-enrichment-discard-changes-button',
  inboxAiEnrichmentConfirmChangesButton:
    'inbox-ai-enrichment-confirm-changes-button',
  inboxAiEnrichmentWritingAssistantButton:
    'inbox-ai-enrichment-writing-assistant-button',
  inboxAiEnrichmentContentContainer: 'inbox-ai-enrichment-content-container',
  inboxAiCustomPromptInput: 'inbox-ai-custom-prompt-input',
  inboxAiCustomPromptProceedButton: 'inbox-ai-custom-prompt-proceed-button',
  inboxAiCustomPromptCancelButton: 'inbox-ai-custom-prompt-cancel-button',
  inboxConversationInputTextbox: 'inbox-conversation-input-textbox',
  inboxConversationInputAttachmentButton:
    'inbox-conversation-input-attachment-button',
  inboxConversationInputEmojiButton: 'inbox-conversation-input-emoji-button',
  inboxConversationInputAudioButton: 'inbox-conversation-input-audio-button',
  inboxConversationInputSavedReplyButton:
    'inbox-conversation-input-saved-reply-button',
  inboxConversationInputProductCatalogButton:
    'inbox-conversation-input-product-catalog-button',
  inboxConversationInputPaymentLinkButton:
    'inbox-conversation-input-payment-link-button',
  inboxConversationInputChannelSelect:
    'inbox-conversation-input-channel-select',
  inboxConversationInputSendMessageButton:
    'inbox-conversation-input-send-message-button',
  inboxConversationInputScheduleMessageButton:
    'inbox-conversation-input-schedule-message-button',
  inboxConversationInputWhatsappInteractionMenu:
    'inbox-conversation-input-whatsapp-interaction-menu',
  inboxAssignedToMenuButton: 'inbox-assigned-to-menu-button',
  inboxAssignedToMenuPopover: 'inbox-assigned-to-menu-popover',
  inboxAssignedToMenuAssignViaTeamPanel: 'inbox-assigned-to-menu-team-panel',
  inboxAssignedToMenuAssignViaTeamListPanel: (teamName: string) =>
    `inbox-assigned-to-menu-assign-via-team-list-panel-${teamName}`,
  inboxAssignedToMenuTeamsListPanel: 'inbox-assigned-to-menu-teams-list-panel',
  inboxAssignedToMenuStaffTeamAccessPanel: (name: string) =>
    `inbox-assigned-to-menu-staff-team-access-panel-${name}`,
  inboxAssignedToMenuUnassignButton: 'inbox-assigned-to-menu-unassign-button',
  inboxAssignedToMenuAssignToMeButton:
    'inbox-assigned-to-menu-assign-to-me-button',
  inboxAssignedToMenuAssignViaTeamButton:
    'inbox-assigned-to-menu-assign-via-team-button',
  inboxAssignedToMenuAssignToIndividualButton:
    'inbox-assigned-to-menu-assign-to-individual-button',
  inboxAssignedToMenuAssignToIndividualPanel:
    'inbox-assigned-to-menu-assign-to-individual-panel',
  inboxShopifyStoreDialogProduct: (id: number) =>
    `inbox-shopify-store-dialog-product-${id}`,
  inboxShopifyStoryDialogProductAddToCartButton:
    'inbox-shopify-store-dialog-product-add-to-cart-button',
  inboxShopifyStoreDialogProductShareButton:
    'inbox-shopify-store-dialog-product-share-button',
  inboxConversationInputShopifyShareCartPageContainer:
    'inbox-conversation-input-shopify-share-cart-page-container',
  inboxConversationInputShopifyShareCartPreviousButton:
    'inbox-conversation-input-shopify-share-cart-previous-button',
  inboxConversationInputShopifyShareCartNextButton:
    'inbox-conversation-input-shopify-share-cart-next-button',
  inboxInsertTemplateVariableVariable: (fieldName: string) =>
    `inbox-insert-template-variable-${fieldName}`,
  inboxConversationMessage: (messageId: number) =>
    `inbox-conversation-message-${messageId}`,
  inboxScheduleMessageDialogTimePicker:
    'inbox-schedule-message-dialog-time-picker',
  inboxScheduledMessagesNotification: 'inbox-scheduled-messages-notification',
  inboxScheduleMessageDialogConfirmButton:
    'inbox-schedule-message-dialog-confirm-button',
  inboxScheduleMessageDialogCancelButton:
    'inbox-schedule-message-dialog-cancel-button',
} as const;
