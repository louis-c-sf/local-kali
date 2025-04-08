import { Typography } from '@mui/material';
import { useEffect, type ReactNode } from 'react';
import { Trans } from 'react-i18next';

import { useAuth } from '@/hooks/useAuth';
import { useRefetchPermission } from '@/hooks/usePermission';

import CommonAccessDeniedErrorElement from './CommonAccessDeniedErrorElement';

export interface AccessDeniedErrorElementProps {
  mode?: 'page' | 'component';
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  message?: ReactNode;
  error?: Error;
  componentStackTrace?: string;
}

function AccessDeniedErrorElement({
  mode = 'component',
  title,
  description,
  actions,
  message,
  error,
  componentStackTrace,
}: AccessDeniedErrorElementProps) {
  const { refetch } = useRefetchPermission();
  const { user, logout } = useAuth();

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <CommonAccessDeniedErrorElement
      mode={mode}
      title={title}
      description={description}
      actions={actions}
      error={error}
      componentStackTrace={componentStackTrace}
      message={
        message ? (
          message
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: 'grey.90',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              textAlign: 'center',
            }}
          >
            <Trans
              i18nKey="settings.error.access-denied.signed-in-as"
              values={{ email: user?.email }}
              defaults="You're currently signed in as <2>{{email}}</2>. <br/> Try <4>signing in</4> with another email to access this page."
            >
              You're currently signed in as {''}
              <strong>{user?.email}</strong>. Try
              <Typography
                component="span"
                sx={{ color: 'blue.90', cursor: 'pointer' }}
                onClick={() => {
                  logout({ logEvent: 'web_logout_in_access_denied' });
                }}
              >
                signing in
              </Typography>
              with another email to access this page.
            </Trans>
          </Typography>
        )
      }
    />
  );
}

export default AccessDeniedErrorElement;
