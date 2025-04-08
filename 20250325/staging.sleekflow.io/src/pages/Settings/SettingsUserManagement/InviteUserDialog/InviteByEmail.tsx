import {
  FormControl,
  FormHelperText,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { TFunction, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { SelectTeams } from '@/components/SelectTeams';
import { ScrollArea } from '@/components/ScrollArea';
import { useInviteUserByEmailMutation } from '@/api/settings';
import useSnackbar from '@/hooks/useSnackbar';

import EmailInput, { EmailOption } from './EmailInput';
import { RoleType } from '@/api/types';
import { useEffect } from 'react';
import { testIds } from '@/playwright/lib/test-ids';

export type EmailFormValues = {
  emails: EmailOption[];
  role: string;
  teams: string[];
};

const getEmailFormValidateSchema = (t: TFunction) =>
  yup.object().shape({
    emails: yup
      .array()
      .test(
        'email format validation',
        t('settings.invite-user-dialog.invite-by-email.email-format-error', {
          defaultValue: 'Invalid email format',
        }),
        (value) =>
          value
            ?.map((email) => email.title)
            .every((email) => {
              return yup.string().email().isValidSync(email);
            }),
      )
      .min(
        1,
        t('general.required-field-validation', {
          defaultValue: 'This is a required field',
        }),
      ),
    role: yup
      .string()
      .trim()
      .required(
        t('settings.invite-user-dialog.invite-by-email.role-required-error', {
          defaultValue: 'Please select at least one role',
        }),
      ),
  });

export const getRoleOptions = (t: TFunction) => [
  {
    value: RoleType.ADMIN,
    displayName: t('settings.invite-user-dialog.role.admin', {
      defaultValue: 'Admin',
    }),
  },
  {
    value: RoleType.TEAMADMIN,
    displayName: t('settings.invite-user-dialog.role.team-admin', {
      defaultValue: 'Team Admin',
    }),
  },
  {
    value: RoleType.STAFF,
    displayName: t('settings.invite-user-dialog.role.staff', {
      defaultValue: 'Staff',
    }),
  },
];

export default function InviteByEmail({
  setIsLoading,
  closeDialog,
}: {
  setIsLoading: (isLoading: boolean) => void;
  closeDialog: () => void;
}) {
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const inviteUserByEmailMutation = useInviteUserByEmailMutation({
    onSuccess: () => {
      snackbar.success(
        t('settings.invite-user-dialog.invite-by-email-success-toast', {
          defaultValue:
            'You have successfully sent invitation {emails, plural, =1 {{email}} other {emails to the selected users}}',
          emails: form.getValues().emails.length,
          email: form.getValues().emails[0].title,
        }),
      );
    },
    onError: (e) => {
      const existedEmailMessage = e.message.match(
        /^User with email ([^\s]+) already exists$/,
      );
      if (existedEmailMessage) {
        snackbar.error(
          t('settings.invite-user-dialog.invite-by-email-existed-error-toast', {
            defaultValue: '{email} already exist in your workspace',
            email: existedEmailMessage[1],
          }),
        );
      } else {
        snackbar.error(
          t('settings.invite-user-dialog.invite-by-email-error-toast', {
            defaultValue:
              'Failed to sent invitation email to {emails, plural, =1 {this user} other {the selected users}}. Please try again later',
            emails: form.getValues().emails.length,
          }),
        );
      }
    },
  });

  const form = useForm<EmailFormValues>({
    defaultValues: {
      emails: [],
      role: '',
      teams: [],
    },
    resolver: yupResolver(getEmailFormValidateSchema(t)),
  });

  useEffect(() => {
    setIsLoading(inviteUserByEmailMutation.isPending);
  }, [inviteUserByEmailMutation.isPending, setIsLoading]);

  const onSubmit = async (values: EmailFormValues) => {
    await inviteUserByEmailMutation.mutateAsync({
      ...values,
      emails: values.emails.map((email) => email.title),
    });
    closeDialog();
  };

  return (
    <FormProvider {...form}>
      <ScrollArea>
        <Stack
          sx={{ maxHeight: '540px' }}
          spacing={3}
          my={2}
          component="form"
          onSubmit={form.handleSubmit(onSubmit)}
          id="invite-by-email-form"
          data-testid="invite-by-email-form"
        >
          <EmailInput
            label={t('settings.invite-user-dialog.invite-by-email.email', {
              defaultValue: 'Email',
            })}
            name="emails"
          />
          <Controller
            control={form.control}
            name="role"
            render={({ field: { onChange, value }, fieldState }) => {
              return (
                <FormControl error={!!fieldState.error} focused={false}>
                  <FormLabel>
                    {t('settings.invite-user-dialog.invite-by-email.role', {
                      defaultValue: 'Role',
                    })}
                  </FormLabel>
                  <Select
                    onChange={onChange}
                    value={value}
                    data-testid="role-select"
                  >
                    {getRoleOptions(t).map((option) => (
                      <MenuItem value={option.value} key={option.value}>
                        {option.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldState?.error?.message && (
                    <FormHelperText>{fieldState.error.message}</FormHelperText>
                  )}
                </FormControl>
              );
            }}
          />
          <Controller
            control={form.control}
            name="teams"
            render={({ field: { onChange, value } }) => {
              return (
                <FormControl focused={false}>
                  <FormLabel>
                    {t('settings.invite-user-dialog.invite-by-email.team', {
                      defaultValue: 'add to team (optional)',
                    })}
                  </FormLabel>
                  <SelectTeams
                    multiple
                    data-testid={testIds.settingsInviteByEmailTeamsSelect}
                    sx={{
                      maxWidth: '100%',
                    }}
                    value={value}
                    onChange={onChange}
                  />
                </FormControl>
              );
            }}
          />
          <Typography>
            {t(
              'settings.invite-user-dialog.invite-by-email.expired-description',
              {
                defaultValue:
                  'Please note that the invitations will only be valid for 7 days.',
              },
            )}
          </Typography>
        </Stack>
      </ScrollArea>
    </FormProvider>
  );
}
