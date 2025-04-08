import {
  TextField,
  Autocomplete,
  createFilterOptions,
  Typography,
  MenuItem,
  Chip,
  FormControl,
  FormHelperText,
} from '@mui/material';

import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export interface EmailOption {
  isCustom?: boolean;
  title: string;
}

const options: EmailOption[] = [];

const filter = createFilterOptions<EmailOption>();

export default function EmailInput({
  label,
  name,
}: {
  label: string;
  name: string;
}) {
  const { t } = useTranslation();
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value: formValue }, fieldState }) => {
        const value = formValue as EmailOption[];
        return (
          <FormControl focused={false} error={!!fieldState.error}>
            <Autocomplete
              freeSolo
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              autoHighlight
              multiple
              value={value}
              data-testid="email-input"
              onChange={(_event, newValue) => {
                const formatValue = Array.from(
                  new Set(
                    newValue.map((a) => (typeof a === 'string' ? a : a.title)),
                  ),
                ).map((item) => {
                  if (typeof item === 'string') {
                    return { title: item };
                  }
                  return item;
                });
                onChange(formatValue);
              }}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);
                const { inputValue } = params;
                const isExisting = value.some(
                  (option) => inputValue === option.title,
                );
                if (inputValue !== '' && !isExisting) {
                  filtered.push({
                    isCustom: true,
                    title: inputValue,
                  });
                }
                return filtered;
              }}
              options={options}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option;
                }
                return option.title;
              }}
              renderOption={(props, option) => {
                const { ...optionProps } = props;
                return (
                  <MenuItem {...optionProps} component="li">
                    {option.isCustom && (
                      <Typography mr={1} color="contentAccent" fontWeight={600}>
                        {t('settings.invite-user-dialog.email-input.add', {
                          defaultValue: 'Add:',
                        })}
                      </Typography>
                    )}
                    {option.title}
                  </MenuItem>
                );
              }}
              renderTags={(value) =>
                value.map((option) => (
                  <Chip
                    label={option.title}
                    key={option.title}
                    color="lightGray"
                    onDelete={() => {
                      onChange(value.filter((a) => a.title !== option.title));
                    }}
                    sx={(theme) => ({
                      textTransform: 'none',
                      m: 0.25,
                      ...theme.typography.body2,
                    })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  focused={false}
                  error={!!fieldState.error}
                  label={label}
                  sx={{
                    '.MuiInputBase-root': {
                      height: 'auto',
                      minHeight: '40px',
                      py: 0.5,
                    },
                  }}
                />
              )}
              disableClearable
              componentsProps={{
                paper: {
                  sx: {
                    width: '100%',
                  },
                },
              }}
              ListboxComponent={(props) => (
                <ul style={{ width: '100%' }} {...props} />
              )}
            />
            {fieldState?.error?.message && (
              <FormHelperText>{fieldState.error.message}</FormHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
}
