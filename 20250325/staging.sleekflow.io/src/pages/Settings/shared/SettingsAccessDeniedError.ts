import { HttpStatusCodeDict } from '@/api/types';

export class SettingsAccessDeniedError extends Error {
  title = '';
  description = '';
  status = HttpStatusCodeDict.forbidden as number;
  constructor({
    title,
    description,
    status = HttpStatusCodeDict.forbidden,
  }: {
    title?: string;
    description?: string;
    status?: number;
  } = {}) {
    super(title ?? 'Settings Access Denied error');
    title && (this.title = title);
    description && (this.description = description);
    status && (this.status = status);
  }
}

export const isSettingsAccessDeniedError = (
  error: unknown,
): error is SettingsAccessDeniedError => {
  return error instanceof SettingsAccessDeniedError;
};
export default SettingsAccessDeniedError;
