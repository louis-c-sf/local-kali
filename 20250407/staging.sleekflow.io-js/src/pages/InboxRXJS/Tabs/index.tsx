import {
  styled,
  tabClasses,
  Tabs as TabsBase,
  TabsProps as MuiTabsProps,
} from '@mui/material';

const TabsRoot = styled(TabsBase)<{ ownerState: TabsOwnerState }>(
  ({ theme, ownerState }) => ({
    [`& .${tabClasses.root}`]: {
      ...(ownerState.size === 'large' && {
        padding: theme.spacing(2, 3),
      }),
      ...(ownerState.size === 'small' && {
        ...theme.typography.menu2,
        padding: theme.spacing(1, 3),
      }),
    },
  }),
);

interface TabsProps extends MuiTabsProps {
  size?: 'small' | 'large';
}

type TabsOwnerState = TabsProps;

export function Tabs(props: TabsProps) {
  const { size = 'large', ...rest } = props;
  const ownerState = { size, ...rest };
  return <TabsRoot ownerState={ownerState} {...rest} />;
}
