import mixpanel from 'mixpanel-browser';

import { ConnectionStrategy, CONNECTION_STRATEGY } from '@/hooks/useMyProfile';
import { AddOnsTypeDictType } from '@/pages/Settings/SettingsAddOns/types';

export const TRACKING_EVENTS = {
  workflowCreated: 'Workflow Edited',
  workflowEdited: 'Workflow Edited',
  workflowPublished: 'Workflow Published',
  contactCreated: 'Contact Created',
  contactUpdated: 'Contact Updated',
  messageSentFromInbox: 'Message Sent From Inbox',
  broadcastCreated: 'Broadcast Created',
  broadcastEdited: 'Broadcast Edited',
  broadcastPublished: 'Broadcast Published',
  switchToV1: 'Switch to Web V1',
  channelConnected: 'Channel Connected',
  pricingTableViewed: 'Pricing Table Viewed',
  addOnSubscribed: 'Add-On Subscribed',
  subscriptionIntentShown: 'Subscription Intent Shown',
  paidPlanSubscribed: 'Paid Plan Subscribed',
  planUpgradeIntentShown: 'Plan Upgrade Intent Shown',
  planUpgraded: 'Plan Upgraded',
  planDowngradeIntentShown: 'Plan Downgrade Intent Shown',
  planDowngraded: 'Plan Downgraded',
  planCancellationIntentShown: 'Plan Cancellation Intent Shown',
  planCancellationSurveySubmitted: 'Plan Cancellation Survey Submitted',
} as const;

export type TrackingEvent =
  (typeof TRACKING_EVENTS)[keyof typeof TRACKING_EVENTS];

export const trackEvent = (eventName: TrackingEvent, props?: any) => {
  mixpanel.track(eventName, props);
};

const channelTypeMap = {
  whatsApp: 'WhatsApp',
  facebook: 'Facebook',
  sms: 'SMS',
  weChat: 'WeChat',
  line: 'Line',
  telegram: 'Telegram',
  viber: 'Viber',
  instagram: 'Instagram',
};
export const getAddOnTypeForTracking = (
  paymentType: AddOnsTypeDictType,
): string => {
  const addOnList = {
    agents: 'Users',
    contacts: 'Contacts',
    flow_builder_flow_enrolments: 'Flow Builder Enrolment',
    whatsapp_phone_number: 'WhatsApp Phone Number',
  };
  return addOnList[paymentType];
};
export const getChannelTypeObj = (channel: keyof typeof channelTypeMap) => {
  return { 'Channel Type': channelTypeMap[channel] };
};

export const getAuthType = (connectionStrategy?: ConnectionStrategy) => {
  if (connectionStrategy === CONNECTION_STRATEGY['google-oauth2']) {
    return 'Google';
  }
  if (connectionStrategy === CONNECTION_STRATEGY.apple) {
    return 'Apple';
  }
  if (connectionStrategy === CONNECTION_STRATEGY.adfs) {
    return 'Adfs';
  }
  if (connectionStrategy === CONNECTION_STRATEGY.openid) {
    return 'OpenID';
  }
  return 'Email';
};

export const getLanguage = (language?: string) => {
  if (language === 'zh-HK') {
    return 'Traditional Chinese';
  }
  if (language === 'zh-CN') {
    return 'Simplified Chinese';
  }
  if (language === 'pt-BR') {
    return 'Portuguese Brazil';
  }
  if (language === 'id') {
    return 'Bahasa Indonesia';
  }
  if (language === 'en') {
    return 'English';
  }
  return 'English';
};

export const getDeviceType = () => {
  const ua = window.navigator.userAgent;
  const tabletRegex = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i;
  const mobRegex =
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/;

  if (tabletRegex.test(ua)) return 'Tablet';
  if (mobRegex.test(ua)) return 'Mobile';
  return 'Desktop';
};
