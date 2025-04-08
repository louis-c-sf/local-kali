import { Button, Stack, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';

import CommonErrorStateLayout from '@/components/CommonErrorStateLayout';
import Icon from '@/components/Icon';
import { ScrollArea } from '@/components/ScrollArea';
import { generateMarketingWebsiteURL } from '@/utils/v1-utils';

const DefaultResetAction = () => {
  const { t } = useTranslation();

  return (
    <Button
      variant="contained"
      onClick={() => {
        window.location.href = window.location.origin;
      }}
    >
      {t('error-refresh-button', { defaultValue: 'Refresh' })}
    </Button>
  );
};

export default function ServerErrorElement({
  mode = 'component',
  title,
  description,
  error,
  actions = <DefaultResetAction />,
  componentStackTrace,
}: {
  mode?: 'page' | 'component';
  actions?: React.ReactNode;
  description?: React.ReactNode;
  error?: unknown;
  title?: string;
  componentStackTrace?: string;
}) {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  return (
    <CommonErrorStateLayout
      mode={mode}
      title={title ?? t('server-error-title', { defaultValue: 'Server error' })}
      description={
        description ?? (
          <Trans
            i18nKey="server-error-description"
            defaults="The website is currently having server-error.<br/>Try refreshing the page or <2>get help</2>"
          >
            The website is currently having server-error. Try refreshing the
            page or{' '}
            <Typography
              variant="body1"
              sx={{ textDecoration: 'none' }}
              component="a"
              color="blue.90"
              href={generateMarketingWebsiteURL({
                language,
                path: '/contact',
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              get help
            </Typography>
          </Trans>
        )
      }
      icon={
        <Stack
          sx={{
            display: 'inline-flex',
            padding: '6px',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 999,
            backgroundColor: 'gray.10',
          }}
        >
          <Icon icon="alert-triangle" size={20} sx={{ color: 'darkBlue.70' }} />
        </Stack>
      }
      actions={
        <>
          {actions}
          {import.meta.env.DEV && error instanceof Error ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={2}
              mt="16px"
            >
              <Typography variant="headline2">{error.toString()}</Typography>
              <Stack
                border={1}
                borderColor="gray.30"
                borderRadius="8px"
                bgcolor="blue.10"
              >
                <ScrollArea maxHeight={300}>
                  <Typography component="pre">
                    {componentStackTrace ?? error.stack}
                  </Typography>
                </ScrollArea>
              </Stack>
            </Stack>
          ) : null}
        </>
      }
    />
  );
}
