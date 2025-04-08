import {
  Controller,
  FieldPath,
  FieldValues,
  useFormContext,
} from 'react-hook-form';
import { PhoneInputProps } from 'react-phone-input-2';

import PhoneInput from '@/components/PhoneInput';
import { FormControlProps } from '@mui/material';

export default function HookFormPhoneInput<TData extends FieldValues = any>({
  fieldName,
  phoneInputProps,
  disabled,
  country,
  formControlProps,
}: {
  fieldName: FieldPath<TData>;
  phoneInputProps: Omit<PhoneInputProps, 'onChange' | 'value'> & {
    maxLength?: number;
  };
  formControlProps?: FormControlProps;
  disabled?: boolean;
  country?: string;
}) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      render={({ field: { value, onChange }, fieldState }) => {
        return (
          <PhoneInput
            formControlProps={formControlProps}
            disabled={disabled}
            error={fieldState.error?.message}
            phoneInputProps={phoneInputProps}
            onChange={onChange}
            value={value}
            width="400px"
            country={country}
          />
        );
      }}
      name={fieldName}
    />
  );
}
