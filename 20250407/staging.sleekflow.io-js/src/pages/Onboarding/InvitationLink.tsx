import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Typography, FormControl, FormLabel } from '@mui/material';
import { TFunction } from 'i18next';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation, Trans } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-use';
import * as yup from 'yup';

import { useGetCurrentCountryQuery } from '@/api/common';
import useCompleteEmailInvitation, {
  LinkInvitationResponse,
  useCompleteLinkInvitation,
  EmailInvitationResponse,
} from '@/api/tenantHub';
import { Button } from '@/components/Button';
import HookFormPhoneInput from '@/components/hook-form-inputs/HookFormPhoneInput';
import HookFormTextField from '@/components/hook-form-inputs/HookFormTextField';
import { useAuth } from '@/hooks/useAuth';
import useSnackbar from '@/hooks/useSnackbar';
import PasswordField from '@/pages/Onboarding/PasswordField';
import { colors } from '@/themes';

import {
  getPhoneNumberMaxLength,
  isCustomValidPhoneNumber,
} from '../Contacts/shared/utils';
import TimezoneField from './TimezoneField';
import { getPasswordConditions } from './helpers/getPasswordConditions';
import { handleResponseErrorMessage } from './helpers/handleResponseErrorMessage';
import { RegisterFormData } from './types';

const TERMS_OF_SERVICE_URL = 'https://sleekflow.io/terms';
const getRequiredErrorMessage = (t: TFunction) =>
  t('common.required', { defaultValue: 'Required' });

export const registerSchema = (t: TFunction, type: string) =>
  yup.object().shape({
    ...(type === 'link' && {
      email: yup
        .string()
        .trim()
        .email(
          t('onboarding.form.email-invalid', {
            defaultValue: 'Please enter a valid email address',
          }),
        )
        .required(getRequiredErrorMessage(t)),
    }),
    firstName: yup
      .string()
      .ensure()
      .trim()
      .required(getRequiredErrorMessage(t)),

    lastName: yup.string().ensure().trim().required(getRequiredErrorMessage(t)),

    username: yup
      .string()
      .trim()
      .required(getRequiredErrorMessage(t))
      .matches(
        /^[a-zA-Z0-9]+$/,
        t('onboarding.form.username-alphanumeric', {
          defaultValue: 'Support alphabet and numbers only',
        }),
      )
      .min(
        3,
        t('onboarding.form.username-min-length', {
          defaultValue: 'Username must be at least 3 characters long',
        }),
      ),
    password: yup
      .string()
      .required(getRequiredErrorMessage(t))
      .ensure()
      .test(
        'Password should meet requirements',
        t('common.password', {
          defaultValue: 'Password does not meet requirements',
        }),
        (value) => {
          if (!value) return false;
          const conditions = getPasswordConditions(t);
          const requiredMet = conditions[0].regex.test(value);
          const optionalMetCount = conditions
            .slice(1)
            .filter((cond) => cond.regex.test(value)).length;
          return requiredMet && optionalMetCount >= 3;
        },
      ),
    position: yup.string().ensure().trim().required(getRequiredErrorMessage(t)),
    phoneNumber: yup
      .string()
      .ensure()
      .trim()
      .test(
        'should be a valid phone number',
        t('onboarding.form.invalid-phone', {
          defaultValue: 'Invalid phone number',
        }),
        (value) => {
          const transformedPhoneNumber = `+${value}`;
          return isCustomValidPhoneNumber(transformedPhoneNumber);
        },
      )
      .required(getRequiredErrorMessage(t)),

    timezone: yup.string().ensure().required(getRequiredErrorMessage(t)),
  });

export default function InvitationLink() {
  const { t } = useTranslation();
  //example invitation link url from email: http://localhost:5173/en/invitation-link/email/{user_id}/eastasia?emailcode={emailCode}&tenanthubUserId={tenanthubUserId}
  //example invitation link url from link: http://localhost:5173/en/invitation-link/link/{shareable_id}/eastasia
  const {
    type = 'link',
    id = '',
    location: locationParam = 'eastasia',
  } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tenanthubUserId = queryParams.get('tenanthubUserId') || '';
  const emailCode = queryParams.get('emailcode') || '';

  const [phoneNumberMaxLength, setPhoneNumberMaxLength] = useState<number>(0);
  const form = useForm<RegisterFormData>({
    defaultValues: {
      ...(type === 'link' && { email: '' }),
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      position: '',
      phoneNumber: '',
    },
    resolver: yupResolver(registerSchema(t, type)),
    mode: 'onSubmit',
  });
  const {
    watch,
    control,
    formState: { errors },
  } = form;
  const { logout } = useAuth();
  const snackbar = useSnackbar();
  const [submittedButtonDisabled, setSubmittedButtonDisabled] = useState(false);

  const onSuccessCallback = (
    data: LinkInvitationResponse | EmailInvitationResponse,
  ) => {
    if (type === 'email' && data.data?.message && data.data?.message !== 'ok') {
      handleResponseErrorMessage(data.data?.message, form, t, snackbar, () =>
        setSubmittedButtonDisabled(true),
      );
    } else {
      setSubmittedButtonDisabled(true);
      snackbar.info(
        t(
          'onboarding.create-account.success',
          'You have successfully created an account!',
        ),
      );
      setTimeout(() => {
        logout({
          logEvent: 'web_logout_after_create_account_successfully',
        });
      }, 2000);
    }
  };

  const linkInvitationMutation = useCompleteLinkInvitation({
    onSuccess: onSuccessCallback,
    onError: (error) => {
      handleResponseErrorMessage(error, form, t, snackbar, () =>
        setSubmittedButtonDisabled(true),
      );
    },
  });
  //This api's error message is in the onSuccess data.data.message
  const emailInvitationMutation = useCompleteEmailInvitation({
    onSuccess: onSuccessCallback,
  });

  const onSubmit = (data: RegisterFormData) => {
    if (type === 'link') {
      linkInvitationMutation.mutate({
        invite_shared_user_object: {
          email: data.email,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          displayName: `${data.firstName} ${data.lastName}`,
          password: data.password,
          confirmPassword: data.password,
          phoneNumber: data.phoneNumber,
          position: data.position,
          timeZoneInfoId: data.timezone,
        },
        location: locationParam,
        shareableId: id,
      });
    } else if (type === 'email') {
      emailInvitationMutation.mutate({
        username: data.username,
        tenanthub_user_id: tenanthubUserId,
        sleekflow_user_id: id,
        displayName: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        password: data.password,
        token: emailCode,
        position: data.position,
        timeZoneInfoId: data.timezone,
        location: locationParam,
      });
    }
  };
  const { data: currentCountry, isLoading: isCountryQueryLoading } =
    useGetCurrentCountryQuery();
  const country = currentCountry?.countryCode2.toLocaleLowerCase() || 'hk';

  const number = watch('phoneNumber');
  const possibleMaxLengths = getPhoneNumberMaxLength(number);
  useEffect(() => {
    if (number.length > 0) {
      setPhoneNumberMaxLength(possibleMaxLengths);
    }
  }, [possibleMaxLengths, number]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 'inherit',
      }}
    >
      <FormProvider {...form}>
        <Box
          component="form"
          onSubmit={form.handleSubmit(onSubmit)}
          sx={(theme) => ({
            height: 'fit-content',
            minWidth: '640px',
            borderRadius: '16px',
            padding: 5,
            boxShadow: theme.shadow.lg,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            '& .MuiFormLabel-root': {
              fontSize: '12px',
            },
          })}
        >
          <Typography variant="headline1" textAlign="center">
            {t('onboarding.invitation-link.title', {
              defaultValue: 'Create your SleekFlow account',
            })}
          </Typography>

          {type === 'link' && (
            <FormControl
              fullWidth
              focused={false}
              error={!!form.getFieldState('email').error}
            >
              <FormLabel>
                {t('onboarding.form.email', {
                  defaultValue: 'Email',
                })}
              </FormLabel>
              <HookFormTextField
                fieldName="email"
                textFieldProps={{
                  FormHelperTextProps: {
                    style: { fontSize: '12px' },
                  },
                }}
              />
            </FormControl>
          )}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl
              fullWidth
              focused={false}
              error={!!form.getFieldState('firstName').error}
            >
              <FormLabel>
                {t('onboarding.form.first-name', {
                  defaultValue: 'First name',
                })}
              </FormLabel>
              <HookFormTextField
                fieldName="firstName"
                InputProps={{ maxLength: 50 }}
              />
            </FormControl>

            <FormControl
              fullWidth
              focused={false}
              error={!!form.getFieldState('lastName').error}
            >
              <FormLabel>
                {t('onboarding.form.last-name', {
                  defaultValue: 'Last name',
                })}
              </FormLabel>
              <HookFormTextField
                fieldName="lastName"
                InputProps={{ maxLength: 50 }}
              />
            </FormControl>
          </Box>

          <FormControl
            fullWidth
            focused={false}
            error={!!form.getFieldState('username').error}
          >
            <FormLabel>
              {t('onboarding.form.username', {
                defaultValue: 'Username',
              })}
            </FormLabel>
            <HookFormTextField
              fieldName="username"
              InputProps={{ maxLength: 20 }}
            />

            {!errors.username?.message && (
              <Typography
                variant="body2"
                sx={{
                  fontSize: '12px',
                  mt: 1,
                }}
              >
                {t('onboarding.form.username-hint', {
                  defaultValue: 'Support alphabet and numbers only',
                })}
              </Typography>
            )}
          </FormControl>

          <PasswordField
            control={control}
            value={watch('password')}
            error={!!form.getFieldState('password').error}
            helperText={form.getFieldState('password').error?.message}
          />

          <FormControl
            fullWidth
            focused={false}
            error={!!form.getFieldState('position').error}
          >
            <FormLabel>
              {t('onboarding.form.position', {
                defaultValue: 'Position',
              })}
            </FormLabel>
            <HookFormTextField
              fieldName="position"
              InputProps={{ maxLength: 50 }}
            />
          </FormControl>

          <FormControl
            fullWidth
            focused={false}
            error={!!form.getFieldState('phoneNumber').error}
          >
            <FormLabel>
              {t('onboarding.form.phone-number', {
                defaultValue: 'contact number (For customer support only)',
              })}
            </FormLabel>
            <HookFormPhoneInput
              phoneInputProps={{
                disabled: false,
                maxLength: phoneNumberMaxLength,
              }}
              fieldName="phoneNumber"
              country={country}
              disabled={isCountryQueryLoading}
            />
          </FormControl>

          <TimezoneField
            control={control}
            error={!!form.getFieldState('timezone').error}
            helperText={form.getFieldState('timezone').error?.message}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 'auto', py: '11.5px' }}
            loading={
              linkInvitationMutation.isPending ||
              emailInvitationMutation.isPending
            }
            disabled={submittedButtonDisabled}
          >
            {t('onboarding.create-account.submit', 'Create account')}
          </Button>

          <Typography
            variant="body1"
            textAlign="center"
            sx={{ mt: 2, fontSize: '14px' }}
          >
            <Trans
              i18nKey="onboarding.create-account.terms-with-link"
              defaults="By creating a SleekFlow account, you're agreeing to accept the SleekFlow <1>Terms of Service</1>"
              components={{
                1: (
                  <Typography
                    component="a"
                    href={TERMS_OF_SERVICE_URL}
                    variant="link1"
                    sx={{
                      textDecoration: 'none',
                      color: colors.blue90,
                      fontWeight: '600',
                    }}
                  />
                ),
              }}
            />
          </Typography>
        </Box>
      </FormProvider>
    </Box>
  );
}
