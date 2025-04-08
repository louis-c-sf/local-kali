import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function SearchTips() {
  const { t } = useTranslation();

  return (
    <Stack
      direction="column"
      spacing={3}
      sx={{
        p: '12px 16px',
        backgroundColor: 'gray.5',
      }}
    >
      <Typography variant="body1" fontSize={14} sx={{ pl: '14px' }}>
        💡{t('inbox.universal-search.tips')}
      </Typography>
    </Stack>
  );
}
