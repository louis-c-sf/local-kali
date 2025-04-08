import { forwardRef, ReactNode } from 'react';

import Icon from '@/components/Icon';
import { SelectMenuItem as SelectMenuItemBase } from '@/components/Select';
import { MenuItemProps, MenuProps, Stack } from '@mui/material';

import Menu from '../../Menu';

export const SelectMenu = (props: MenuProps) => {
  const paper = props.slotProps?.paper as any;

  return (
    <Menu
      {...props}
      slotProps={{
        paper: {
          sx: [
            {
              mt: '10px',
              '& ul': { pt: 0.5, pb: 0 },
              '& div': {
                maxHeight: '384px',
              },
            },
            ...(Array.isArray(paper?.sx) ? paper.sx : [paper?.sx]),
          ],
        },
      }}
    />
  );
};

interface SelectMenuItemProps extends MenuItemProps {
  icon?: ReactNode;
  checked?: boolean;
}

export const SelectMenuItem = forwardRef<HTMLLIElement, SelectMenuItemProps>(
  ({ icon, checked, children, ...props }, ref) => (
    <SelectMenuItemBase {...props} ref={ref}>
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
          {icon}
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {children}
          </div>
        </Stack>
        {checked && (
          <Icon icon="check-single" size={16} sx={{ color: 'blue.90' }} />
        )}
      </Stack>
    </SelectMenuItemBase>
  ),
);

SelectMenuItem.displayName = 'SelectMenuItem';
