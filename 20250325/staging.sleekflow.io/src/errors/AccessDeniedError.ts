import type { ReactNode } from 'react';
import type { To } from 'react-router-dom';

export const ipWhitelistingAccessDeniedError =
  'ipWhitelistingAccessDeniedError';

export class AccessDeniedError extends Error {
  title: string | undefined = undefined;
  description: ReactNode | undefined = undefined;
  action: { to?: To; label: string; onClick?: () => void } | undefined =
    undefined;
  // Because Error has a message property, we need to use a different name
  accessDeniedErrorMessage: ReactNode | undefined = undefined;

  constructor({
    title,
    description,
    action,
    accessDeniedErrorMessage,
    message,
    cause,
    name,
  }: {
    title?: string;
    description?: ReactNode;
    action?: { to?: To; label: string; onClick?: () => void };
    accessDeniedErrorMessage?: ReactNode;
    message?: string;
    cause?: Error;
    name?: string;
  } = {}) {
    super(message || 'Access denied', { cause });
    this.name = name || 'AccessDeniedError';
    title && (this.title = title);
    description && (this.description = description);
    action && (this.action = action);
    accessDeniedErrorMessage &&
      (this.accessDeniedErrorMessage = accessDeniedErrorMessage);
  }
}

export const isAccessDeniedError = (
  error: unknown,
): error is AccessDeniedError =>
  error instanceof AccessDeniedError && error.name === 'AccessDeniedError';

export const isIpWhitelistingAccessDeniedError = (
  error: unknown,
): error is AccessDeniedError =>
  error instanceof Error && error.name === ipWhitelistingAccessDeniedError;
