import { ListItem, Menu, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';

import { useMenuAnchor } from '@/hooks/useMenuAnchor';

import Icon, { IconProps } from '../Icon';
import type { NavItem } from './index';
import { NavMenuItemToolTip } from './NavMenuItemTooltip';
import { getNavMenuItemStyles } from './helpers';

export default function NavMenuSubNav({
  title,
  icon,
  children,
}: {
  title: string;
  icon: IconProps['icon'];
  children?: NavItem[];
}) {
  const {
    anchorEl,
    open: openMenu,
    handleAnchorClick,
    handleAnchorClose,
  } = useMenuAnchor();
  return (
    <>
      <NavMenuItemToolTip
        title={title}
        placement="right"
        enterDelay={100}
        enterNextDelay={100}
      >
        <ListItem
          component="span"
          disablePadding
          sx={(theme) => ({
            ...getNavMenuItemStyles(theme, false),
            cursor: 'pointer',
          })}
          onClick={handleAnchorClick}
        >
          <Icon icon={icon} size={20} sx={{ flexShrink: 0 }} />
        </ListItem>
      </NavMenuItemToolTip>
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleAnchorClose}
        elevation={0}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transitionDuration={250}
        disableAutoFocusItem={true}
        sx={(theme) => ({
          '& .MuiMenu-paper': {
            backgroundColor: theme.palette.darkBlue[90],
            borderRadius: '8px',
            minWidth: '260px',
          },
        })}
      >
        <Typography
          variant="subtitle"
          sx={(theme) => ({
            display: 'block',
            color: theme.palette.white,
            textTransform: 'uppercase',
            margin: `${theme.spacing(1)} ${theme.spacing(2)}`,
          })}
        >
          {title}
        </Typography>
        {children
          ?.filter((item) => item.to)
          .map((item) => {
            return (
              <NavLink
                to={item.to as string}
                style={{ textDecoration: 'none' }}
                key={item.to}
                {...(item.openInNewTab && {
                  target: '_blank',
                  rel: 'noopener noreferrer',
                })}
              >
                {({ isActive }) => (
                  <ListItem
                    component="span"
                    disablePadding
                    sx={(theme) => ({
                      ...getNavMenuItemStyles(theme, isActive),
                      padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
                      borderRadius: 'none',
                    })}
                  >
                    <Icon icon={item.icon} size={16} sx={{ flexShrink: 0 }} />
                    <Typography
                      variant="body1"
                      sx={(theme) => ({
                        marginLeft: theme.spacing(1),
                        color: theme.palette.white,
                      })}
                    >
                      {item.label}
                    </Typography>
                  </ListItem>
                )}
              </NavLink>
            );
          })}
      </Menu>
    </>
  );
}
