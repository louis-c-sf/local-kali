import {
  Box,
  ListItemButton,
  ListItemButtonProps,
  ListItemText,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { useRouteWithLocale } from '@/hooks/useRouteWithLocale/useRouteWithLocale';

import Icon, { IconProps } from '../Icon';

export type NavItem = {
  id: string;
  label: string;
  disabled?: boolean;
  /** @deprecated please use endIcon prop instead */
  icon?: IconProps['icon'];
  to?: string;
  iconSize?: IconProps['size'];
  selectedIconColor?: string;
  unselectedIconColor?: string;
};

export default function SecondaryNavItem({
  label,
  selected,
  onClick,
  disabled,
  icon,
  endIcon,
  to = '',
  iconSize,
  selectedIconColor,
  unselectedIconColor,
  sx,
  ...rest
}: ListItemButtonProps &
  Pick<
    NavItem,
    | 'label'
    | 'icon'
    | 'to'
    | 'iconSize'
    | 'selectedIconColor'
    | 'unselectedIconColor'
  > & {
    endIcon?: React.ReactNode;
  }) {
  const routeTo = useRouteWithLocale();
  return (
    <Box position="relative">
      {selected && <MotionOverlay />}
      <ListItemButton
        sx={[
          {
            padding: '10px 8px',
            marginTop: '8px',
            borderRadius: '8px',
            textDecoration: 'none',
            alignItems: 'center',
            color: selected ? 'blue.90' : 'darkBlue.70',
            ':hover': {
              backgroundColor: 'white',
              color: 'blue.90',
              '& .SecondaryNavItemIcon': {
                color: 'blue.90',
              },
            },
            '&.MuiListItemButton-root.Mui-selected': {
              backgroundColor: 'white',
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        selected={selected}
        disabled={disabled}
        {...(to
          ? {
              component: Link,
              to: routeTo(to),
            }
          : { onClick })}
        {...rest}
      >
        <ListItemText
          sx={{
            maxWidth: 'var(--secondary-nav-item-max-width)',
            display: 'flex',
            margin: 0,
            alignItems: 'center',
            justifyContent: 'space-between',
            ':hover': {
              color: 'blue.90',
            },
          }}
          primary={
            <Typography
              variant="menu1"
              sx={(theme) => ({
                ...theme.typography.ellipsis,
              })}
            >
              {label}
            </Typography>
          }
        />
        {endIcon}
        {/*Deprecate icon prop in favour of a more flexible endIcon prop*/}
        {icon && (
          <Icon
            className="SecondaryNavItemIcon"
            icon={icon}
            size={iconSize}
            sx={{
              color: selected
                ? (selectedIconColor ?? 'blue.90')
                : (unselectedIconColor ?? 'darkBlue.70'),
              // ':hover': {
              //   color: 'blue.90',
              // },
            }}
          />
        )}
      </ListItemButton>
    </Box>
  );
}

function MotionOverlay() {
  return (
    <motion.div
      layoutId="overlay"
      initial={false}
      transition={{
        type: 'spring',
        stiffness: 250,
        damping: 30,
      }}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        backgroundColor: 'white',
        borderRadius: '12px',
      }}
    />
  );
}
