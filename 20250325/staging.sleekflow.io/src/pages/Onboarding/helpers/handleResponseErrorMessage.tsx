import { TFunction } from 'i18next';
import { RegisterFormData } from '../types';
import { UseFormReturn } from 'react-hook-form';
import { Snackbar } from '@/hooks/useSnackbar';

export const handleResponseErrorMessage = (
  error: Error | string,
  form: UseFormReturn<RegisterFormData, any>,
  t: TFunction,
  snackbar: Snackbar,
  setButtonDisabled: () => void,
) => {
  const errorMessage =
    typeof error === 'string'
      ? error
      : (error.message as
          | 'Username'
          | 'invalid'
          | 'Not enough agent quota'
          | string
          | 'password'
          | 'Password');

  if (errorMessage.toLowerCase().includes('username')) {
    if (
      errorMessage.includes('invalid') ||
      errorMessage.includes('characters')
    ) {
      form.setError('username', {
        message: t('onboarding.form.username-invalid', {
          defaultValue: 'Support alphabet and numbers only',
        }),
      });
      return;
    }
    if (
      errorMessage.includes('is already taken') ||
      errorMessage.includes('The specified new username already exists')
    ) {
      form.setError('username', {
        message: t('onboarding.form.username-taken', {
          defaultValue:
            'Username already exists. Please choose a different username',
        }),
      });
      return;
    }
  }

  if (
    (errorMessage.includes('User') &&
      errorMessage.includes('have registered a company')) ||
    (errorMessage.includes('Email') &&
      errorMessage.includes('is already taken'))
  ) {
    form.setError('email', {
      message: t('onboarding.form.email-registered', {
        defaultValue:
          'We couldn’t complete your registration. Please try again or contact us for support.',
      }),
    });
    return;
  }

  if (errorMessage.toLowerCase().includes('password')) {
    form.setError('password', {
      message: t('onboarding.form.password-not-strong-enough', {
        defaultValue: 'Password does not meet requirements',
      }),
    });
    return;
  }

  if (errorMessage.includes('Not enough agent quota')) {
    snackbar.error(
      t('onboarding.invitation.error.notEngouhAgentQuota', {
        defaultValue: 'Not enough agent quota',
      }),
    );
    return;
  }

  if (
    errorMessage.includes('Invalid token') ||
    errorMessage.includes('Token expired')
  ) {
    setButtonDisabled();
    snackbar.error(
      t('onboarding.invitation.error.invalidToken', {
        defaultValue:
          'The invitation link has expired. Please contact your workspace admin for support.',
      }),
    );
    return;
  }

  snackbar.error(
    t('onboarding.invitation.error.unknownErrorTryLater', {
      defaultValue: 'An unknown error occurred. Please try again later.',
    }),
  );
};
