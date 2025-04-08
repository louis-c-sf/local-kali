import { MenuItem, Select, Stack, useControlled } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  DateCalendar as DateCalendarBase,
  DateCalendarProps,
  PickersCalendarHeaderProps,
  PickersDay as PickerDayBase,
  PickersDayProps,
} from '@mui/x-date-pickers';
import { useUtils } from '@mui/x-date-pickers/internals';
import dayjs, { Dayjs } from 'dayjs';

import { Button } from '@/components/Button';
import Icon from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { ScrollArea } from '@/components/ScrollArea';
import { dayjsRange } from '@/components/date-time-pickers/utils';

const DayCalendarHeaderRoot = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
}));

const PickersDayRoot = styled(PickerDayBase)(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.palette.componentToken.calendar.textEnabled,
  '&.MuiPickersDay-root:hover': {
    border: '1px solid',
    background: theme.palette.componentToken.calendar.bgHover,
    borderColor: theme.palette.componentToken.calendar.textHover,
    color: theme.palette.componentToken.calendar.textHover,
  },
  '&:focus': {
    border: '1px solid',
    background: theme.palette.componentToken.calendar.bgHover,
    borderColor: theme.palette.componentToken.calendar.textHover,
    color: theme.palette.componentToken.calendar.textHover,
  },
  '&.Mui-selected': {
    color: theme.palette.componentToken.calendar.textSelected,
    background: theme.palette.componentToken.calendar.bgSelected,
    '&:hover': {
      background: theme.palette.componentToken.calendar.bgSelected,
      color: theme.palette.componentToken.calendar.textSelected,
    },
    '&:focus': {
      background: theme.palette.componentToken.calendar.bgSelected,
      color: theme.palette.componentToken.calendar.textSelected,
    },
  },
  '&.MuiPickersDay-today': {
    borderColor: theme.palette.blue[20],
  },
})) as typeof PickerDayBase;

const DateCalendarRoot = styled(DateCalendarBase)(({ theme }) => ({
  '& .MuiDayCalendar-root .MuiDayCalendar-header .MuiDayCalendar-weekDayLabel':
    {
      ...theme.typography.body1,
      color: theme.palette.componentToken.calendar.textEnabled,
      fontWeight: 600,
    },
  width: 'auto',
  height: 'auto',
  padding: theme.spacing(1.5),
})) as typeof DateCalendarBase;

const PickersDay = (props: PickersDayProps<Dayjs>) => {
  const { ...rest } = props;
  return <PickersDayRoot {...rest}></PickersDayRoot>;
};

const DateRangeSelectPaper = styled(ScrollArea)(({ theme }) => ({
  background: theme.palette.white,
  boxShadow: theme.shadow.sm,
  width: 'min-content',
  [`& [data-radix-scroll-area-viewport]`]: {
    maxHeight: '200px',
  },
}));

export function DayCalendarHeader(inProps: PickersCalendarHeaderProps<Dayjs>) {
  const {
    onMonthChange,
    disablePast,
    disableFuture,
    currentMonth: currentViewingDate = new Dayjs(),
    minDate,
    maxDate,
    timezone: timezoneProp,
  } = inProps;
  const timezone = timezoneProp === 'system' ? dayjs.tz.guess() : timezoneProp;
  const utils = useUtils<Dayjs>();
  const currentMonth = currentViewingDate.month();
  const currentYear = currentViewingDate.year();
  const currentTimeInUserTimezoneDayjs = dayjs.tz(dayjs(), timezone);
  const disablePreviousMonth = () => {
    if (
      disablePast &&
      currentViewingDate.isSameOrBefore(
        utils.startOfMonth(currentTimeInUserTimezoneDayjs),
      )
    ) {
      return true;
    }
    if (
      minDate &&
      currentViewingDate.isSameOrBefore(utils.startOfMonth(minDate))
    ) {
      return true;
    }

    return false;
  };

  const disableNextMonth = () => {
    if (
      disableFuture &&
      currentViewingDate.isSameOrAfter(
        utils.startOfMonth(currentTimeInUserTimezoneDayjs),
      )
    ) {
      return true;
    }
    if (
      maxDate &&
      currentViewingDate.isSameOrAfter(utils.startOfMonth(maxDate))
    ) {
      return true;
    }

    return false;
  };

  return (
    <DayCalendarHeaderRoot>
      <IconButton
        disabled={disablePreviousMonth()}
        variant="tertiary"
        onClick={() => {
          onMonthChange(utils.addMonths(currentViewingDate, -1), 'right');
        }}
      >
        <Icon icon="chevron-left" />
      </IconButton>
      <Stack direction={'row'}>
        <Select
          value={currentMonth}
          variant={'standard'}
          onChange={(event) => {
            const val = Number(event.target.value);
            const direction =
              val < currentViewingDate.month() ? 'right' : 'left';
            onMonthChange(utils.setMonth(currentViewingDate, val), direction);
          }}
          MenuProps={{
            disablePortal: true,
            slots: {
              paper: DateRangeSelectPaper,
            },
          }}
        >
          {dayjsRange(
            currentViewingDate.startOf('year'),
            currentViewingDate.endOf('year'),
            'month',
          ).map((option) => {
            const isMonthInFuture = option.isAfter(
              currentTimeInUserTimezoneDayjs,
              'month',
            );
            const isMonthInPast = option.isBefore(
              currentTimeInUserTimezoneDayjs,
              'month',
            );
            const isBeforeMinMonth =
              minDate && option.isBefore(dayjs.tz(minDate, timezone), 'month');
            const isAfterMaxMonth =
              maxDate && option.isAfter(dayjs.tz(maxDate, timezone), 'month');
            const disabled = () => {
              if (disableFuture && isMonthInFuture) {
                return true;
              }
              if (disablePast && isMonthInPast) {
                return true;
              }
              if (minDate && isBeforeMinMonth) {
                return true;
              }
              if (maxDate && isAfterMaxMonth) {
                return true;
              }
              return false;
            };
            return (
              <MenuItem
                disabled={disabled()}
                value={option.month()}
                key={option.month()}
              >
                {option.format('MMMM')}
              </MenuItem>
            );
          })}
        </Select>
        <Select
          value={currentYear}
          variant={'standard'}
          onChange={(event) => {
            onMonthChange(
              utils.setYear(currentViewingDate, event.target.value as number),
              'left',
            );
          }}
          MenuProps={{
            disablePortal: true,
            slots: {
              paper: DateRangeSelectPaper,
            },
          }}
        >
          {dayjsRange(
            currentViewingDate.set('year', 1991),
            currentViewingDate.set('year', 2099),
            'year',
          ).map((option) => {
            const isYearInFuture = option.isAfter(
              currentTimeInUserTimezoneDayjs,
              'year',
            );
            const isYearInPast = option.isBefore(
              currentTimeInUserTimezoneDayjs,
              'year',
            );
            const isBeforeMinYear = minDate && option.isBefore(minDate, 'year');
            const isAfterMaxYear = maxDate && option.isAfter(maxDate, 'year');
            const disabled = () => {
              if (disableFuture && isYearInFuture) {
                return true;
              }
              if (disablePast && isYearInPast) {
                return true;
              }
              if (minDate && isBeforeMinYear) {
                return true;
              }
              if (maxDate && isAfterMaxYear) {
                return true;
              }
              return false;
            };
            return (
              <MenuItem
                disabled={disabled()}
                value={option.year()}
                key={option.year()}
              >
                {option.year()}
              </MenuItem>
            );
          })}
        </Select>
      </Stack>

      <IconButton
        disabled={disableNextMonth()}
        variant="tertiary"
        onClick={() => {
          onMonthChange(utils.addMonths(currentViewingDate, 1), 'left');
        }}
      >
        <Icon icon="chevron-right" />
      </IconButton>
    </DayCalendarHeaderRoot>
  );
}

export const DateCalendar = (props: DateCalendarProps<Dayjs>) => {
  const {
    onChange,
    value: valueProp,
    minDate,
    maxDate,
    disablePast = false,
    disableFuture = false,
    timezone: timezoneProp = 'system', // set timezone to staff or company timezone
    dayOfWeekFormatter = (day, date) => {
      return date.format('dd');
    },
    ...rest
  } = props;
  const timezone = timezoneProp === 'system' ? dayjs.tz.guess() : timezoneProp;
  const [value, setValue] = useControlled({
    name: 'value',
    controlled: valueProp,
    default: null,
  });

  return (
    <DateCalendarRoot<Dayjs>
      value={value}
      dayOfWeekFormatter={dayOfWeekFormatter}
      timezone={timezone}
      minDate={minDate}
      maxDate={maxDate}
      disablePast={disablePast}
      disableFuture={disableFuture}
      onChange={(value, selectionState) => {
        setValue(value);
        onChange?.(value, selectionState);
      }}
      slots={{
        day: PickersDay,
        calendarHeader: DayCalendarHeader,
        switchViewButton: Button,
      }}
      slotProps={{
        day: {
          disableRipple: true,
        },
      }}
      {...rest}
    />
  );
};
