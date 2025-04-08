import {
  FormControl,
  FormControlProps,
  FormHelperText,
  InputLabel,
  styled,
  useTheme,
} from '@mui/material';
import React, { useLayoutEffect, useRef, useState } from 'react';
import PI, { CountryData, PhoneInputProps } from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';

import { colors } from '@/themes';

// @ts-expect-error minified react error workaround https://github.com/bl00mber/react-phone-input-2/issues/533
const ReactPhoneInput = PI.default ? PI.default : PI;

const StyledReactPhoneInput = styled(ReactPhoneInput)({
  '&.react-tel-input .form-control': {
    height: 'auto',
    borderWidth: '1px',
    borderColor: colors.grey30,
    '&.invalid-number': {
      borderColor: colors.red90,
      '&:focus': {
        boxShadow: `0 0 0 0px ${colors.red90}`,
      },
    },
  },
  '&.react-tel-input .form-control:hover': {
    borderColor: colors.grey70,
  },
  '&.react-tel-input .form-control:focus': {
    outline: 'none',
    borderColor: `${colors.blue90} !important`,
    boxShadow: '0px 0px 10px 3px rgba(0, 102, 255, 0.12)',
  },
  '&.react-tel-input .country-list li.country:hover': {
    background: colors.blue10,
  },
  '&.react-tel-input .country-list li.highlight': {
    background: colors.blue5,
  },
  '&:focus': {
    boxShadow: '0px 0px 10px 3px rgba(0, 102, 255, 0.12)',
    borderColor: colors.blue90,
  },
});

const PhoneInput = ({
  onChange,
  label,
  value,
  error,
  width,
  phoneInputProps = {},
  disabled = false,
  country = 'hk',
  formControlProps = {},
}: {
  onChange?: (
    value: string,
    data: CountryData | Record<string, unknown>,
    event: React.ChangeEvent<HTMLInputElement>,
    formattedValue: string,
  ) => void;
  label?: string;
  value: string;
  error?: string;
  width?: string;
  disabled?: boolean;
  phoneInputProps?: Omit<PhoneInputProps, 'onChange' | 'value'> & {
    maxLength?: number;
  };
  formControlProps?: FormControlProps;
  country?: string;
}) => {
  const theme = useTheme();
  const [dropdownWidth, setDropdownWidth] = React.useState(0);
  const [focused, setFocused] = useState(false);
  const textField = useRef(null);

  useLayoutEffect(() => {
    setDropdownWidth(textField?.current?.['offsetWidth'] || 0);
  }, []);
  const { sx: formControlSx, ...restFormControlProps } = formControlProps;

  return (
    <React.Fragment>
      <FormControl
        error={!!error}
        ref={textField}
        sx={[
          { width: '100%' },
          ...(Array.isArray(formControlSx) ? formControlSx : [formControlSx]),
        ]}
        {...restFormControlProps}
      >
        <InputLabel sx={{ margin: 0 }} error={!!error}>
          {label}
        </InputLabel>
        <StyledReactPhoneInput
          disabled={disabled}
          defaultErrorMessage={error}
          placeholder=""
          specialLabel=""
          value={value}
          country={country}
          enableSearch
          isValid={!error}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          inputStyle={{
            ...theme.typography.body1,
            width: '100%',
            color: colors.grey90,
            fontWeight: 400,
            height: '40px',
            borderRadius: '4px',
            ...(disabled && {
              background: colors.grey20,
              border: 'none',
              color: colors.grey80,
            }),
          }}
          dropdownStyle={{
            ...theme.typography.body1,
            width: width ?? dropdownWidth,
            color: colors.grey90,
            borderRadius: '4px',
            boxShadow: '0px 8px 16px 2px rgba(0, 102, 255, 0.04)',
            zIndex: theme.zIndex.modal,
            overflowX: 'hidden',
          }}
          autocompleteSearch
          searchPlaceholder="Search"
          searchStyle={{
            ...theme.typography.body1,
            width: 'calc(100% - 16px)',
            top: '-1px',
            border: `1px solid ${colors.grey30}`,
            padding: '8px 16px',
          }}
          {...phoneInputProps}
        />
        {error && (
          <FormHelperText className={focused ? 'Mui-focused' : ''}>
            {error}
          </FormHelperText>
        )}
      </FormControl>
    </React.Fragment>
  );
};

export default PhoneInput;
