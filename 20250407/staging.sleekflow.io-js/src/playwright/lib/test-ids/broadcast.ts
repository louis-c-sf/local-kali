export const BROADCAST_TEST_IDS = {
  broadcastsTableSearchInput: 'broadcasts-table-search-input',
  broadcastsTableCreateNewBroadcastButton:
    'broadcasts-table-create-new-broadcast-button',
  broadcastsTableCreateNewBroadcastDialog:
    'broadcasts-table-create-new-broadcast-dialog',
  broadcastsTableCreateNewBroadcastDialogNextButton:
    'broadcasts-table-create-new-broadcast-dialog-next-button',
  broadcastsTableCreateNewBroadcastChannelSelect:
    'broadcasts-table-create-new-broadcast-channel-select',
  broadcastsTable: 'broadcasts-table',
  broadcastsCreateModalUsageExceededDialog:
    'broadcasts-create-modal-usage-exceeded-dialog',
  broadcastsCreateModalTitle: 'broadcasts-create-modal-title',
  broadcastsCreateModalDescription: 'broadcasts-create-modal-description',
  broadcastsCreateModalCloseButton: 'broadcasts-create-modal-close-button',
  broadcastCreateOpenPreviewMessageDialogButton:
    'broadcast-create-send-preview-message-button',
  broadcastsDetailSaveDraftButton: 'broadcasts-detail-save-draft-button',
  broadcastsDetailPublishButton: 'broadcasts-detail-publish-button',
  broadcastsDetailCloudAPIBroadcastNameInput:
    'broadcasts-detail-cloudapi-broadcast-name-input',
  broadcastsDetailCloudAPIBroadcastTimeRadio:
    'broadcasts-detail-cloudapi-broadcast-time-radio',
  broadcastsDetailCloudAPIMessageTypeSwitch:
    'broadcasts-detail-cloudapi-message-type-switch',
  broadcastsDetailCloudAPIMessageInput:
    'broadcasts-detail-cloudapi-message-input',
  broadcastsDetailCloudAPIMessageInputManualTextInput:
    'broadcasts-detail-cloudapi-message-manual-text-input',
  broadcastsDetailCloudAPIClearTemplateButton:
    'broadcasts-detail-cloudapi-clear-template-button',

  // BroadcastCreateWhatsappCloud
  broadcastsCreateWhatsappCloudSaveDraftButton:
    'broadcasts-create-whatsapp-cloud-save-draft-button',
  broadcastsCreateWhatsappCloudSendPreviewMessageButton:
    'broadcasts-create-whatsapp-cloud-send-test-message-button',
  broadcastsCreateWhatsappCloudPublishButton:
    'broadcasts-create-whatsapp-cloud-publish-button',
  broadcastsCreateUsageExceededDialog:
    'broadcasts-create-usage-exceeded-dialog',
  broadcastsCreateWhatsappCloudStepper:
    'broadcasts-create-whatsapp-cloud-stepper',
  broadcastsCreateWhatsappCloudFileUploadZone:
    'broadcasts-create-whatsapp-cloud-file-upload-zone',
  broadcastsCreateWhatsappCloudChooseTemplateButton:
    'broadcasts-create-whatsapp-cloud-choose-template-button',
  broadcastTestContactListDialog: 'broadcast-test-contact-list-dialog',
  broadcastTestContactListCloseButton:
    'broadcast-test-contact-list-close-button',
  broadcastTestContactSearchInput: 'broadcast-test-contact-search-input',
  broadcastTestContactSearchClearButton:
    'broadcast-test-contact-search-clear-button',
  broadcastTestContactCountrySelect: 'broadcast-test-contact-country-select',
  broadcastTestContactLabelSelect: 'broadcast-test-contact-label-select',
  broadcastsTableSelectAll: 'broadcasts-table-select-all',
  broadcastsTableSelectRow: (index: number) =>
    `broadcasts-table-select-row-${index}`,
  broadcastsAudienceDialogListSearch: 'broadcasts-audience-dialog-list-search',
  broadcastsAudienceDialogListSelectAllCell:
    'broadcasts-audience-dialog-list-select-all-cell',
  broadcastsAudienceDialogListSelectRow: (index: number) =>
    `broadcasts-audience-dialog-list-select-row-${index}`,
  // BroadcastCreateWhatsappCloud
  broadcastCreateWhatsappCloudOpenPreviewMessageDialogButton:
    'broadcast-create-whatsapp-cloud-send-preview-message-button',
} as const;
