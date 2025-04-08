import { useSlotProps } from '@mui/base';
import {
  List,
  ListProps,
  MenuItem,
  useControlled,
  useFormControl,
} from '@mui/material';
import { TimeFieldProps } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useRef } from 'react';

import { dayjsRange } from '@/components/date-time-pickers/utils';

export function TimePickerSelectionList(
  props: Pick<
    TimeFieldProps<Dayjs>,
    | 'value'
    | 'minTime'
    | 'maxTime'
    | 'disableFuture'
    | 'disablePast'
    | 'timezone'
    | 'onChange'
    | 'disabled'
  > & {
    slotProps?: {
      list?: ListProps;
    };
    interval?: number;
  },
) {
  const {
    disabled: disabledProp,
    value: valueProp,
    minTime,
    maxTime,
    disablePast,
    timezone: timezoneProp,
    disableFuture,
    onChange,
    slotProps,
    interval = 15,
  } = props;
  const timezone = timezoneProp === 'system' ? dayjs.tz.guess() : timezoneProp;
  const formControl = useFormControl();
  const allValuesDisabled = formControl?.disabled || disabledProp;
  const currentTimeInUserTimezoneDayjs = dayjs.tz(dayjs(), timezone); // local staff/company timezone
  const [value, setValue] = useControlled({
    name: 'value',
    controlled: valueProp,
    default: null,
  });
  const timezonedValue = value ? value.tz(timezone) : null;
  const listProps = useSlotProps({
    elementType: List,
    externalSlotProps: slotProps?.list,
    ownerState: {},
  });
  const formattedValue = timezonedValue ? timezonedValue.format('LT') : '';
  const selectedItemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: 'auto',
        block: 'center',
      });
    }
  }, [formattedValue]);

  // Generate stable list of times in UTC
  const baseTimeOptions = dayjsRange(
    dayjs.utc().startOf('day'),
    dayjs.utc().endOf('day'),
    'minute',
    interval,
  );

  return (
    <List {...listProps} style={{ maxHeight: 300 }}>
      {baseTimeOptions.map((option) => {
        // Convert each time to target timezone while preserving the hour/minute
        const timezonedOption = dayjs.tz(
          option.format('HH:mm:ss'),
          'HH:mm:ss',
          timezone,
        );
        const optionValue = timezonedOption.format('LT');
        const isTimeInFuture = timezonedOption.isAfter(
          currentTimeInUserTimezoneDayjs,
        );
        const isBeforeMinTime = minTime && timezonedOption.isBefore(minTime);
        const isAfterMaxTime = maxTime && timezonedOption.isAfter(maxTime);

        const localUtcTimeZone = currentTimeInUserTimezoneDayjs;
        const isTimeInPast = timezonedOption.isBefore(localUtcTimeZone);

        const disabled = () => {
          if (disableFuture && isTimeInFuture) {
            return true;
          }
          if (disablePast && isTimeInPast) {
            return true;
          }
          if (minTime && isBeforeMinTime) {
            return true;
          }
          if (maxTime && isAfterMaxTime) {
            return true;
          }
          return false;
        };

        if (disabled()) {
          return null;
        }

        return (
          <MenuItem
            disabled={allValuesDisabled || disabled()}
            onClick={() => {
              setValue(timezonedOption);
              onChange?.(
                (timezonedValue || currentTimeInUserTimezoneDayjs)
                  .set('hour', timezonedOption.hour())
                  .set('minute', timezonedOption.minute()),
                {
                  validationError: null,
                },
              );
            }}
            selected={formattedValue === optionValue}
            key={optionValue}
            value={optionValue}
            ref={formattedValue === optionValue ? selectedItemRef : null}
          >
            {optionValue}
          </MenuItem>
        );
      })}
    </List>
  );
}
