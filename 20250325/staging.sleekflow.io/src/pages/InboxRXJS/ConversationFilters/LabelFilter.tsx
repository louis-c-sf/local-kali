import { Box, Chip } from '@mui/material';
import { useInjection } from 'inversify-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ComboBox, ComboboxOption } from '@/components/ComboBox';
import Icon from '@/components/Icon';
import { InputLabel } from '@/components/InputLabel';
import { LABELS_COLOR_MAPPING } from '@/constants/label';
import { useObservableEagerState } from '@/hooks/useObservableEagerState';
import { useTypedPosthog } from '@/posthog/useTypedPosthog';
import { LabelService } from '@/services/labels/label.service';

import { LabelColorOrders } from '../ConversationUserProfile/ContactSidebar/utils';
import { useGetConversationsFilter } from '../hooks/useGetConversationsFilter';

export default function LabelFilter() {
  const { t } = useTranslation();
  const labelService = useInjection<LabelService>(LabelService);
  const { getConversationsFilter, setGetConversationsFilter } =
    useGetConversationsFilter();
  const posthog = useTypedPosthog();

  const allLabels = useObservableEagerState(
    useMemo(() => labelService.getAllLabels$(), [labelService]),
    [],
  );

  const selectedIndices = useMemo(() => {
    const map = new Map<string, number>();

    // Map selected hashtags to their indices in the selectedHashtags array for order
    getConversationsFilter?.labelIds?.forEach((hashtag, index) => {
      map.set(hashtag, index);
    });

    return map;
  }, [getConversationsFilter?.labelIds]);

  const sorted = useMemo(
    () =>
      allLabels
        .sort((prev, next) => {
          // First, sort by color order
          const colorIndexPrev = LabelColorOrders.indexOf(prev.hashTagColor);
          const colorIndexNext = LabelColorOrders.indexOf(next.hashTagColor);
          if (colorIndexPrev !== colorIndexNext) {
            return colorIndexPrev - colorIndexNext;
          }

          // If colors are the same, sort alphabetically by color name
          return prev.hashtag.localeCompare(next.hashtag);
        })
        .sort((a, b) => {
          const indexA = selectedIndices.has(a.hashtag)
            ? selectedIndices.get(a.hashtag)
            : undefined;
          const indexB = selectedIndices.has(b.hashtag)
            ? selectedIndices.get(b.hashtag)
            : undefined;

          if (indexA !== undefined && indexB !== undefined) {
            return indexA - indexB; // Sort selected items among themselves
          }
          if (indexA !== undefined) return -1; // a is selected, so it should go before b
          if (indexB !== undefined) return 1; // b is selected, so it should go before a
          return 0;
        })
        .map((x) => x.id),
    [allLabels, selectedIndices],
  );

  function onLabelSelect(labelIds: string[]) {
    posthog.capture('inbox:select_inbox_search_filters_by_label', {});
    // const labelIds = getConversationsFilter.labelIds;
    setGetConversationsFilter({
      labelIds,
    });
  }

  return (
    <Box
      sx={{
        height: '100%',
        width: '260px',
        padding: (theme) => theme.spacing(1, 0.5, 0, 1.5),
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <InputLabel>{t('inbox.conversations-list.filters.labels')}</InputLabel>

      <ComboBox
        itemKey={(index, data) => data[index]}
        multiple
        listMode={'fixed'}
        getOptionLabel={(labelId) => {
          const label = allLabels.find((l) => l.id === labelId);

          if (!label) {
            return t('general.untitled-label');
          }
          return label.hashtag ?? t('general.untitled-label');
        }}
        onChange={(event, value) => {
          onLabelSelect(value);
        }}
        value={getConversationsFilter?.labelIds ?? []}
        renderOption={(props, labelId) => {
          const label = allLabels.find((l) => l.id === labelId);
          if (!label) {
            return null;
          }

          return (
            <ComboboxOption
              key={label.id}
              data-label-id={label.id}
              data-label-text={label.hashtag}
              {...props}
              sx={{ cursor: 'pointer' }}
            >
              <Chip
                key={label.id}
                label={label.hashtag}
                color={LABELS_COLOR_MAPPING[label.hashTagColor]}
                // BE cannot handle quick consecutive deletes, so we disable the button to prevent users from spamming
                {...(label.hashTagType === 'Shopify' && {
                  icon: <Icon icon="shopify" />,
                  color: 'lightGray',
                })}
                sx={{ m: '4px' }}
              />
            </ComboboxOption>
          );
        }}
        options={sorted}
      />
    </Box>
  );
}
