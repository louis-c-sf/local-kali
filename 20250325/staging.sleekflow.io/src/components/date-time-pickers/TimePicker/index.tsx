import { useSlotProps } from '@mui/base';
import {
  InputAdornment,
  Popover,
  Stack,
  styled,
  useControlled,
  useFormControl,
} from '@mui/material';
import { TimeField as TimeFieldBase } from '@mui/x-date-pickers';
import React, { useRef, useState } from 'react';

import Icon from '@/components/Icon';
import { ScrollArea } from '@/components/ScrollArea';
import { TextField } from '@/components/TextField';
import { TimePickerProps } from '@/components/date-time-pickers/TimePicker/types';
import { useDebugMode } from '@/utils/useDebugMode';

import { TimePickerSelectionList } from './TimePickerSelectionList';

const TimeFieldRoot = styled(TimeFieldBase)() as typeof TimeFieldBase;

const DateRangeSelectPaper = styled(ScrollArea)(({ theme }) => ({
  background: theme.palette.white,
  boxShadow: theme.shadow.sm,
  width: 'min-content',
}));

export const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  function TimePicker(props, ref) {
    const {
      interval = 15,
      shape,
      size = 'medium',
      clearable = false,
      value: valueProp,
      disableIgnoringDatePartForTimeValidation = true,
      onChange,
      disabled: disabledProp,
      error: errorProp,
      minTime,
      maxTime,
      disableFuture = false,
      disablePast = false,
      slotProps,
      timezone = 'system', // staff/company timezone
      ...rest
    } = props;
    const [value, setValue] = useControlled({
      name: 'value',
      controlled: valueProp,
      default: null,
    });
    const formControl = useFormControl();
    const error = formControl?.error || errorProp;
    const disabled = formControl?.disabled || disabledProp;
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const open = !!anchorEl;
    const dateFieldRef = useRef<HTMLDivElement | null>(null);
    const debugMode = useDebugMode((state) => state.debugMode);
    const textFieldProps = useSlotProps({
      // @ts-expect-error bad types
      element: TextField,
      externalSlotProps: {
        ...slotProps?.textField,
        InputProps: {
          shape,
          size,
          ref: dateFieldRef,
          endAdornment: (
            <InputAdornment position={'end'}>
              <Stack spacing={1} direction={'row'}>
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
                  icon="clock"
                  onClick={() => {
                    if (!disabled) {
                      setAnchorEl(dateFieldRef.current);
                    }
                  }}
                />
              </Stack>
            </InputAdornment>
          ),
          // @ts-expect-error bad types
          ...slotProps?.textField?.InputProps,
        },
      },
    });

    return (
      <>
        <TimeFieldRoot
          ref={ref}
          timezone={timezone}
          minTime={minTime}
          maxTime={maxTime}
          value={value}
          disableFuture={disableFuture}
          disablePast={disablePast}
          // @ts-expect-error bad types
          error={error}
          disabled={disabled}
          disableIgnoringDatePartForTimeValidation={
            disableIgnoringDatePartForTimeValidation
          }
          onChange={(value, context) => {
            setValue(value);
            onChange?.(value, context);
          }}
          slots={{
            textField: TextField,
          }}
          slotProps={{
            textField: {
              ...textFieldProps,
            },
            ...slotProps,
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
          slots={{
            paper: DateRangeSelectPaper,
          }}
          slotProps={{
            paper: {
              sx: {
                width: dateFieldRef.current?.getBoundingClientRect().width,
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
                top: 0,
                position: 'sticky',
                color: 'white',
                padding: '8px',
                background: 'purple',
                zIndex: 999,
              }}
            >
              DEBUG TIMEZONE: {timezone}
            </div>
          )}
          <TimePickerSelectionList
            value={value}
            minTime={minTime}
            maxTime={maxTime}
            disablePast={disablePast}
            disableFuture={disableFuture}
            timezone={timezone}
            interval={interval}
            onChange={(value) => {
              setAnchorEl(null);
              setValue(value);
              onChange?.(value, {
                validationError: null,
              });
            }}
          />
        </Popover>
      </>
    );
  },
);
