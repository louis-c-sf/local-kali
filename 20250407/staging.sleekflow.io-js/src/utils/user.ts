import type { User } from '@auth0/auth0-react';
import dayjs from 'dayjs';

const tryParseJSON = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (_e) {
    return null;
  }
};

type DiveUser = {
  company_id: string;
  expire_at: Date;
  staff_id: number;
  user_id: string;
};

export const USER_ID_KEY = 'https://app.sleekflow.io/user_id';

export function getUserId({ user }: { user?: User }): string {
  const stringifiedDiveUserInfo =
    user?.['https://app.sleekflow.io/login_as_user'];
  const diveUserInfo: DiveUser | null = stringifiedDiveUserInfo
    ? tryParseJSON(stringifiedDiveUserInfo)
    : null;
  const diveTimeRemaining = diveUserInfo?.expire_at
    ? dayjs(diveUserInfo?.expire_at).diff(dayjs(), 'seconds')
    : 0;

  const userId =
    diveTimeRemaining > 0 && diveUserInfo
      ? diveUserInfo.user_id
      : user?.[USER_ID_KEY] || '';
  return userId;
}
