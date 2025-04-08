import { useCallback } from 'react';
import { PLAN_KEYS, TIERS, useGetPlanKeyAndTier } from './useGetPlanKeyAndTier';

const BASE_URL = 'https://sleekflow.io/api/draft';
const SECRET = '5qJIyOzQGBb8TbjAGl';

type BlogURLConfig = Record<
  (typeof PLAN_KEYS)[keyof typeof PLAN_KEYS],
  Partial<Record<(typeof TIERS)[keyof typeof TIERS], string>>
>;

const BLOG_URL_CONFIG: BlogURLConfig = {
  [PLAN_KEYS.PRO_MONTHLY]: {
    [TIERS.TIER1]: 'pricing-updates-2025-pro-monthly-852',
    [TIERS.TIER2]: 'pricing-updates-2025-pro-monthly-852',
    [TIERS.TIER4]: 'pricing-updates-2025-pro-monthly-60',
    [TIERS.TIER5]: 'pricing-updates-2025-pro-monthly-62',
  },
  [PLAN_KEYS.PRO_YEARLY]: {
    [TIERS.TIER1]: 'pricing-updates-2025-pro-yearly-852',
    [TIERS.TIER2]: 'pricing-updates-2025-pro-yearly-852',
    [TIERS.TIER4]: 'pricing-updates-2025-pro-yearly-60',
    [TIERS.TIER5]: 'pricing-updates-2025-pro-yearly-62',
  },
  [PLAN_KEYS.PREMIUM_MONTHLY]: {
    [TIERS.TIER1]: 'pricing-updates-2025-premium-monthly-852',
  },
  [PLAN_KEYS.PREMIUM_YEARLY]: {
    [TIERS.TIER1]: 'pricing-updates-2025-premium-yearly-852',
  },
};

export const useGetBlogURLByTier = () => {
  const { planKey, tier: subscriptionCountryTier } = useGetPlanKeyAndTier();

  const getBlogURLByTier = useCallback(() => {
    if (!planKey || !subscriptionCountryTier) return '';

    const slug = BLOG_URL_CONFIG[planKey]?.[subscriptionCountryTier];

    if (!slug) return '';

    const params = new URLSearchParams({
      contentType: 'blog',
      slug,
      locales: 'en-sg,en-gb,en',
      secret: SECRET,
    });

    return `${BASE_URL}?${params.toString()}`;
  }, [planKey, subscriptionCountryTier]);

  return { getBlogURLByTier };
};
