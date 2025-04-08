export interface OnboardingProgressType {
  isWebWidgetAdded: boolean;
  isInvitedTeammate: boolean;
  isInboxDemoCompleted: boolean;
  isInboxInUse: boolean;
  isMessagingChannelConnected: boolean;
  isWhatsappConsultationBooked: boolean;
  isAutomationRuleAdded: boolean;
  isQuickReplyAdded: boolean;
  isContactListCreated: boolean;
  isCampaignCreated: boolean;
}

export const initialFlags = {
  isInboxDemoCompleted: false,
  isInboxInUse: false,
  isMessagingChannelConnected: false,
  isWhatsappConsultationBooked: false,
  isInvitedTeammate: false,
  isAutomationRuleAdded: false,
  isQuickReplyAdded: false,
  isContactListCreated: false,
  isCampaignCreated: false,
  isWebWidgetAdded: false,
};
