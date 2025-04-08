import { BroadcastStatus } from '@/api/types';
import { IconProps } from '@/components/Icon';

export const CHANNEL = {
  whatsappTwilio: 'whatsapp',
  whatsapp360Dialog: 'whatsapp360dialog',
  whatsappCloudApi: 'whatsappcloudapi',
  facebook: 'facebook',
  line: 'line',
  wechat: 'wechat',
  note: 'note',
  sms: 'sms',
  telegram: 'telegram',
  viber: 'viber',
} as const;

export type ChannelType = typeof CHANNEL[keyof typeof CHANNEL];

export interface ChannelOptionType {
  value: ChannelType;
  title: string;
  description: string;
  unavailable: string;
  icon: IconProps['icon'];
  iconType: 'svg' | 'png';
}

export const CHANNELS: ChannelOptionType[] = [
  {
    value: CHANNEL.whatsappCloudApi,
    // t('broadcast.create.whatsapp.cloud-api.title')
    title: 'broadcast.create.whatsapp.cloud-api.title',
    // t('broadcast.create.whatsapp.cloud-api.description')
    description: 'broadcast.create.whatsapp.cloud-api.description',
    // t('broadcast.create.whatsapp.cloud-api.unavailable-message')
    unavailable: 'broadcast.create.whatsapp.cloud-api.unavailable-message',
    icon: 'whatsapp',
    iconType: 'svg',
  },
  {
    value: CHANNEL.whatsapp360Dialog,
    // t('broadcast.create.whatsapp.360-dialog.title')
    title: 'broadcast.create.whatsapp.360-dialog.title',
    // t('broadcast.create.whatsapp.360-dialog.description')
    description: 'broadcast.create.whatsapp.360-dialog.description',
    // t('broadcast.create.whatsapp.360-dialog.unavailable-message')
    unavailable: 'broadcast.create.whatsapp.360-dialog.unavailable-message',
    icon: 'whatsapp',
    iconType: 'svg',
  },
  {
    value: CHANNEL.whatsappTwilio,
    // t('broadcast.create.whatsapp.twillio.title')
    title: 'broadcast.create.whatsapp.twillio.title',
    // t('broadcast.create.whatsapp.twillio.description')
    description: 'broadcast.create.whatsapp.twillio.description',
    // t('broadcast.create.whatsapp.twillio.unavailable-message')
    unavailable: 'broadcast.create.whatsapp.twillio.unavailable-message',
    icon: 'whatsapp',
    iconType: 'svg',
  },
  {
    value: CHANNEL.facebook,
    // t('broadcast.create.facebook.messenger.title')
    title: 'broadcast.create.facebook.messenger.title',
    // t('broadcast.create.facebook.messenger.description')
    description: 'broadcast.create.facebook.messenger.description',
    // t('broadcast.create.facebook.messenger.unavailable-message')
    unavailable: 'broadcast.create.facebook.messenger.unavailable-message',
    icon: 'messenger',
    iconType: 'svg',
  },
  {
    value: CHANNEL.line,
    // t('broadcast.create.line.title')
    title: 'broadcast.create.line.title',
    // t('broadcast.create.line.description')
    description: 'broadcast.create.line.description',
    // t('broadcast.create.line.unavailable-message')
    unavailable: 'broadcast.create.line.unavailable-message',
    icon: 'line',
    iconType: 'svg',
  },
  {
    value: CHANNEL.sms,
    // t('broadcast.create.sms.title')
    title: 'broadcast.create.sms.title',
    // t('broadcast.create.sms.description')
    description: 'broadcast.create.sms.description',
    // t('broadcast.create.sms.unavailable-message')
    unavailable: 'broadcast.create.sms.unavailable-message',
    icon: 'sms',
    iconType: 'svg',
  },
  {
    value: CHANNEL.wechat,
    // t('broadcast.create.wechat.title')
    title: 'broadcast.create.wechat.title',
    // t('broadcast.create.wechat.description')
    description: 'broadcast.create.wechat.description',
    // t('broadcast.create.wechat.unavailable-message')
    unavailable: 'broadcast.create.wechat.unavailable-message',
    icon: 'wechat',
    iconType: 'svg',
  },
  {
    value: CHANNEL.telegram,
    // t('broadcast.create.telegram.title')
    title: 'broadcast.create.telegram.title',
    // t('broadcast.create.telegram.description')
    description: 'broadcast.create.telegram.description',
    // t('broadcast.create.telegram.unavailable-message')
    unavailable: 'broadcast.create.telegram.unavailable-message',
    icon: 'telegram',
    iconType: 'svg',
  },
  {
    value: CHANNEL.viber,
    // t('broadcast.create.viber.title')
    title: 'broadcast.create.viber.title',
    // t('broadcast.create.viber.description')
    description: 'broadcast.create.viber.description',
    // t('broadcast.create.viber.unavailable-message')
    unavailable: 'broadcast.create.viber.unavailable-message',
    icon: 'viber',
    iconType: 'svg',
  },
  {
    value: CHANNEL.note,
    // t('broadcast.create.note.title')
    title: 'broadcast.create.note.title',
    // t('broadcast.create.note.description')
    description: 'broadcast.create.note.description',
    // t('broadcast.create.note.unavailable-message')
    unavailable: 'broadcast.create.note.unavailable-message',
    icon: 'notification-text',
    iconType: 'svg',
  },
];

export const INTERACTIVE_BUTTON_TYPE = {
  none: 'NONE',
  quickReply: 'QUICK_REPLY',
  cta: 'CTA',
} as const;

//TODO: inappropriate naming, should be INTERACTIVE_BUTTON_OPTIONS
export const INTERACTIVE_BUTTONS = [
  {
    label: 'none',
    value: INTERACTIVE_BUTTON_TYPE.none,
  },
  {
    label: 'quick-reply',
    value: INTERACTIVE_BUTTON_TYPE.quickReply,
  },
  {
    label: 'call-to-action',
    value: INTERACTIVE_BUTTON_TYPE.cta,
  },
] as const;

export type InteractiveButtonType =
  typeof INTERACTIVE_BUTTON_TYPE[keyof typeof INTERACTIVE_BUTTON_TYPE];

export const STATUS_COLOR = {
  Error: 'red',
  'Exceeded Quota': 'red',
  Completed: 'forest',
  Processing: 'gray',
  Queued: 'gray',
  Scheduled: 'mustard',
  Draft: 'gray',
  Sent: 'forest',
  Sending: 'mustard',
  Paused: 'mustard',
} as const;

export const MATCH_DOUBLE_CURLY_BRACES_NUMBER_REGEX = /{{\d+}}/gm;
export const MATCH_DOUBLE_CURLY_BRACES_CAPTURE_NUMBER_GROUP_REGEX =
  /{{(\d+)}}/gm;
export const MATCH_CAPTURE_DOUBLE_CURLY_BRACES_NUMBER_GROUP_REGEX =
  /({{\d+}})/gm;
export const MATCH_SINGLE_CURLY_BRACES_NUMBER_REGEX = /{\d+}/gm;

export const BROADCAST_STATUS_TRANSLATION_KEY_MAP: Record<
  BroadcastStatus,
  string
> = {
  Error: 'error',
  Completed: 'completed',
  Processing: 'processing',
  Queued: 'queued',
  Scheduled: 'scheduled',
  Draft: 'draft',
  Sent: 'sent',
  Sending: 'sending',
  Paused: 'paused',
  'Exceeded Quota': 'exceededQuota',
} as const;
