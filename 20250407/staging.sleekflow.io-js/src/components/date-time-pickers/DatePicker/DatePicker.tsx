import {
  InputAdornment,
  Popover,
  Stack,
  useControlled,
  useFormControl,
} from '@mui/material';
import { DateField } from '@mui/x-date-pickers';
import React, { useRef, useState } from 'react';

import Icon from '@/components/Icon';
import { TextField } from '@/components/TextField';
import { DatePickerProps } from '@/components/date-time-pickers/DatePicker/types';
import { useDebugMode } from '@/utils/useDebugMode';

import { DateCalendar } from './DateCalendar';
import ErrorBoundaryWithQueryReset from '@/ErrorBoundaryWithQueryReset';

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(props, ref) {
    const {
      size,
      shape,
      error: errorProp,
      disabled: disabledProp,
      clearable = false,
      value: valueProp,
      onChange,
      minDate,
      maxDate,
      disablePast = false,
      disableFuture = false,
      timezone = 'system', // set timezone to staff or company timezone
      ...rest
    } = props;
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [value, setValue] = useControlled({
      name: 'value',
      controlled: valueProp,
      default: null,
    });
    const debugMode = useDebugMode((state) => state.debugMode);
    const formControl = useFormControl();
    const error = formControl?.error || errorProp;
    const disabled = formControl?.disabled || disabledProp;
    const dateFieldRef = useRef<HTMLDivElement | null>(null);
    const open = !!anchorEl;

    return (
      <ErrorBoundaryWithQueryReset
        fallback={() => {
          return <div>Something went wrong</div>;
        }}
      >
        <DateField
          ref={ref}
          error={error}
          disabled={disabled}
          minDate={minDate}
          maxDate={maxDate}
          disablePast={disablePast}
          timezone={timezone}
          disableFuture={disableFuture}
          value={value}
          onChange={(value, context) => {
            setValue(value);
            onChange?.(value, context);
          }}
          slots={{
            textField: TextField,
          }}
          slotProps={{
            textField: {
              InputProps: {
                ref: dateFieldRef,
                size,
                // @ts-expect-error bad types
                shape,
                endAdornment: (
                  <InputAdornment position={'end'}>
                    <Stack direction={'row'} spacing={1}>
                      {clearable && value && (
                        <Icon
                          sx={{
                            cursor: 'pointer',
                          }}
                          icon={'x-close'}
                          onClick={() => {
                            setValue(null);
                            onChange?.(null, { validationError: null });
                          }}
                        />
                      )}
                      <Icon
                        sx={{
                          cursor: 'pointer',
                        }}
                        icon="calendar"
                        onClick={() => {
                          setAnchorEl(dateFieldRef.current);
                        }}
                      />
                    </Stack>
                  </InputAdornment>
                ),
              },
            },
          }}
          {...rest}
        />
        <Popover
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          onClose={() => {
            setAnchorEl(null);
          }}
          slotProps={{
            paper: {
              sx: {
                marginTop: (theme) => theme.spacing(1),
              },
            },
          }}
          open={open}
          anchorEl={anchorEl}
        >
          {debugMode && (
            <div
              style={{
                color: 'white',
                padding: '8px',
                background: 'purple',
              }}
            >
              DEBUG TIMEZONE: {timezone}
            </div>
          )}
          <DateCalendar
            value={value}
            timezone={timezone}
            minDate={minDate}
            maxDate={maxDate}
            disablePast={disablePast}
            disableFuture={disableFuture}
            onChange={(value) => {
              setAnchorEl(null);
              setValue(value);
              onChange?.(value, {
                validationError: null,
              });
            }}
          />
        </Popover>
      </ErrorBoundaryWithQueryReset>
    );
  },
);
