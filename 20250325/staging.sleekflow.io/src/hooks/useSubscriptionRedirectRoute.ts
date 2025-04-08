import { ROUTES } from '@/constants/navigation';

import { useRouteWithLocale } from './useRouteWithLocale/useRouteWithLocale';

export function useSubscriptionRedirectRoute() {
  const routeTo = useRouteWithLocale();

  return routeTo(ROUTES.settingsSubscriptions).toString();
}
