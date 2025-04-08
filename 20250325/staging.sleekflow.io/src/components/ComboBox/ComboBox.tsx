import { flip, offset, shift, size } from '@floating-ui/dom';
import { useSlotProps } from '@mui/base';
import {
  AutocompleteValue,
  Checkbox,
  CircularProgress,
  InputAdornment,
  inputBaseClasses,
  ListItem,
  listItemClasses,
  ListItemText,
  listItemTextClasses,
  OutlinedInput,
  Stack,
  useForkRef,
  useFormControl,
  useThemeProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import React, {
  createContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { VariableSizeList } from 'react-window';

import { ComboBoxPrimitiveFixedSizeVirtualList } from '@/components/ComboBoxPrimitive/ComboBoxPrimitive';
import Icon from '@/components/Icon';
import { InputLabel } from '@/components/InputLabel';

import {
  ComboboxItemOwnerState,
  ComboboxOptionProps,
  ComboBoxPrimitiveProvider,
  ComboBoxPrimitiveRoot,
  ComboBoxPrimitiveVariableSizeVirtualList,
  DEFAULT_SEARCH_AUTOCOMPLETE_ITEM_HEIGHT,
  DEFAULT_SEARCH_AUTOCOMPLETE_LIST_MAX_HEIGHT,
  getComboBoxPrimitiveVirtualListItem,
  useComboBoxPrimitive,
} from '../ComboBoxPrimitive';
import { Popup } from '../Popup';
import type {
  ComboboxCreatableItemProps,
  ComboboxInputOwnerState,
  ComboboxInputProps,
  ComboboxPopupContextValue,
  ComboboxPopupProps,
  ComboboxProps,
  ComboboxTriggerOwnerState,
  ComboboxTriggerProps,
} from './ComboBoxTypes';
import { ClearSelections } from './ClearSelections';

const ComboboxPopperContext = createContext<ComboboxPopupContextValue | null>(
  null,
);

export const useComboboxPopper = () => {
  return React.useContext(ComboboxPopperContext);
};

const ComboboxItemRoot = styled(ListItem, {
  name: 'SfComboBoxPrimitive',
  slot: 'root',
  overridesResolver: (props, styles) => {
    return [styles.root];
  },
})<{ ownerState: ComboboxItemOwnerState }>(({ theme }) => ({
  '&:hover': {
    color: theme.palette.blue[90],
    background: theme.palette.componentToken.menu.bgHover,
    [`& .${listItemTextClasses.root} span`]: {
      color: 'inherit',
    },
  },
  padding: theme.spacing(0.75, 1.875),
  '&.Mui-focused': {
    background: theme.palette.componentToken.menu.bgHover,
  },
  justifyContent: 'space-between',
  wordBreak: 'break-word',
  [`&.${listItemClasses.root}`]: {
    height: 'max-content !important',
    minHeight: `${DEFAULT_SEARCH_AUTOCOMPLETE_ITEM_HEIGHT}px`,
  },
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
}));

const ComboboxInputRoot = styled(OutlinedInput, {
  name: 'SfComboboxInput',
  slot: 'root',
  overridesResolver: (props, styles) => {
    return [styles.root];
  },
})<{ ownerState: ComboboxInputOwnerState }>(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
}));

const ComboboxTriggerRoot = styled('button', {
  name: 'SfComboboxTrigger',
  slot: 'root',
})<{ ownerState: ComboboxTriggerOwnerState }>(({ theme, ownerState }) => ({
  ...theme.typography.body1,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  width: 'inherit',
  border: '1px solid',
  display: 'flex',
  alignItems: 'center',
  textAlign: 'start',
  ...(ownerState.shape === 'rectangle' && {
    borderRadius: theme.shape.borderRadius,
  }),
  ...(ownerState.shape === 'pill' && {
    borderRadius: theme.shape.borderRadius * 500,
  }),
  ...(ownerState.size === 'large' && {
    minHeight: '40px',
  }),
  ...(ownerState.size === 'small' && {
    minHeight: '32px',
  }),
  padding: `${theme.spacing(0.8)} ${theme.spacing(1.5)}`,
  justifyContent: 'space-between',
  gap: theme.spacing(0.5),
  background: theme.palette.componentToken.dropdown.bgEnabled,
  borderColor: theme.palette.componentToken.dropdown.borderEnabled,
  color: theme.palette.componentToken.dropdown.textEnabled,
  ':hover': {
    borderColor: theme.palette.componentToken.dropdown.borderHover,
    color: theme.palette.componentToken.dropdown.textHover,
    background: theme.palette.componentToken.dropdown.bgHover,
  },
  ...(ownerState.children && {
    color: theme.palette.componentToken.dropdown.textSelected,
    ':hover': {
      borderColor: theme.palette.componentToken.dropdown.borderHover,
      color: theme.palette.componentToken.dropdown.textSelected,
      background: theme.palette.componentToken.dropdown.bgHover,
    },
  }),
  ...(ownerState.open && {
    borderColor: theme.palette.componentToken.dropdown.borderFocus,
    boxShadow: theme.shadow.sm,
  }),
  ...(ownerState.disabled && {
    background: theme.palette.componentToken.dropdown.bgDisabled,
    borderColor: theme.palette.componentToken.dropdown.borderDisabled,
    color: theme.palette.componentToken.dropdown.textDisabled,
    ':hover': {
      borderColor: theme.palette.componentToken.dropdown.borderDisabled,
    },
  }),
  ...(ownerState.error && {
    borderColor: theme.palette.componentToken.dropdown.borderError,
    background: theme.palette.componentToken.dropdown.bgError,
    color: theme.palette.componentToken.dropdown.textError,
    ':hover': {
      borderColor: theme.palette.componentToken.dropdown.borderError,
    },
  }),
  ...(ownerState.focused && {
    background: theme.palette.componentToken.dropdown.bgFocus,
    color: theme.palette.componentToken.dropdown.textEnabled,
    ...(ownerState.children && {
      color: theme.palette.componentToken.dropdown.textFocus,
    }),
    borderColor: theme.palette.componentToken.dropdown.borderFocus,
    boxShadow: theme.shadow.sm,
    ':hover': {
      borderColor: theme.palette.componentToken.dropdown.borderFocus,
    },
  }),
  ':focus': {
    background: theme.palette.componentToken.dropdown.bgFocus,
    color: theme.palette.componentToken.dropdown.textEnabled,
    ...(ownerState.children && {
      color: theme.palette.componentToken.dropdown.textFocus,
    }),
    borderColor: theme.palette.componentToken.dropdown.borderFocus,
    boxShadow: theme.shadow.sm,
    ':hover': {
      borderColor: theme.palette.componentToken.dropdown.borderFocus,
    },
  },
}));

const ComboboxTriggerPopupIcon = styled(Icon, {
  name: 'SfComboboxTrigger',
  slot: 'popupIcon',
})<{ ownerState: ComboboxTriggerOwnerState }>(({ theme, ownerState }) => ({
  color: theme.palette.iconBorderEnabled,
  flexShrink: 0,
  ...(ownerState.disabled && {
    color: theme.palette.iconBorderDisabled,
  }),
}));

const ComboboxItemSelectedIcon = styled('div', {
  name: 'SfComboboxOption',
  slot: 'selectedIcon',
})(({ theme }) => ({
  '& svg': {
    color: theme.palette.blue[90],
    width: '20px',
    height: '20px',
    flexShrink: 0,
  },
}));

const ComboboxCreateItemRoot = styled('li', {
  name: 'SfComboboxCreatableItem',
  slot: 'root',
})(({ theme }) => ({
  overflow: 'hidden',
  ':hover': {
    background: theme.palette.componentToken.menu.bgHover,
  },
  [`&.Mui-focused`]: {
    background: theme.palette.componentToken.menu.bgHover,
  },
  justifyContent: 'flex-start',
  height: '48px',
  padding: `0 ${theme.spacing(1.5)}`,
  display: 'flex',
  gap: theme.spacing(0.5),
  alignItems: 'center',
}));

const ComboboxCreateItemPrefix = styled(
  'span',
  {},
)(({ theme }) => ({
  color: theme.palette.blue[90],
  flexShrink: 0,
  ...theme.typography.button2,
}));

const ComboboxCreateItemContent = styled('div', {
  name: 'SfComboboxCreateItemContent',
  slot: 'content',
})({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  width: '100%',
});

function getListHeight<
  Value,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
  ListMode extends 'fixed' | 'dynamic-measure' | 'explicit' = 'dynamic-measure',
>({
  listMode,
  itemSize,
  groupedOptions,
  getRowHeight,
}: {
  getRowHeight: (index: number) => number;
  groupedOptions: Value[];
} & Pick<
  ComboboxProps<Value, Multiple, DisableClearable, FreeSolo, ListMode>,
  'listMode' | 'itemSize'
>) {
  if (listMode === 'fixed') {
    return (itemSize as number) * groupedOptions.length;
  }
  if (listMode === 'explicit') {
    return groupedOptions.reduce((acc, nextVal, currentIndex) => {
      return acc + (itemSize as (idx: number) => number)(currentIndex);
    }, 0);
  }

  if (listMode === 'dynamic-measure') {
    return groupedOptions.reduce((acc, nextVal, currentIndex) => {
      return acc + getRowHeight(currentIndex);
    }, 0);
  }

  throw new Error('Invalid listMode');
}

const ComboboxItemContent = styled(ListItemText, {
  name: 'SfComboboxOption',
  slot: 'content',
})(() => ({}));

export function ComboBox<
  Value,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
  ListMode extends 'dynamic-measure' | 'explicit' | 'fixed' = 'dynamic-measure',
>(
  inProps: ComboboxProps<Value, Multiple, DisableClearable, FreeSolo, ListMode>,
) {
  const props = useThemeProps({ props: inProps, name: 'SfCombobox' });
  const comboBoxContext = useComboboxPopper();
  const listRef = useRef<VariableSizeList>(null);
  const rowHeights = useRef<Record<string, number>>({});

  function getRowHeight(index: number) {
    return rowHeights.current[index] || DEFAULT_SEARCH_AUTOCOMPLETE_ITEM_HEIGHT;
  }

  function setRowHeight(index: number, size: number) {
    if (listRef.current) {
      listRef.current?.resetAfterIndex(0);
      rowHeights.current = { ...rowHeights.current, [index]: size };
    }
  }

  const {
    multiple,
    getOptionLabel = (option) =>
      // @ts-expect-error not sure why
      'label' in option ? (option?.label as string) : '',
    renderOption = (optionProps, option) => (
      <ComboboxOption {...optionProps}>
        {getOptionLabel(option) ?? ''}
      </ComboboxOption>
    ),
    renderInput = ({ size: _, color: __, ...inputProps }) => (
      <ComboboxInput {...inputProps} />
    ),
    onChange,
    noResultsText,
    loadingText = <CircularProgress />,
    slotProps,
    itemKey,
    listMode = 'dynamic-measure',
    itemSize = listMode === 'fixed'
      ? DEFAULT_SEARCH_AUTOCOMPLETE_ITEM_HEIGHT
      : listMode === 'explicit'
        ? () => DEFAULT_SEARCH_AUTOCOMPLETE_ITEM_HEIGHT
        : undefined,
    ...rest
  } = props;

  if (listMode !== 'fixed') {
    // safe because listMode is a stable value and will not change through renders
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (listRef.current) {
        listRef.current?.resetAfterIndex(0);
      }
    }, [rowHeights]);
  }

  const VirtualListElement =
    listMode === 'dynamic-measure' || listMode === 'explicit'
      ? ComboBoxPrimitiveVariableSizeVirtualList
      : ComboBoxPrimitiveFixedSizeVirtualList;
  const disableCloseOnSelect =
    comboBoxContext?.disableCloseOnSelect === undefined
      ? multiple
      : comboBoxContext?.disableCloseOnSelect;

  const maxListHeight = DEFAULT_SEARCH_AUTOCOMPLETE_LIST_MAX_HEIGHT;
  const responsiveListHeight =
    comboBoxContext?.availableListHeight &&
    comboBoxContext?.availableListHeight < maxListHeight
      ? comboBoxContext?.availableListHeight
      : maxListHeight;

  const rootProps = useSlotProps({
    elementType: ComboBoxPrimitiveRoot,
    // @ts-expect-error bad type inferrance
    externalSlotProps: slotProps?.root,
  });

  const { ownerState: _, ...listProps } = useSlotProps({
    elementType: VirtualListElement,
    externalSlotProps: {
      ...slotProps?.list,
    },
    externalForwardedProps: {
      // @ts-expect-error bad type inferrance
      noResultsText,
      itemSize,
      loadingText,
      itemKey,
    },
  });

  return (
    <ComboBoxPrimitiveProvider
      {...rest}
      getOptionLabel={getOptionLabel}
      multiple={multiple}
      onChange={(event, newValue, reason, details) => {
        // disable delete option on backspace
        if (reason === 'clear') {
          return;
        }

        // close popper on select option
        if (!disableCloseOnSelect) {
          comboBoxContext?.setOpen(false);
        }

        onChange?.(event, newValue, reason, details);
      }}
    >
      {({ getInputProps, groupedOptions }) => {
        const inputProps = getInputProps();
        const size = getListHeight({
          groupedOptions: groupedOptions as Value[],
          listMode,
          getRowHeight,
          // @ts-expect-error bad type inference
          itemSize,
        });
        const height =
          size < responsiveListHeight ? size : responsiveListHeight;
        return (
          <ComboBoxPrimitiveRoot {...rootProps}>
            {renderInput(inputProps)}
            {multiple && !props.disableClearable && (
              <ClearSelections
                count={(props.value as Value[])?.length ?? 0}
                handleClear={(e) => {
                  onChange?.(
                    e,
                    [] as AutocompleteValue<
                      Value,
                      Multiple,
                      DisableClearable,
                      FreeSolo
                    >,
                    'clear',
                  );
                }}
              />
            )}
            {/* @ts-expect-error bad type inference */}
            <VirtualListElement
              height={height}
              {...(listMode === 'dynamic-measure' && {
                itemSize: getRowHeight,
                ref: listRef,
              })}
              {...(listMode === 'fixed' && {
                itemSize,
              })}
              itemCount={groupedOptions.length}
              {...listProps}
            >
              {getComboBoxPrimitiveVirtualListItem({
                renderOption,
                setRowHeight,
              })}
            </VirtualListElement>
          </ComboBoxPrimitiveRoot>
        );
      }}
    </ComboBoxPrimitiveProvider>
  );
}

export const ComboboxPopupTrigger = React.forwardRef<
  HTMLButtonElement,
  ComboboxTriggerProps
>(function ComboboxTrigger(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'SfComboboxTrigger' });
  const formControlContext = useFormControl();
  const {
    clearable,
    onClear,
    error: errorProp = false,
    placeholder = 'Search',
    className,
    size = 'large',
    shape = 'rectangle',
    disabled: disabledProp = false,
    children,
    open = false,
    type = 'button',
    ...rest
  } = props;
  const disabled = formControlContext?.disabled || disabledProp;
  const error = errorProp || formControlContext?.error;
  const focused = open || formControlContext?.focused;
  const ownerState = {
    focused,
    error,
    open,
    className,
    shape,
    size,
    children,
    disabled,
    onClear,
    ...rest,
  };

  return (
    <ComboboxTriggerRoot
      ref={ref}
      type={type}
      className={clsx(className, {
        'Mui-disabled': disabled,
      })}
      ownerState={ownerState}
      disabled={disabled}
      {...rest}
    >
      <div
        style={{
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          flexShrink: 1,
          flexGrow: 1,
        }}
      >
        {children ? children : placeholder}
      </div>
      {onClear && clearable ? (
        <ComboboxTriggerPopupIcon
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          ownerState={ownerState}
          icon={'x-close'}
          size={size === 'large' ? 'small' : 'x-small'}
        />
      ) : null}
      <ComboboxTriggerPopupIcon
        ownerState={ownerState}
        icon={open ? 'chevron-up' : 'chevron-down'}
        size={size === 'large' ? 'small' : 'x-small'}
      />
    </ComboboxTriggerRoot>
  );
}) as React.ForwardRefExoticComponent<
  ComboboxTriggerProps & React.RefAttributes<HTMLButtonElement>
>;

export const ComboboxPopup = (inProps: ComboboxPopupProps) => {
  const props = useThemeProps({ props: inProps, name: 'SfComboboxPopup' });
  const {
    children,
    contentSameWidthAsTrigger = true,
    disableCloseOnSelect,
    padding = {
      top: 5,
      bottom: 75,
      left: 5,
      right: 5,
    },
    offset: offsetProp = 8,
    placement = 'bottom',
    label,
    ...other
  } = props;
  const [open, setOpen] = useState(false);
  const [availableListHeight, setAvailableListHeight] = useState<
    number | undefined
  >(undefined);

  return (
    <ComboboxPopperContext.Provider
      value={{
        open,
        setOpen,
        disableCloseOnSelect,
        availableListHeight,
      }}
    >
      <Popup
        style={{
          zIndex: 1301,
          width: 'max-content',
        }}
        open={open}
        placement={placement}
        onOpenChange={(open) => {
          setOpen(open);
        }}
        middleware={[
          flip(),
          offset(offsetProp),
          size({
            padding: padding,
            apply({ availableHeight, elements }) {
              setAvailableListHeight(availableHeight);

              const { width } = elements.reference.getBoundingClientRect();

              if (contentSameWidthAsTrigger) {
                Object.assign(elements.floating.style, {
                  width: `${width}px`,
                });
              }

              Object.assign(elements.floating.style, {
                maxHeight: `${availableHeight}px`,
              });
            },
          }),
          shift(),
        ]}
        {...other}
      >
        <Stack
          sx={{
            [`.${inputBaseClasses.root}`]: {
              margin: (theme) => {
                if (label) {
                  return theme.spacing(0, 1.5, 1.5, 1.5);
                }
                return theme.spacing(1.5);
              },
            },
          }}
        >
          {label ? (
            <InputLabel
              sx={{
                padding: (theme) => theme.spacing(0, 1.5),
              }}
            >
              {label}
            </InputLabel>
          ) : null}
          {children}
        </Stack>
      </Popup>
    </ComboboxPopperContext.Provider>
  );
};

export const ComboboxInput = React.forwardRef<
  HTMLInputElement,
  ComboboxInputProps
>(function ComboboxInput(inProps, ref) {
  const comboboxPopper = useComboboxPopper();
  const props = useThemeProps({ props: inProps, name: 'SfComboboxInput' });
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    startAdornment = (
      <InputAdornment position={'start'}>
        <Icon icon="search" />
      </InputAdornment>
    ),
    placeholder = 'Search',
    onKeyDown,
    ...other
  } = props;

  const forkedRef = useForkRef(inputRef, ref);

  useLayoutEffect(() => {
    // make sure everything is loaded before focusing input to prevent layout shift
    requestAnimationFrame(() => {
      if (inputRef.current && comboboxPopper?.open) {
        inputRef.current.focus();
      }
    });
  }, [comboboxPopper?.open]);

  const ownerState = {
    startAdornment,
    placeholder,
    ...other,
  };

  return (
    <ComboboxInputRoot
      ownerState={ownerState}
      placeholder={placeholder}
      startAdornment={startAdornment}
      inputProps={{ ref: forkedRef }}
      onKeyDown={(event) => {
        // stops backspace deleting an option
        if (event.key === 'Backspace' || event.key === 'Delete') {
          event.stopPropagation();
        }
        onKeyDown?.(event);
      }}
      {...other}
    />
  );
});

export const ComboboxOption = React.forwardRef<
  HTMLLIElement,
  ComboboxOptionProps
>(function ComboboxOption(inProps, ref) {
  const { multiple } = useComboBoxPrimitive();
  const props = useThemeProps({ props: inProps, name: 'SfComboboxOption' });
  const { children, 'aria-selected': selectedProp, ...other } = props;
  const ownerState = { multiple, ...other };
  const selected = !!selectedProp;
  const singleSelected = selected && !multiple;

  return (
    // TODO: extract into generic menu item
    <ComboboxItemRoot
      ref={ref}
      {...other}
      aria-selected={selectedProp}
      onClick={other?.onClick}
      ownerState={ownerState}
    >
      <ComboboxItemContent>{children}</ComboboxItemContent>
      {singleSelected && (
        <ComboboxItemSelectedIcon>
          <Icon icon="check-single" />
        </ComboboxItemSelectedIcon>
      )}
      {multiple && (
        <Checkbox
          sx={{
            flexShrink: 0,
          }}
          checked={selected}
        />
      )}
    </ComboboxItemRoot>
  );
});

export const ComboboxCreateOption = (inProps: ComboboxCreatableItemProps) => {
  const { inputValue } = useComboBoxPrimitive();
  const props = useThemeProps({
    props: inProps,
    name: 'SfComboboxCreateOption',
  });
  const { createNewPrefix, ...other } = props;

  return (
    <ComboboxCreateItemRoot {...other}>
      <ComboboxCreateItemPrefix>{createNewPrefix}</ComboboxCreateItemPrefix>
      <ComboboxCreateItemContent>{inputValue}</ComboboxCreateItemContent>
    </ComboboxCreateItemRoot>
  );
};
