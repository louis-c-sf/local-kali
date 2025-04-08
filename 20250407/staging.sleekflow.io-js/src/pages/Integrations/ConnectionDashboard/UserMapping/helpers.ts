import { getFullName } from '@/utils/formatting';
import { ProviderKey } from '../../integrations';

import { TFunction } from 'react-i18next';

// This function used because BE response is different for different integrator types
// Ask BE devs to know the response structure when there is a new integrator type

export function getProviderUserByIntegratorType(
  providerKey: ProviderKey,
  userObject: any,
  t: TFunction,
) {
  switch (providerKey) {
    case 'salesforce-integrator':
      return {
        displayName: getFullName({
          firstName: userObject.FirstName,
          lastName: userObject.LastName,
          fallback: t('general.unknown-label'),
        }),
        email: userObject.Email,
        id: userObject.Id,
      };
    case 'hubspot-integrator':
      return {
        displayName: getFullName({
          firstName: userObject.firstName,
          lastName: userObject.lastName,
          fallback: t('general.unknown-label'),
        }),
        email: userObject.email,
        id: userObject.id,
      };
    case 'zoho-integrator':
      return {
        displayName: getFullName({
          firstName: userObject.first_name,
          lastName: userObject.last_name,
          fallback: t('general.unknown-label'),
        }),
        email: userObject.email,
        id: userObject.id,
      };
    default:
      return {
        displayName: t('general.unknown-label'),
        email: t('general.unknown-label'),
        id: '',
      };
  }
}

export function getIntegratorObjectFields(providerKey: ProviderKey) {
  switch (providerKey) {
    case 'salesforce-integrator':
      return [
        { name: 'Id' },
        { name: 'FirstName' },
        { name: 'LastName' },
        { name: 'Email' },
        { name: 'Phone' },
      ];
    case 'hubspot-integrator':
      return [
        { name: 'id' },
        { name: 'firstName' },
        { name: 'lastName' },
        { name: 'email' },
      ];
    default:
      return [];
  }
}
