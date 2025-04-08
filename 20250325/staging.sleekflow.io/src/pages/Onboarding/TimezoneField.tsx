import { useGetTimezoneListQuery } from '@/api/settings';
import { useGetDefaultTimeZone } from '../Settings/helpers/utils';
import {
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Control, Controller, useFormContext } from 'react-hook-form';
import { RegisterFormData } from './types';
import { useEffect } from 'react';

interface TimezoneFieldProps {
  control: Control<RegisterFormData>;
  error?: boolean;
  helperText?: string;
}

export default function TimezoneField({
  control,
  error,
  helperText,
}: TimezoneFieldProps) {
  const { t } = useTranslation();
  const { getDefaultTimeZoneDisplayName, defaultTimezone, isLoading } =
    useGetDefaultTimeZone();
  const { setValue } = useFormContext<RegisterFormData>();

  const { data: timezoneOptions = [] } = useGetTimezoneListQuery({
    select: (data) => {
      return data.map((timezone) => ({
        value: timezone.id,
        displayName: getDefaultTimeZoneDisplayName(timezone),
      }));
    },
  });

  useEffect(() => {
    if (!isLoading && defaultTimezone?.id) {
      setValue('timezone', defaultTimezone.id, { shouldValidate: true });
    }
  }, [defaultTimezone?.id, isLoading, setValue]);

  return (
    <FormControl fullWidth error={error} focused={false}>
      <FormLabel>
        {t('onboarding.form.timezone', {
          defaultValue: 'TIMEZONE',
        })}
      </FormLabel>
      <Controller
        control={control}
        name="timezone"
        defaultValue=""
        render={({ field }) => (
          <Select
            {...field}
            displayEmpty
            sx={{
              borderRadius: '8px',
            }}
          >
            {timezoneOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.displayName}
              </MenuItem>
            ))}
          </Select>
        )}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
