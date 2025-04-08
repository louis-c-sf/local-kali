import {
  Tab,
  TabPanel,
  TabPanelProps,
  TabProps,
  Tabs,
  TabsList,
  TabsListProps,
  TabsProps,
} from '@mui/base';
import {
  Box,
  BoxProps,
  debounce,
  MenuItem,
  menuItemClasses,
  Stack,
  styled,
  SxProps,
  Theme,
  Typography,
  TypographyProps,
  useControlled,
} from '@mui/material';
import React, {
  createContext,
  SyntheticEvent,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal, flushSync } from 'react-dom';

import { ListItemProps } from '@/pages/Inbox/NestedMenu';

const NestedMenuLayoutRoot = styled(Box)(() => ({
  display: 'flex',
  width: 'min-content',
}));

type NestedMenuTabsListOwnerState = NestedMenuTabListProps & { width: number };
type NestedMenuTabListProps = TabsListProps & { sx?: SxProps<Theme> };
const NestedMenuTabsListRoot = styled(TabsList)<{
  ownerState: NestedMenuTabsListOwnerState;
}>(({ ownerState }) => ({
  minWidth: `${ownerState.width}px`,
  display: 'flex',
  flexDirection: 'column',

  '& li': {
    minHeight: '48px',
    marginBottom: 0,
  },
}));

const NestedMenuTabsRoot = styled(Tabs)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

const NestedMenuTabPanelRoot = styled(TabPanel)<{
  ownerState: NestedMenuTabPanelPropsOwnerState;
}>(({ theme, ownerState }) => ({
  minWidth: `${ownerState.width}px`,
  [ownerState.dir === 'ltr' ? 'borderLeft' : 'borderRight']: '1px solid',
  borderColor: theme.palette.borderEnabled,
}));

type NestedMenuContext = {
  panelAnchorEl: HTMLDivElement | null;
  setPanelAnchorEl: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
  onTabChange?: () => void;
  width: number;
  dir: 'ltr' | 'rtl';
};

type NestedMenuTabsContext = {
  tab: string | number | null;
  setTab: React.Dispatch<React.SetStateAction<string | number | null>>;
};

const NestedMenuTabRoot = styled(Tab)<{ ownerState: TabProps }>(
  ({ theme }) => ({
    background: theme.palette.transparent,
    border: 'none',
    padding: 0,
    [`& .${menuItemClasses.root}:focus`]: {
      backgroundColor: 'transparent',
      color: theme.palette.gray[90],
    },
    '&[data-selected="true"]': {
      [`& .${menuItemClasses.root}`]: {
        backgroundColor: theme.palette.blue[5],
        color: theme.palette.blue[90],
        '&:hover': {
          backgroundColor: theme.palette.blue[10],
          color: theme.palette.blue[90],
        },
        '&:focus': {
          backgroundColor: theme.palette.blue[5],
          color: theme.palette.blue[90],
        },
      },
    },
  }),
);

const NestedMenuContext = createContext<NestedMenuContext | null>(null);

const NestedMenuTabsContext = createContext<NestedMenuTabsContext | null>(null);

export function NestedMenuTabsList({
  children,
  ...rest
}: NestedMenuTabListProps) {
  const { width } = useNestedMenuContext();
  const ownerState = {
    width,
    children,
    ...rest,
  };
  return (
    <NestedMenuTabsListRoot ownerState={ownerState} {...rest}>
      {children}
    </NestedMenuTabsListRoot>
  );
}

export function useNestedMenuTabs() {
  const context = useContext(NestedMenuTabsContext);

  if (!context) {
    throw new Error(
      'Nested Menu tabs must be used within nested menu provider',
    );
  }

  return context;
}

function useNestedMenuContext() {
  const context = useContext(NestedMenuContext);

  if (!context) {
    throw new Error('Nested Menu must be used within nested menu provider');
  }

  return context;
}

export function NestedMenuProvider({
  children,
  onTabChange,
  width,
  dir = 'ltr',
}: {
  width?: number;
  onTabChange?: () => void;
  children: React.ReactNode;
  dir?: 'ltr' | 'rtl';
}) {
  const [panelAnchorEl, setPanelAnchorEl] = useState<HTMLDivElement | null>(
    null,
  );
  const myWidth: number = width || 226;

  const value = useMemo(
    () => ({
      panelAnchorEl,
      setPanelAnchorEl,
      onTabChange,
      width: myWidth,
      dir,
    }),
    [panelAnchorEl, onTabChange, myWidth, dir],
  );

  return (
    <NestedMenuContext.Provider value={value}>
      {children}
    </NestedMenuContext.Provider>
  );
}

interface NestedMenuLayoutProps extends BoxProps {
  dir?: 'ltr' | 'rtl';
}

export function NestedMenuLayout({ children, ...rest }: NestedMenuLayoutProps) {
  const { setPanelAnchorEl, dir } = useNestedMenuContext();
  return (
    <NestedMenuLayoutRoot
      id="panel-anchor-el"
      ref={setPanelAnchorEl}
      {...(dir === 'rtl' && { flexDirection: 'row-reverse' })}
      {...rest}
    >
      {children}
    </NestedMenuLayoutRoot>
  );
}

export function NestedMenuTabs({ children, value, ...rest }: TabsProps) {
  const [tab, setTab] = useControlled({
    controlled: value,
    default: null,
    name: 'NestedMenuTabs',
  });
  const { onTabChange } = useNestedMenuContext();

  useLayoutEffect(() => {
    onTabChange?.();
  }, [tab]);

  // Debounce the mouse leave event to give a grace period
  const handleMouseLeaveDebounced = useMemo(
    () =>
      debounce(() => {
        if (tab !== null) {
          flushSync(() => {
            setTab(null);
          });
        }
        if (onTabChange) {
          onTabChange();
        }
      }, 200),
    [onTabChange, setTab, tab], // Debounce by 200ms, can be adjusted as needed
  );

  const handleMouseLeave = useCallback(() => {
    handleMouseLeaveDebounced();
  }, [handleMouseLeaveDebounced]);

  // Cancel the debounce if the mouse enters another tab before the debounce delay
  const handleMouseEnterTab = useCallback(() => {
    handleMouseLeaveDebounced.clear();
  }, [handleMouseLeaveDebounced]);

  return (
    <NestedMenuTabsContext.Provider
      value={useMemo(() => ({ tab, setTab }), [setTab, tab])}
    >
      <NestedMenuTabsRoot
        value={tab}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnterTab}
        onChange={useCallback(
          (e: SyntheticEvent | null, v: number | string | null) => setTab(v),
          [setTab],
        )}
        {...rest}
      >
        {children}
      </NestedMenuTabsRoot>
    </NestedMenuTabsContext.Provider>
  );
}

type NestedMenuTabPanelProps = Omit<TabPanelProps, 'dir'> & {
  sx?: SxProps<Theme>;
  dir?: 'ltr' | 'rtl';
};

type NestedMenuTabPanelPropsOwnerState = {
  width: number;
  children: React.ReactNode;
  dir: 'ltr' | 'rtl';
};

export function NestedMenuTabPanel({
  children,
  ...rest
}: NestedMenuTabPanelProps) {
  const { panelAnchorEl, width, dir } = useNestedMenuContext();

  const ownerState = {
    width,
    children,
    dir,
    ...rest,
  };

  if (!panelAnchorEl) {
    return null;
  }

  return createPortal(
    <NestedMenuTabPanelRoot ownerState={ownerState} {...rest}>
      {children}
    </NestedMenuTabPanelRoot>,
    panelAnchorEl,
  );
}

export function NestedMenuLabel(props: TypographyProps) {
  return (
    <Typography
      variant="subtitle"
      px="12px"
      pt="4px"
      pb="16px"
      textTransform="uppercase"
      {...props}
    >
      {props.children}
    </Typography>
  );
}

export function NestedMenuItem({
  children,
  startEnhancer: StartEnhancer,
  endEnhancer: EndEnhancer,
  // Filter out these custom props to prevent passing them to the DOM
  parent: _1,
  item: _2,
  isEdgeNode: _3,
  ...restProps
}: ListItemProps) {
  return (
    <MenuItem {...restProps}>
      <Stack direction="row" spacing="10px" alignItems="center" flex="1">
        {StartEnhancer && <StartEnhancer />}
        <Stack flex="1" alignItems="start">
          <Box>{children}</Box>
        </Stack>
        {EndEnhancer && <EndEnhancer />}
      </Stack>
    </MenuItem>
  );
}

export function NestedMenuTab({ children, value, ...rest }: TabProps) {
  const { setTab, tab } = useNestedMenuTabs();
  const { onTabChange } = useNestedMenuContext();
  return (
    <NestedMenuTabRoot
      ownerState={{
        children,
        value,
        ...rest,
      }}
      data-selected={tab === value}
      onMouseOver={(e: any) => {
        e.stopPropagation();
        if (onTabChange) {
          onTabChange();
        }
        // @ts-expect-error cannot infer types
        setTab(value);
      }}
      value={value}
      {...rest}
    >
      {children}
    </NestedMenuTabRoot>
  );
}
