import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function AppLoading({
  withoutNavbar,
}: {
  withoutNavbar?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Stack height="100svh" width="100vw" direction="row">
      {!withoutNavbar ? (
        <Stack direction="row">
          <Box width={76} height="100svh" sx={{ bgcolor: 'darkBlue.90' }} />
          <Box
            width={240}
            height="100svh"
            sx={{
              bgcolor: 'blue.10',
              borderRight: '1px solid',
              borderColor: 'gray.30',
            }}
          />
        </Stack>
      ) : null}
      <Stack flex={1}>
        <Stack
          height={65}
          width="100%"
          justifyContent="center"
          px="2rem"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'gray.30',
          }}
        />
        <Stack flex={1} justifyContent="center" alignItems="center">
          <CircularProgress sx={{ mb: '8px' }} />
          <Typography variant="body2">{t('general.loading')}</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}
