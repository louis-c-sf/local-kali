import { Button } from '@mui/material';
import * as Sentry from '@sentry/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import AccessDeniedErrorElement from '@/components/AccessDeniedErrorElement';
import ServerErrorElement from '@/components/ServerErrorElement';
import { isAccessDeniedError } from '@/errors/AccessDeniedError';

export default function GlobalErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <Sentry.ErrorBoundary
      fallback={({ error, componentStack, resetError }) => {
        if (isAccessDeniedError(error)) {
          return (
            <AccessDeniedErrorElement
              message={error.accessDeniedErrorMessage}
              mode="page"
              error={error}
              componentStackTrace={componentStack}
              description={error.description}
              actions={
                error.action ? (
                  <Button
                    {...(error.action.to
                      ? { component: Link, to: error.action.to }
                      : {})}
                    {...(error.action.onClick
                      ? { onClick: error.action.onClick }
                      : {})}
                    variant="contained"
                  >
                    {error.action.label}
                  </Button>
                ) : undefined
              }
            />
          );
        }
        return (
          <ServerErrorElement
            mode="page"
            error={error}
            componentStackTrace={componentStack}
            actions={
              <Button
                variant="contained"
                onClick={() => {
                  /* When resetError() is called it will remove the Fallback component */
                  /* and render the Sentry ErrorBoundary's children in their initial state */
                  window.location.href = window.location.origin;
                  resetError();
                }}
              >
                {t('error-refresh-button', { defaultValue: 'Refresh' })}
              </Button>
            }
          />
        );
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
