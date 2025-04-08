import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import EmptyResult from '@/components/EmptyResult';

export default function ConversationListEmptyResult() {
  const { t } = useTranslation();
  return (
    <Stack
      sx={{
        width: '100%',
        padding: (theme) => theme.spacing(4, 2),
        textAlign: 'center',
      }}
    >
      <EmptyResult
        icon={'message-x-square'}
        title={t('inbox.conversation-list.no-results-found-title', {
          defaultValue: 'No results found',
        })}
        description={t('inbox.conversation-list.no-results-found-description', {
          defaultValue:
            "We couldn't find what you're looking for. Please note that results will only show conversations from up to one year ago. ",
        })}
      />
    </Stack>
  );
}
