import { Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { ReactComponent as FullLogo } from '@/assets/logo/sleekflow-logo-full.svg';

const CommonErrorStateLayout = (props: {
  mode: 'page' | 'component';
  title?: ReactNode;
  description?: ReactNode;
  icon: ReactNode;
  actions: ReactNode;
}) => {
  const { t } = useTranslation();
  const {
    mode,
    title = t('general.something-went-wrong.title', {
      defaultValue: 'Something went wrong',
    }),
    description = t('general.something-went-wrong.description', {
      defaultValue: 'Something went wrong',
    }),
    icon,
    actions,
  } = props;

  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        ...(mode === 'page'
          ? {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'white',
              zIndex: 1001,
            }
          : {}),
      }}
    >
      {mode === 'page' && (
        <FullLogo style={{ position: 'absolute', top: '40px', left: '80px' }} />
      )}
      <Stack
        sx={{
          padding: '20px 16px',
          gap: 1,
          alignItems: 'center',
        }}
      >
        {icon}
        <Typography
          variant="headline2"
          sx={{ color: 'darkBlue.90', textAlign: 'center' }}
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'gray.90',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            textAlign: 'center',
            maxWidth: '48em',
          }}
        >
          {description}
        </Typography>
      </Stack>
      {actions}
    </Stack>
  );
};

export default CommonErrorStateLayout;
