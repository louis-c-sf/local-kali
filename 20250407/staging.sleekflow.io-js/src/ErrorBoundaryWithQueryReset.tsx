import * as Sentry from '@sentry/react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

const ErrorBoundaryWithQueryReset = ({
  children,
  onReset,
  ...props
}: Sentry.ErrorBoundaryProps) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <Sentry.ErrorBoundary
          onReset={(...args) => {
            reset();
            onReset?.(...args);
          }}
          {...props}
        >
          {children}
        </Sentry.ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

export default ErrorBoundaryWithQueryReset;
