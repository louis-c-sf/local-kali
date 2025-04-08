import { useInjection } from 'inversify-react';
import { useObservableEagerState } from 'observable-hooks';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { CompanyService } from '@/services/companies/company.service';

const useMessagingChannels = (
  options: {
    includeSMSChannel?: boolean;
    includeNoteChannel?: boolean;
  } = {},
) => {
  const { includeSMSChannel = true, includeNoteChannel = false } = options;
  const { t } = useTranslation();
  const companyService = useInjection(CompanyService);

  const displayableMessageChannels = useObservableEagerState(
    companyService.getDisplayableMessageChannels$(),
  );

  const isLoading = useObservableEagerState(
    useMemo(
      () => companyService.getIsLoadingDisplayableMessageChannels$(),
      [companyService],
    ),
  );

  return {
    isLoading,
    allMessagingChannels: useMemo(
      () =>
        displayableMessageChannels
          .map((channel) => {
            if (channel.channelType === 'web') {
              return {
                ...channel,
                channelDisplayName: t('inbox.live-chat-channel'),
              };
            }
            if (channel.channelType === 'note') {
              return {
                ...channel,
                channelDisplayName: t('inbox.internal-note-channel', {
                  defaultValue: 'Internal Note',
                }),
              };
            }
            return channel;
          })
          .filter((channel) => {
            if (channel.channelType === 'sms') {
              return includeSMSChannel;
            }
            if (channel.channelType === 'note') {
              return includeNoteChannel;
            }
            return true;
          }),
      [displayableMessageChannels, includeNoteChannel, includeSMSChannel, t],
    ),
  };
};

export default useMessagingChannels;
