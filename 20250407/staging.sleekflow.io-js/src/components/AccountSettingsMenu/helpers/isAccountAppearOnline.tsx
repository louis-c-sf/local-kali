import { AppearOnlineDict } from '@/api/company';

export default function isAccountAppearOnline(status: string) {
  return status === AppearOnlineDict.Active;
}
