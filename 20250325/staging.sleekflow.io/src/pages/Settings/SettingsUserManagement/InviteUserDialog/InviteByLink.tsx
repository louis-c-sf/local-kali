import { ScrollArea } from '@/components/ScrollArea';
import {
  FormControl,
  FormHelperText,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { TFunction, useTranslation } from 'react-i18next';
import { getRoleOptions } from './InviteByEmail';
import { SelectTeams } from '@/components/SelectTeams';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useInviteUserByLinkMutation } from '@/api/settings';
import { useEffect } from 'react';
import { useCopyToClipboard } from 'react-use';
import useSnackbar from '@/hooks/useSnackbar';
import { testIds } from '@/playwright/lib/test-ids';

export type LinkFormValues = {
  expireDays: number;
  role: string;
  teams: string[];
  link: string;
};

const getLinkFormValidateSchema = (t: TFunction) =>
  yup.object().shape({
    role: yup
      .string()
      .trim()
      .required(
        t('settings.invite-user-dialog.invite-by-email.role-required-error', {
          defaultValue: 'Please select at least one role',
        }),
      ),
  });

const getExpireDaysOptions = (t: TFunction) => [
  {
    value: 3,
    displayName: t('settings.invite-user-dialog.invite-with-link.expire-days', {
      defaultValue: 'Expire in {count} days',
      count: 3,
    }),
  },
  {
    value: 7,
    displayName: t('settings.invite-user-dialog.invite-with-link.expire-days', {
      defaultValue: 'Expire in {count} days',
      count: 7,
    }),
  },
  {
    value: 14,
    displayName: t('settings.invite-user-dialog.invite-with-link.expire-days', {
      defaultValue: 'Expire in {count} days',
      count: 14,
    }),
  },
  {
    value: 30,
    displayName: t('settings.invite-user-dialog.invite-with-link.expire-days', {
      defaultValue: 'Expire in {count} days',
      count: 30,
    }),
  },
];

export default function InviteByLink({
  setIsLoading,
  closeDialog,
}: {
  setIsLoading: (isLoading: boolean) => void;
  closeDialog: () => void;
}) {
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const [{ error }, copyToClipboard] = useCopyToClipboard();

  const inviteUserByLinkMutation = useInviteUserByLinkMutation({
    onError: () => {
      snackbar.error(t('general.something-went-wrong.title'));
    },
  });
  const form = useForm<LinkFormValues>({
    defaultValues: {
      expireDays: 30,
      role: '',
      teams: [],
      link: '',
    },
    resolver: yupResolver(getLinkFormValidateSchema(t)),
  });

  useEffect(() => {
    setIsLoading(inviteUserByLinkMutation.isPending);
  }, [inviteUserByLinkMutation.isPending, setIsLoading]);

  const generateLink = async () => {
    const values = form.getValues();
    if (!values.role) {
      form.setValue('link', '');
      return;
    }
    const link = await inviteUserByLinkMutation.mutateAsync({
      role: values.role,
      teams: values.teams,
      expireDays: values.expireDays,
    });
    form.setValue('link', link || '');
  };

  const onSubmit = (values: LinkFormValues) => {
    copyToClipboard(values.link);
    if (error) {
      return snackbar.error(
        t('settings.invite-user-dialog.invite-with-link.copy-failed-toast', {
          defaultValue: 'Unable to copy to clipboard. Please try again later.',
        }),
      );
    }
    snackbar.info(
      t('settings.invite-user-dialog.invite-with-link.copy-success-toast', {
        defaultValue: 'You have copied an invitation link to clipboard',
      }),
    );
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
          id="invite-by-link-form"
        >
          <Typography>
            {t('settings.invite-user-dialog.invite-with-link.description', {
              defaultValue:
                'Select role and team to generate a unique invitation link',
            })}
          </Typography>
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
                    onClose={generateLink}
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
                    data-testid={testIds.settingsInviteByLinkTeamsSelect}
                    multiple
                    sx={{
                      maxWidth: '100%',
                    }}
                    value={value}
                    onChange={onChange}
                    onBlur={generateLink}
                  />
                </FormControl>
              );
            }}
          />
          <Controller
            control={form.control}
            name="expireDays"
            render={({ field: { onChange, value } }) => {
              return (
                <FormControl focused={false}>
                  <FormLabel>
                    {t(
                      'settings.invite-user-dialog.invite-with-link.expiration-date',
                      {
                        defaultValue: 'invitation expiration date',
                      },
                    )}
                  </FormLabel>
                  <Select
                    onChange={onChange}
                    value={value}
                    onClose={generateLink}
                  >
                    {getExpireDaysOptions(t).map((option) => (
                      <MenuItem value={option.value} key={option.value}>
                        {option.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            }}
          />
          <Controller
            control={form.control}
            name="link"
            render={({ field: { onChange, value } }) => {
              return (
                <FormControl focused={false}>
                  <FormLabel>
                    {t(
                      'settings.invite-user-dialog.invite-with-link.invitation-link',
                      {
                        defaultValue: 'Invitation link',
                      },
                    )}
                  </FormLabel>
                  <TextField onChange={onChange} value={value} disabled />
                  <FormHelperText>
                    {t(
                      'settings.invite-user-dialog.invite-with-link.link-description',
                      {
                        defaultValue:
                          'This link can be used to invite up to 2,000 people to join your workspace.',
                      },
                    )}
                  </FormHelperText>
                </FormControl>
              );
            }}
          />
        </Stack>
      </ScrollArea>
    </FormProvider>
  );
}
