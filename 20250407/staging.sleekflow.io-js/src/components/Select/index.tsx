import {
  Box,
  Checkbox,
  ListSubheader,
  MenuItem,
  Select as MUISelect,
  SelectChangeEvent,
  SelectProps as MUISelectProps,
  Stack,
  styled,
  Typography,
  useControlled,
} from '@mui/material';
import {
  CSSProperties,
  MouseEvent,
  ReactNode,
  SyntheticEvent,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import Icon, { IconProps } from '../Icon';
import { ScrollArea } from '../ScrollArea';
import { ClearSelections } from './ClearSelections';
import { TruncateSelectedItems } from './TruncateSelectedItems';

interface SelectOption {
  label?: ReactNode;
  value?: string | null;
  icon?: ReactNode | IconProps['icon'];
}

const defaultAnchorOrigin = { vertical: 'bottom', horizontal: 'left' } as const;

export interface SelectProps<Value>
  extends Omit<MUISelectProps<Value>, 'variant'> {
  variant?: MUISelectProps<Value>['variant'] | 'filter';
  isActiveFilter?: boolean;
  value?: Value;
  onChange?: (e: SelectChangeEvent<Value>, child: ReactNode) => void;
  shape?: 'pill';
  options?: SelectOption[];
  menuMaxHeight?: CSSProperties['maxHeight'];
  menuHeader?: ReactNode;
  menuFooter?: ReactNode;
  clearable?: boolean;
  anchorOrigin?: NonNullable<MUISelectProps['MenuProps']>['anchorOrigin'];
  transformOrigin?: NonNullable<MUISelectProps['MenuProps']>['transformOrigin'];
  valuePrefix?: ReactNode;
  labelMaxWidth?: number;
  renderOptions?: (value: Value | undefined) => ReactNode[];
  menuMaxWidth?: CSSProperties['maxWidth'];
  noOptionsText?: ReactNode;
  maxOptions?: number;
  'data-testid'?: string;
}

const MenuPaperRoot = styled(ScrollArea)<{
  menuMaxHeight?: CSSProperties['maxHeight'];
  menuMaxWidth?: CSSProperties['maxWidth'];
}>(({ theme, menuMaxHeight, menuMaxWidth }) => ({
  background: theme.palette.white,
  maxWidth: menuMaxWidth ?? '260px',
  '& div': {
    maxHeight: menuMaxHeight ?? '340px',
  },
  boxShadow: theme.shadow.lg,
}));

export const SelectMenuItem = styled(MenuItem)<{
  autoWidth?: boolean;
  maxWidth?: CSSProperties['maxWidth'];
}>(({ theme, autoWidth, maxWidth }) => ({
  ...(autoWidth && { maxWidth: maxWidth ?? '260px' }),
  height: '48px',
  marginBottom: 0,
  '&.Mui-selected:not(:hover)': {
    backgroundColor: 'transparent !important',
    color: theme.palette.gray[90],
  },
}));

const useSelectVariant = <Value,>({
  size,
  shape,
  variant,
  ...props
}: Partial<SelectProps<Value>>) => {
  const isFilter = variant === 'filter';
  return {
    variant,
    muiVariant: isFilter ? undefined : variant,
    size: isFilter ? 'small' : size,
    shape: isFilter ? 'pill' : shape,
    ...props,
  };
};

const Select = <Value = unknown,>({
  value,
  onChange,
  options,
  multiple,
  placeholder,
  label,
  MenuProps,
  onOpen,
  onClose,
  menuMaxHeight,
  menuHeader,
  menuFooter,
  anchorOrigin = defaultAnchorOrigin,
  transformOrigin,
  clearable,
  valuePrefix,
  autoWidth = true,
  labelMaxWidth,
  startAdornment,
  sx,
  isActiveFilter: isActiveFilterProp,
  renderOptions,
  menuMaxWidth,
  noOptionsText,
  maxOptions = Infinity,
  ...rest
}: SelectProps<Value>) => {
  const {
    variant,
    muiVariant,
    size,
    shape,
    open: openProps,
    ...props
  } = useSelectVariant<Value>(rest);

  const { t } = useTranslation();
  const [internalValue, setInternalValue] = useControlled({
    name: 'value',
    controlled: value,
    default: (multiple ? [] : '') as unknown as Value,
  });

  const hasSelectedValues = Array.isArray(value) && value.length > 0;
  const hasSelectedValue = !Array.isArray(value) && !!value;
  const isActiveFilter =
    variant === 'filter' &&
    (isActiveFilterProp ?? (hasSelectedValue || hasSelectedValues));

  const renderIcon = (icon?: ReactNode) =>
    typeof icon === 'string' ? (
      <Icon icon={icon as IconProps['icon']} size={size} sx={{ p: '2px' }} />
    ) : (
      icon
    );

  const renderValue = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const optionsMap: any = (options || []).reduce(
      (acc, option) => ({ ...acc, [String(option.value)]: option }),
      {},
    );

    if (Array.isArray(value)) {
      return (
        <TruncateSelectedItems
          key={value.length}
          spacing={0.5}
          maxWidth={labelMaxWidth}
        >
          {({ getPrefixLabelProps }) =>
            hasSelectedValues ? (
              <>
                {variant === 'filter' && (
                  <span {...getPrefixLabelProps()}>
                    {valuePrefix ||
                      t('general.select-label-prefix', {
                        defaultValue:
                          '{filterLabel}{count, plural, =0{} other{:}}',
                        filterLabel: label,
                        count: value.length,
                      })}
                  </span>
                )}
                {value.map((val, index) => (
                  <Stack
                    key={val}
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                  >
                    {renderIcon(optionsMap[val]?.icon)}
                    <span>
                      {optionsMap[val]?.label || val}
                      {index === value.length - 1 ? '' : ','}
                    </span>
                  </Stack>
                ))}
              </>
            ) : (
              <Box
                {...getPrefixLabelProps()}
                {...(variant !== 'filter' &&
                  placeholder && { color: 'gray.70' })}
                component="span"
              >
                {(variant !== 'filter' && placeholder) || label}
              </Box>
            )
          }
        </TruncateSelectedItems>
      );
    }

    const selected: SelectOption | undefined = optionsMap[value];

    return (
      <Stack
        direction="row"
        spacing={size === 'small' ? 0.5 : 1}
        alignItems="center"
        height="100%"
        sx={(theme) => ({
          overflow: 'hidden',
          ...theme.typography[size === 'small' ? 'body2' : 'body1'],
          color: 'inherit',
        })}
      >
        {selected ? (
          <>
            {typeof valuePrefix === 'string' ? (
              <span>{valuePrefix}</span>
            ) : (
              valuePrefix
            )}
            {renderIcon(selected.icon)}
            <Box
              component="span"
              sx={(theme) => ({
                ...theme.typography.ellipsis,
              })}
            >
              {selected.label}
            </Box>
          </>
        ) : (
          <>
            {placeholder ? (
              <Box component="span" color="gray.70">
                {placeholder}
              </Box>
            ) : (
              <span>{valuePrefix || label}</span>
            )}
          </>
        )}
      </Stack>
    );
  };

  const [_open, setOpen] = useState(false);
  const open = openProps !== undefined ? openProps : _open;

  const handleOpen = (e: SyntheticEvent<Element, Event>) => {
    setOpen(true);
    onOpen?.(e);
  };

  const handleClose = (e: SyntheticEvent<Element, Event>) => {
    setOpen(false);
    onClose?.(e);
  };

  const handleChange = (e: SelectChangeEvent<Value>, child: ReactNode) => {
    setInternalValue(e.target.value as Value);
    onChange?.(e, child);
  };

  const handleClear = (e: MouseEvent<HTMLElement>) => {
    const event = Object.assign(e, {
      target: { value: multiple ? [] : '' },
    }) as unknown as SelectChangeEvent<Value>;
    onChange?.(event, null);
  };

  const showMenuHeader =
    !(multiple && clearable) && menuHeader !== false && !!(menuHeader || label);
  const showClearMultiple = clearable && Array.isArray(value);
  const showClearSingle = clearable && !multiple;

  return (
    <MUISelect
      variant={muiVariant}
      size={size}
      label={label}
      autoWidth={autoWidth}
      placeholder={placeholder}
      renderValue={renderValue}
      displayEmpty
      value={internalValue}
      onChange={handleChange}
      multiple={multiple}
      onOpen={handleOpen}
      onClose={handleClose}
      startAdornment={startAdornment}
      data-testid={props['data-testid']}
      MenuProps={{
        anchorOrigin,
        transformOrigin,
        slotProps: {
          paper: {
            sx: {
              mt: 1,
              borderRadius: 1,
            },
            // @ts-expect-error -- menuMaxHeight is a custom prop to MenuPaperRoot
            menuMaxHeight,
            menuMaxWidth,
          },
        },
        MenuListProps: {
          sx: {
            pt: showMenuHeader || showClearMultiple ? 0 : 0.5,
            pb: 0,
          },
        },
        slots: {
          paper: MenuPaperRoot,
          ...MenuProps?.slots,
        },
        ...MenuProps,
      }}
      sx={(theme) => ({
        ...(variant === 'filter' && {
          background: 'white',
          '&& .MuiSelect-select': {
            borderRadius: 6,
          },
        }),
        '&& .MuiSelect-select': {
          height: '100%',
          py: 0,
        },
        ...(shape === 'pill' && {
          borderRadius: 6,
        }),
        ...(size === 'small' && {
          '&& .MuiSelect-select': {
            height: '24px',
            py: 1,
            lineHeight: 'unset',
            ...theme.typography.body2,
            color: 'inherit',
            ...(startAdornment && {
              paddingInlineStart: 0,
            }),
          },
          '& .MuiSelect-icon': {
            top: 'calc(50% - 8px)',
            right: '8px',
            padding: '2px',
            fill: isActiveFilter
              ? `${theme.palette.blue[90]} !important`
              : 'currentColor',
          },
          ...(variant === 'standard' && {
            height: 'initial',
            paddingInlineEnd: 2.5,
            ':hover': {
              bgcolor: 'gray.10',
            },
            ...(open && {
              boxShadow: `0 0 0 1px ${theme.palette.blue[90]} !important`,
            }),

            '& .MuiSelect-standard': {
              px: '8px !important',
              py: '4px !important',
              height: 'unset !important',
              minHeight: 'unset !important',
              ...theme.typography.body2,
            },
          }),
          ...(isActiveFilter && {
            '&.MuiOutlinedInput-root': {
              color: 'blue.90',
              background: theme.palette.blue[10],
              borderColor: theme.palette.blue[20],
              ':hover': {
                background: theme.palette.blue[5],
                borderColor: theme.palette.blue[20],
              },
              '&.Mui-focused': {
                color: 'blue.90',
                background: theme.palette.blue[10],
              },
            },
            '&& .MuiOutlinedInput-input': {
              backgroundColor: theme.palette.blue[10],
              backgroundClip: 'content-box',
              ':hover': {
                background: theme.palette.blue[5],
                backgroundClip: 'content-box',
              },
            },
          }),
        }),
        ...sx,
      })}
      open={open}
      {...props}
    >
      {showMenuHeader && (
        <ListSubheader sx={{ lineHeight: '40px', px: 1.5 }}>
          {typeof menuHeader === 'string' || (label && !menuHeader) ? (
            <Typography variant="subtitle" textTransform="uppercase" pt={0.5}>
              {menuHeader || label}
            </Typography>
          ) : (
            menuHeader
          )}
        </ListSubheader>
      )}
      {showClearMultiple && (
        <ClearSelections count={value.length} handleClear={handleClear} />
      )}
      {showClearSingle && (
        <SelectMenuItem
          value=""
          autoWidth={autoWidth}
          maxWidth={menuMaxWidth}
          sx={{ justifyContent: 'space-between' }}
        >
          {t('select.menu-item-none', 'None')}
          {!value && (
            <Icon icon="check-single" size={16} sx={{ color: 'blue.90' }} />
          )}
        </SelectMenuItem>
      )}
      {!options?.length && noOptionsText}
      {options?.map((option) => {
        const isCheckboxChecked =
          Array.isArray(value) && value.includes(option.value);
        const isDisabled =
          Array.isArray(value) &&
          !isCheckboxChecked &&
          value.length >= maxOptions;

        return (
          <SelectMenuItem
            key={String(option.value)}
            value={String(option.value)}
            autoWidth={autoWidth}
            maxWidth={menuMaxWidth}
            disabled={isDisabled}
          >
            <Stack
              direction="row"
              spacing={1}
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                overflow="hidden"
              >
                {renderIcon(option.icon)}
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {option.label}
                </div>
              </Stack>
              {typeof value === 'string' && option.value === value && (
                <Icon icon="check-single" size={16} sx={{ color: 'blue.90' }} />
              )}
              {Array.isArray(value) && (
                <Checkbox
                  disabled={isDisabled}
                  checked={isCheckboxChecked}
                  sx={{ flexShrink: 0 }}
                />
              )}
            </Stack>
          </SelectMenuItem>
        );
      })}
      {renderOptions && renderOptions(value)}
      {menuFooter}
    </MUISelect>
  );
};

Select.displayName = 'Select';

export default Select;
