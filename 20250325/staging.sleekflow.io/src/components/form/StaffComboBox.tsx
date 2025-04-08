import { createFilterOptions, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useGetStaffOverview } from '@/api/company';
import { Avatar as ColoredAvatar } from '@/components/Avatar';
import { ComboBox, ComboboxOption, ComboboxProps } from '@/components/ComboBox';
import { StaffCore } from '@/services/companies/types';
import { sortBySimilarities } from '@/utils/sorting';
import { useCallback } from 'react';

type Value = StaffCore | { label: string; value: string };

type CollaboratorSelectProps<
  TValue,
  Multiple extends boolean | undefined,
> = Pick<
  ComboboxProps<TValue, Multiple, false, false, 'fixed'>,
  | 'multiple'
  | 'value'
  | 'onChange'
  | 'disabled'
  | 'isOptionEqualToValue'
  | 'slotProps'
  | 'itemSize'
  | 'renderOption'
> & {
  rootTestId?: string;
  onClear?: () => void;
  getOptions?: (options: TValue[]) => TValue[];
  renderAdditionalOption?: ComboboxProps<
    { label: string; value: string },
    Multiple,
    false,
    false,
    'fixed'
  >['renderOption'];
};

const filterOptions = createFilterOptions<Value>({
  stringify: (option) => {
    if ('displayName' in option) {
      return `${option.displayName} ${option.email} ${option.firstName} ${option.lastName}`;
    }
    if ('value' in option) {
      // this is to check if there are any 'special' options like 'none'
      return `${option.value} ${option.label}`;
    }
    return '';
  },
});

export function StaffComboBox<Multiple extends boolean | undefined = true>(
  props: Omit<
    CollaboratorSelectProps<StaffCore, Multiple>,
    'renderAdditionalOption'
  >,
): JSX.Element;
export function StaffComboBox<Multiple extends boolean | undefined = true>(
  props: CollaboratorSelectProps<Value, Multiple>,
): JSX.Element;
export function StaffComboBox<Multiple extends boolean | undefined = true>(
  props: CollaboratorSelectProps<any, Multiple>,
) {
  const { t } = useTranslation();
  const {
    value,
    multiple = true,
    itemSize = 48,
    onChange,
    renderAdditionalOption = () => null,
    renderOption = (props, option, state) => {
      if ('displayName' in option) {
        return (
          // TODO: refactor using generic menu item
          <ComboboxOption {...props}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <ColoredAvatar
                src={option.profilePictureUrl}
                alt={option?.displayName}
              />
              <Stack
                sx={(theme) => ({
                  ...theme.typography.ellipsis,
                })}
              >
                <Typography
                  variant={'body1'}
                  sx={(theme) => ({
                    ...theme.typography.ellipsis,
                  })}
                >
                  {option.displayName}
                </Typography>
                <Typography
                  variant={'body2'}
                  sx={(theme) => ({
                    ...theme.typography.ellipsis,
                  })}
                >
                  {option.email}
                </Typography>
              </Stack>
            </Stack>
          </ComboboxOption>
        );
      } else {
        return renderAdditionalOption(props, option, state);
      }
    },
    isOptionEqualToValue = (option, value) => {
      if ('displayName' in option && 'displayName' in value) {
        return option.staffIdentityId === value.staffIdentityId;
      }
      if ('value' in option && 'value' in value) {
        return option.value === value.value;
      }
      return false;
    },
    getOptions = (staffs) => {
      return staffs;
    },
    rootTestId,
    ...rest
  } = props;

  const { data: allStaff = [], isLoading } = useGetStaffOverview({
    select: useCallback((staffs: StaffCore[]) => {
      return sortBySimilarities(staffs, (x) => {
        return x.displayName;
      });
    }, []),
  });

  const sortSelectedValuesToTop = (a: Value, _: Value) => {
    const isAInValue = multiple
      ? // @ts-expect-error this has to be array
        value?.some((v) => isOptionEqualToValue(a, v))
      : isOptionEqualToValue(a, value);
    if (isAInValue) {
      return -1;
    }
    return 1;
  };

  return (
    <ComboBox
      listMode="fixed"
      loading={isLoading}
      filterOptions={filterOptions}
      onChange={(event, value, reason, details) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onChange?.(event, value, reason, details);
      }}
      getOptionLabel={(option) => {
        if ('displayName' in option) {
          return option.displayName || t('general.unknown-label');
        }
        if ('value' in option) {
          return option.label;
        }
        return '';
      }}
      itemKey={(index, options) => {
        const option = options[index];
        if ('displayName' in option) {
          return option.staffIdentityId;
        }
        if ('value' in option) {
          return option.value;
        }
        return '';
      }}
      itemSize={itemSize}
      options={getOptions(allStaff).sort(sortSelectedValuesToTop)}
      value={value}
      isOptionEqualToValue={isOptionEqualToValue}
      multiple={multiple as any}
      renderOption={renderOption}
      slotProps={{
        root: {
          'data-testid': rootTestId,
        },
      }}
      {...rest}
    />
  );
}
