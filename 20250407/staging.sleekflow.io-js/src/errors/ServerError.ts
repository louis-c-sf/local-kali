import { ReactNode } from 'react';
import { To } from 'react-router-dom';

export class ServerError extends Error {
  title: string | undefined = undefined;
  description: ReactNode | undefined = undefined;
  action: { to: To; label: string } | undefined = undefined;
  constructor({
    message,
    title,
    description,
    action,
  }: {
    message?: string;
    action?: { to: To; label: string };
    description?: ReactNode;
    title?: string;
  } = {}) {
    super(message || 'Server error');
    this.name = 'ServerError';
    title && (this.title = title);
    description && (this.description = description);
    action && (this.action = action);
  }
}

export const isServerError = (error: unknown): error is ServerError =>
  error instanceof ServerError && error.name === 'ServerError';
