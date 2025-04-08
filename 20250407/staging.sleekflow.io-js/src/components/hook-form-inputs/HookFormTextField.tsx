import { TextField, TextFieldProps } from '@mui/material';
import React from 'react';
import {
  FieldPath,
  FieldValues,
  useFormContext,
  useFormState,
} from 'react-hook-form';

export default function HookFormTextField<TData extends FieldValues>({
  fieldName,
  textFieldProps,
  onChange: onChangeProp,
  InputProps,
}: {
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  textFieldProps?: Omit<TextFieldProps, 'onChange' | 'value'>;
  fieldName: FieldPath<TData>;
  InputProps?: TextFieldProps['inputProps'];
}) {
  const { register, getFieldState, control } = useFormContext();
  const formState = useFormState({ control });
  const { error } = getFieldState(fieldName, formState);
  const textProps = register(fieldName);
  return (
    <TextField
      {...textProps}
      onChange={(e) => {
        textProps.onChange(e);
        onChangeProp?.(e);
      }}
      inputProps={InputProps}
      type="text"
      fullWidth
      {...textFieldProps}
      error={!!error}
      helperText={error?.message}
    />
  );
}
