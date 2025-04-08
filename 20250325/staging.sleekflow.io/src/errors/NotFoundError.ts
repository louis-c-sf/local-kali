import type { ReactNode } from 'react';
import { To } from 'react-router-dom';

export class NotFoundError extends Error {
  title: string | undefined = undefined;
  description: ReactNode | undefined = undefined;
  action: { to: To; label: string } | undefined = undefined;

  constructor({
    title,
    description,
    action,
    message,
    cause,
  }: {
    title?: string;
    description?: ReactNode;
    action?: { to: To; label: string };
    message?: string;
    cause?: Error;
  } = {}) {
    super(message || 'Not found', { cause });
    this.name = 'NotFoundError';
    title && (this.title = title);
    description && (this.description = description);
    action && (this.action = action);
  }
}

export const isNotFoundError = (error: unknown): error is NotFoundError =>
  error instanceof NotFoundError && error.name === 'NotFoundError';
