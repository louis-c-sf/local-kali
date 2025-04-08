import { TFunction } from 'i18next';

export type ConditionItemType = {
  id: string;
  label: string;
  regex: RegExp;
  type: 'required' | 'optional';
};
export const getPasswordConditions = (t: TFunction): ConditionItemType[] => [
  {
    id: 'minLength',
    label: t('password.requirement.min-length', {
      defaultValue: 'At least 8 characters',
    }),
    regex: /.{8,}/,
    type: 'required',
  },
  {
    id: 'special',
    label: t('password.requirement.special', 'Special characters (!@#$%^&*)'),
    regex: /[?!@#$%^&*.,:;\-+=_[\]()<>\\|/]+/,
    type: 'optional',
  },
  {
    id: 'lowercase',
    label: t('password.requirement.lowercase', {
      defaultValue: 'Lowercase letters (a-z)',
    }),
    regex: /[a-z]/,
    type: 'optional',
  },
  {
    id: 'uppercase',
    label: t('password.requirement.uppercase', {
      defaultValue: 'Uppercase letters (A-Z)',
    }),
    regex: /[A-Z]/,
    type: 'optional',
  },
  {
    id: 'numbers',
    label: t('password.requirement.numbers', {
      defaultValue: 'Numbers (0-9)',
    }),
    regex: /[0-9]/,
    type: 'optional',
  },
];
