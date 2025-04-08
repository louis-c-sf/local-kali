import type { TFunction } from 'react-i18next';

export const getIsUnsupportedMessage = ({
  messageContent,
}: {
  messageContent: string;
}) => {
  return messageContent === '<Unsupported Message Type>';
};

export const AI_HANDOVER_SYMBOL = '[[SLEEKFLOW_AI_HANDOVER]]';
export const isAiHandoverMessage = (messageContent?: string) =>
  !!messageContent?.startsWith(AI_HANDOVER_SYMBOL);
export const formatAiHandoverMessage = (messageContent = '', t: TFunction) =>
  messageContent
    .replace(AI_HANDOVER_SYMBOL, '')
    .replace(
      '[[HEADER_CONTEXT]]',
      t('inbox.ai-handover-message.header-context', 'Context:'),
    )
    .replace(
      '[[HEADER_HANDOVER_REASON]]',
      t(
        'inbox.ai-handover-message.header-handover-reason',
        'Reason for handover:',
      ),
    )
    .replace(
      '[[HEADER_LEAD_SCORE]]',
      t('inbox.ai-handover-message.header-lead-score', 'Lead score:'),
    )
    .trim();
