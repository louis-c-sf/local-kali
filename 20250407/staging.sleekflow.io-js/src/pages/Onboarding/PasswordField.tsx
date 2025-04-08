import { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  IconButton,
  FormControl,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import Icon from '@/components/Icon';
import { semanticTokens } from '@/themes';
import { Controller, Control } from 'react-hook-form';
import {
  ConditionItemType,
  getPasswordConditions,
} from './helpers/getPasswordConditions';

interface PasswordFieldProps {
  value: string;
  error?: boolean;
  helperText?: string;
  control: Control<any>;
  name?: string;
}

const ConditionListItem = ({
  req,
  value,
}: {
  req: ConditionItemType;
  value: string;
}) => {
  const met = req.regex.test(value);
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mt: 1,
      }}
    >
      {met ? (
        <Icon
          icon="check-circle-filled"
          sx={{
            color: 'success.main',
            width: '16px',
            height: '16px',
          }}
        />
      ) : (
        <Box
          sx={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: '1px solid',
            borderColor: 'gray.20',
          }}
        />
      )}
      <Typography
        variant="body1"
        sx={{
          color: met
            ? semanticTokens.contentSecondary
            : semanticTokens.contentPlaceholder,
          fontSize: '12px !important',
        }}
      >
        {req.label}
      </Typography>
    </Box>
  );
};

export default function PasswordField({
  value,
  error,
  helperText,
  control,
  name = 'password',
}: PasswordFieldProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const conditions = getPasswordConditions(t);

  const requiredConditions = conditions.filter(
    (condition) => condition.type === 'required',
  );
  const optionalConditions = conditions.filter(
    (condition) => condition.type === 'optional',
  );

  return (
    <Box sx={{ width: '100%' }}>
      <FormControl fullWidth error={error}>
        <Controller
          name={name}
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label={t('onboarding.form.password.label', {
                defaultValue: 'PASSWORD',
              })}
              error={!!fieldState.error || error}
              helperText={fieldState.error?.message || helperText}
              onFocus={() => setIsFocused(true)}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: 'gray.50' }}
                  >
                    <Icon icon={showPassword ? 'eye-off' : 'eye'} />
                  </IconButton>
                ),
              }}
              inputProps={{ maxLength: 256 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: error ? 'error.main' : 'primary.main',
                  },
                },
              }}
            />
          )}
        />
      </FormControl>

      {(isFocused || value) && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'gray.20',
            borderRadius: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              color: semanticTokens.contentPrimary,
              fontSize: '12px !important',
            }}
          >
            {t('onboarding.form.password.conditions.must-contain', {
              defaultValue: 'Your password must contain:',
            })}
          </Typography>

          {requiredConditions.map((req, index) => (
            <ConditionListItem
              req={req}
              value={value}
              key={`required-${index}`}
            />
          ))}
          <Typography
            variant="body2"
            sx={{
              my: 1,
              color: semanticTokens.contentPrimary,
              fontSize: '12px !important',
            }}
          >
            {t('onboarding.form.password.conditions.optional-contain', {
              defaultValue: 'and 3 of the requirement below',
            })}
          </Typography>
          {optionalConditions.map((req, index) => (
            <ConditionListItem
              req={req}
              value={value}
              key={`optional-${index}`}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
