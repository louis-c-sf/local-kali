import { Box, Button, Stack, Typography } from '@mui/material';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import CommonErrorStateLayout from '@/components/CommonErrorStateLayout';
import Icon from '@/components/Icon';
import { ScrollArea } from '@/components/ScrollArea';

const DefaultBackAction = () => {
  const { t } = useTranslation();

  return (
    <Button to="/" component={Link} variant="contained">
      {t('access-denied-back-button', {
        defaultValue: 'Back',
      })}
    </Button>
  );
};

export interface CommonAccessDeniedErrorElementProps {
  mode?: 'page' | 'component';
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  message?: ReactNode;
  error?: Error;
  componentStackTrace?: string;
}

function CommonAccessDeniedErrorElement({
  mode = 'component',
  title,
  description,
  actions = <DefaultBackAction />,
  message,
  error,
  componentStackTrace,
}: CommonAccessDeniedErrorElementProps) {
  const { t } = useTranslation();

  return (
    <CommonErrorStateLayout
      mode={mode}
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
          <Icon icon="lock" size={20} sx={{ color: 'darkBlue.70' }} />
        </Stack>
      }
      title={
        title ??
        t('access-denied-title', {
          defaultValue: 'Access denied',
        })
      }
      description={
        description ??
        t('access-denied-description', {
          defaultValue:
            "You don't have permission to access this page.\nPlease contact your admin for support.",
        })
      }
      actions={
        <>
          {actions}
          {message && (
            <>
              <Box
                sx={{
                  height: '1px',
                  width: '346px',
                  backgroundColor: 'gray.30',
                  my: 3,
                }}
              />
              {message}
            </>
          )}
          {import.meta.env.DEV && error ? (
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

export default CommonAccessDeniedErrorElement;
