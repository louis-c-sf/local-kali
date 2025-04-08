import { TFunction } from 'i18next';
import { ErrorCode } from 'react-dropzone';

import { MessagingChannel } from '@/services/companies/company.service';
import { ChannelType } from '@/services/conversation-messages/managers/conversation-message-wrapper';
import { trackEvent, TRACKING_EVENTS } from '@/utils/mixpanelLibs';
import posthog from '@/posthog';

export const getFileValidationFn = (t: TFunction) => (file: File) => {
  // TODO: separate validations by channel and can aggregate in yup? The one below is testing logic for cloudapi
  const isSticker = file.type === 'image/webp';

  switch (true) {
    case isSticker:
      if (file.size > 500_000) {
        return {
          code: ErrorCode.FileTooLarge,
          message: t('conversation-input.sticker-file-upload-file-too-large', {
            defaultValue: 'The attached sticker exceeds the 500KB limit',
          }),
        };
      }
      break;
    case file.type.startsWith('image'):
      if (file.size > 5_000_000) {
        return {
          code: ErrorCode.FileTooLarge,
          message: t('conversation-input.image-file-upload-file-too-large', {
            defaultValue: 'The attached image exceeds the 5MB limit',
          }),
        };
      }
      break;
    case file.type.startsWith('audio'):
      if (file.size > 16_000_000) {
        return {
          code: ErrorCode.FileTooLarge,
          message: t('conversation-input.audio-file-upload-file-too-large', {
            defaultValue: 'The attached audio exceeds the 16MB limit',
          }),
        };
      }
      break;
    case file.type.startsWith('video'):
      if (file.size > 16_000_000) {
        return {
          code: ErrorCode.FileTooLarge,
          message: t('conversation-input.video-file-upload-file-too-large', {
            defaultValue: 'The attached video exceeds the 16MB limit',
          }),
        };
      }
      break;

    default:
      if (file.size > 100_000_000) {
        return {
          code: ErrorCode.FileTooLarge,
          message: t('conversation-input.document-file-upload-file-too-large', {
            defaultValue: 'The attached document exceeds the 100MB limit',
          }),
        };
      }
  }

  return null;
};

export const getInputOverlayColor = ({
  channelType,
}: {
  channelType: ChannelType;
}) => {
  switch (channelType) {
    case 'wechat': {
      return 'gray' as const;
    }
    default: {
      return 'white' as const;
    }
  }
};

export const trackMessageSentFromInbox = ({
  channelType,
  isScheduled,
}: {
  channelType: MessagingChannel['channelType'] | 'unknown' | 'note';
  isScheduled: boolean;
}) => {
  posthog.capture('inbox:send_message', {
    channelType: channelType,
    is_scheduled: isScheduled,
  });

  trackEvent(TRACKING_EVENTS.messageSentFromInbox, {
    Platform: 'Web v2',
    'Platform Version': 'Next',
    Channel: channelType,
  });
};

// The format of the filename is 'QuickReply/{id}/{timestamp}/fileName'
export const getSavedReplyFilename = (filename?: string | null) =>
  filename?.split('/').at(-1) || '';
