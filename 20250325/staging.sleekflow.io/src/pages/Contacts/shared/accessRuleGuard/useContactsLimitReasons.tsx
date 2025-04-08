import { useTranslation } from 'react-i18next';

import { formatNumber } from '@/i18n/number/formatNumber';

import { useMyProfile } from '../../../../hooks/useMyProfile';
import { useSuspenseCompanyAccessRuleGuard } from './useAccessRuleGuard';
import useContactsFeatureFlags from './useContactsFeatureFlags';

export function useContactsLimitReasons() {
  const { t } = useTranslation();
  const accessRulesGuard = useSuspenseCompanyAccessRuleGuard();
  const totalContacts = accessRulesGuard.data?.totalContacts ?? 0;
  const maximumContacts = accessRulesGuard.data?.maximumContacts ?? 0;
  const myProfile = useMyProfile();
  const isReadOnlyError = myProfile.data?.roleType !== 'Admin';
  const { isWithinContactsLimit } = useContactsFeatureFlags();

  const readonlyReason = {
    title: t('contacts.block-user-contact-limit.title', {
      defaultValue: 'Exceeded contact limit',
    }),
    description: t('contacts.block-user-contact-limit.readonly-description', {
      amount: formatNumber(maximumContacts),
      defaultValue:
        'You have reached the contact limit of {amount}. You cannot add any new contact at the moment.',
    }),
  };

  const editableReason = {
    title: t('contacts.block-user-contact-limit.title', {
      defaultValue: 'Exceeded contact limit',
    }),
    description: t('contacts.block-user-contact-limit.editable-description', {
      amount: formatNumber(maximumContacts),
      defaultValue:
        'You have reached the contact limit of {amount}. You cannot add any new contact at the moment. To view and add new contacts, please purchase extra limit or upgrade plan.',
    }),
  };

  return {
    readonlyReason,
    editableReason,
    isReadOnlyError,
    isLimitExceeded: !isWithinContactsLimit,
    countOverLimit: totalContacts - maximumContacts,
  };
}
