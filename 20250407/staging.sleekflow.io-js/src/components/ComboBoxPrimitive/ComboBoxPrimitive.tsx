import {
  AutocompleteGroupedOption,
  menuItemClasses,
  MenuItemProps,
  useAutocomplete,
  UseAutocompleteReturnValue,
  useControlled,
  useForkRef,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import * as React from 'react';
import {
  ComponentType,
  createContext,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  FixedSizeList,
  ListChildComponentProps,
  VariableSizeList,
} from 'react-window';

import { ScrollArea } from '@/components/ScrollArea';

import {
  ComboBoxPrimitiveContextValue,
  ComboBoxPrimitiveFixedSizeVirtualListProps,
  ComboBoxPrimitiveListProps,
  ComboBoxPrimitiveProviderProps,
  ComboBoxPrimitiveRootProps,
  ComboBoxPrimitiveVariableSizeVirtualListProps,
  ComboBoxPrimitiveVirtualListItemProps,
  GetComboBoxPrimitiveVirtualListItemProps,
} from './ComboBoxPrimitiveTypes';

export const DEFAULT_SEARCH_AUTOCOMPLETE_ITEM_HEIGHT = 44;
export const DEFAULT_SEARCH_AUTOCOMPLETE_LIST_MAX_HEIGHT =
  DEFAULT_SEARCH_AUTOCOMPLETE_ITEM_HEIGHT * 7;
const ComboBoxPrimitiveContext =
  createContext<ComboBoxPrimitiveContextValue | null>(null);

const DummyOption = styled('li', {
  name: 'SfComboBoxPrimitive',
  slot: 'DummyOption',
})(() => ({
  height: '44px',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ComboBoxPrimitiveVirtualListOuterElementType = React.forwardRef<
  HTMLUListElement,
  {
    children:
      | ((options: UseAutocompleteReturnValue<any>) => React.ReactNode)
      | React.ReactNode;
  } & ComboBoxPrimitiveListProps
>(function ComboBoxPrimitiveVirtualListOuterElementType(
  { children, style, ...rest },
  ref,
) {
  const autocomplete = useComboBoxPrimitive();
  const listboxProps = autocomplete.getListboxProps();
  return (
    <ScrollArea
      slotProps={{
        viewport: {
          //@ts-expect-error incorrect type inferrance
          ref,
          ...listboxProps,
          ...rest,
          style: {
            ...style,
            overflowY: 'unset',
            overflowX: 'unset',
            listStyle: 'none',
          },
        },
      }}
    >
      {children}
    </ScrollArea>
  );
});

export function getComboBoxPrimitiveVirtualListItem<Value = any>({
  renderOption,
  setRowHeight,
}: GetComboBoxPrimitiveVirtualListItemProps<Value>) {
  return function ComboBoxPrimitiveVirtualListItem(
    props: ComboBoxPrimitiveVirtualListItemProps<Value[]>,
  ) {
    const rowRef = useCallback(
      (node: HTMLLIElement | null) => {
        if (node !== null) {
          setRowHeight(props.index, node.getBoundingClientRect().height);
        }
      },
      [props.index],
    );

    const { data, index, style } = props;
    const option = data[index];
    const autocomplete = useComboBoxPrimitive();
    const optionProps = autocomplete.getOptionProps({
      option,
      index,
    });
    return renderOption({ ...optionProps, style, ref: rowRef }, option, {
      selected: !!optionProps['aria-selected'],
      index,
    });
    // seems this error was fixed in later versions of TS to infer the correct type. For now need to cast
  } as unknown as ComponentType<ListChildComponentProps>;
}

export const ComboBoxPrimitiveVariableSizeVirtualList = React.forwardRef<
  VariableSizeList,
  ComboBoxPrimitiveVariableSizeVirtualListProps
>(function ComboBoxPrimitiveVariableSizeVirtualList(props, ref) {
  const autocomplete = useComboBoxPrimitive();
  const { groupedOptions, loading } = autocomplete;
  const {
    children,
    itemCount = groupedOptions.length,
    itemSize = () => DEFAULT_SEARCH_AUTOCOMPLETE_ITEM_HEIGHT,
    height = DEFAULT_SEARCH_AUTOCOMPLETE_LIST_MAX_HEIGHT,
    loadingText = 'loading...',
    noResultsText = 'no results',
    itemData = groupedOptions,
    width = '100%',
    overscanCount = 100,
    ...rest
  } = props;
  const listRef = useRef<VariableSizeList>(null);
  const forkedListRef = useForkRef(ref, listRef);

  useEffect(() => {
    if (listRef.current != null) {
      listRef.current.resetAfterIndex(0, true);
    }
  }, [itemCount]);

  return (
    <>
      {itemData && itemData.length === 0 && (
        <DummyOption>{noResultsText}</DummyOption>
      )}
      {loading && itemData && itemData.length === 0 && (
        <DummyOption>{loadingText}</DummyOption>
      )}
      <VariableSizeList
        ref={forkedListRef}
        itemData={itemData}
        height={height}
        width={width}
        style={{
          ...(((itemData && itemData.length === 0) ||
            (loading && itemData && itemData.length === 0)) && {
            visibility: 'hidden',
            height: 0,
          }),
        }}
        outerElementType={ComboBoxPrimitiveVirtualListOuterElementType}
        itemSize={itemSize}
        overscanCount={overscanCount}
        itemCount={itemCount}
        {...rest}
      >
        {children}
      </VariableSizeList>
    </>
  );
});

export const ComboBoxPrimitiveFixedSizeVirtualList = React.forwardRef<
  FixedSizeList,
  ComboBoxPrimitiveFixedSizeVirtualListProps
>(function ComboBoxPrimitiveFixedSizeVirtualList(props, ref) {
  const autocomplete = useComboBoxPrimitive();
  const { groupedOptions, loading } = autocomplete;
  const {
    children,
    itemCount = groupedOptions.length,
    itemSize = DEFAULT_SEARCH_AUTOCOMPLETE_ITEM_HEIGHT,
    height = DEFAULT_SEARCH_AUTOCOMPLETE_LIST_MAX_HEIGHT,
    loadingText = 'loading...',
    noResultsText = 'no results',
    itemData = groupedOptions,
    width = '100%',
    overscanCount = 100,
    ...rest
  } = props;
  const listRef = useRef<VariableSizeList>(null);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const forkedListRef = useForkRef(ref, listRef);

  return (
    <>
      {itemData && itemData.length === 0 && (
        <DummyOption>{noResultsText}</DummyOption>
      )}
      {loading && itemData && itemData.length === 0 && (
        <DummyOption>{loadingText}</DummyOption>
      )}
      <FixedSizeList
        ref={forkedListRef}
        itemData={itemData}
        height={height}
        width={width}
        style={{
          ...(((itemData && itemData.length === 0) ||
            (loading && itemData && itemData.length === 0)) && {
            visibility: 'hidden',
            height: 0,
          }),
        }}
        outerElementType={ComboBoxPrimitiveVirtualListOuterElementType}
        itemSize={itemSize}
        overscanCount={overscanCount}
        itemCount={itemCount}
        {...rest}
      >
        {children}
      </FixedSizeList>
    </>
  );
});

const MenuItemRoot = styled('li', {
  name: 'SfComboBoxPrimitive',
  slot: 'root',
  overridesResolver: (props, styles) => {
    return [styles.root];
  },
})(({ theme }) => ({
  ':hover': {
    background: theme.palette.componentToken.menu.bgHover,
  },
  [`&.${menuItemClasses.focusVisible}`]: {
    background: theme.palette.componentToken.menu.bgHover,
  },
  height: '48px',
  padding: `0 ${theme.spacing(1.5)}`,
  display: 'flex',
  alignItems: 'center',
}));

export function useComboBoxPrimitive<T = any>() {
  const context = React.useContext(ComboBoxPrimitiveContext);
  if (!context) {
    throw new Error(
      'ComboBoxPrimitive compound components cannot be rendered outside the ComboBoxPrimitive component',
    );
  }
  return context as ComboBoxPrimitiveContextValue<T>;
}

const StyledComboBoxPrimitiveRoot = styled('div', {
  name: 'SfComboBoxPrimitive',
  slot: 'root',
  overridesResolver: (props, styles) => {
    return [styles.root];
  },
})(() => ({
  width: '100%',
  position: 'relative',
  overflow: 'auto',
}));

const defaultIsActiveElementInListbox = (
  listboxRef: React.RefObject<HTMLElement>,
) =>
  listboxRef.current !== null &&
  listboxRef.current.contains(document.activeElement);

export function ComboBoxPrimitiveRoot({
  children,
  onKeyDown,
  ...rest
}: ComboBoxPrimitiveRootProps) {
  const { getRootProps } = useComboBoxPrimitive();
  const rootProps = getRootProps({
    onKeyDown,
  });
  return (
    <StyledComboBoxPrimitiveRoot {...rootProps} {...rest}>
      {children}
    </StyledComboBoxPrimitiveRoot>
  );
}

export function ComboBoxPrimitiveProvider<
  Value,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
>(
  inProps: ComboBoxPrimitiveProviderProps<
    Value,
    Multiple,
    DisableClearable,
    FreeSolo
  >,
) {
  const {
    loading = false,
    open = true,
    inputValue: inputValueProp,
    disableListWrap = true,
    onInputChange = (event, value, reason) => {
      if (reason === 'reset') {
        return;
      }
      setInputValue(value);
    },
    unstable_isActiveElementInListbox = defaultIsActiveElementInListbox,
    multiple,
    children,
    ...rest
  } = inProps;

  const [inputValue, setInputValue] = useControlled({
    controlled: inputValueProp,
    default: '',
    name: 'ComboBoxPrimitive',
  });

  const autocomplete = useAutocomplete<
    Value,
    Multiple,
    DisableClearable,
    FreeSolo
  >({
    open,
    inputValue,
    disableListWrap,
    onInputChange,
    unstable_isActiveElementInListbox,
    multiple,
    ...rest,
  });

  return (
    <ComboBoxPrimitiveContext.Provider
      value={{ ...autocomplete, loading, multiple }}
    >
      {typeof children === 'function'
        ? // @ts-expect-error bad type inferrance
          children(autocomplete)
        : children}
    </ComboBoxPrimitiveContext.Provider>
  );
}

export function ComboBoxPrimitiveList(inProps: ComboBoxPrimitiveListProps) {
  const autocomplete = useComboBoxPrimitive();
  const listboxProps = autocomplete.getListboxProps();
  const {
    children,
    sx,
    maxHeight = DEFAULT_SEARCH_AUTOCOMPLETE_LIST_MAX_HEIGHT,
    ...rest
  } = inProps;
  return (
    <ScrollArea
      slotProps={{
        //@ts-expect-error incorrect type inferrance
        viewport: {
          sx: {
            listStyle: 'none',
            maxHeight,
            ...sx,
          },
          ...listboxProps,
          ...rest,
        },
      }}
    >
      {children}
    </ScrollArea>
  );
}

export const ComboBoxPrimitiveListItem = function ComboBoxPrimitiveListItem<T>(
  inProps: {
    option: any;
    index: number;
    children:
      | ((props: {
          option: T | AutocompleteGroupedOption<T>;
          index: number;
          selected: boolean;
          options: T[] | AutocompleteGroupedOption<T>[];
        }) => React.ReactNode)
      | React.ReactNode;
  } & Omit<MenuItemProps, 'children'>,
) {
  const autocomplete = useComboBoxPrimitive<T>();
  const { option, index, children, className, key, ...rest } = inProps;

  const { getOptionProps, groupedOptions } = autocomplete;
  const optionProps = getOptionProps({
    option,
    index,
  });
  return (
    <MenuItemRoot
      className={clsx(className, {
        'Mui-selected': optionProps['aria-selected'],
      })}
      key={key}
      {...rest}
      {...optionProps}
    >
      {typeof children === 'function'
        ? children({
            option,
            index,
            selected: !!optionProps['aria-selected'],
            options: groupedOptions,
          })
        : children}
    </MenuItemRoot>
  );
};
