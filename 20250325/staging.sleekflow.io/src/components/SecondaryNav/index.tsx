import { Drawer, useTheme } from '@mui/material';
import { useMedia } from 'react-use';

import { useGlobalBanner } from '@/GlobalBanner';
import { SIDEBAR_WIDTH } from '@/components/Navbar';
import PageMenuToggleButton from '@/components/PageMenuToggleButton';

export const DEFAULT_MENU_WIDTH = 280;

export const NAV_MENU_ZINDEX = 1300;

export default function SecondaryNav({
  toggleMenu,
  open,
  children,
  menuWidth = DEFAULT_MENU_WIDTH,
  menuToggleTestId,
  menuTestId,
}: {
  open: boolean;
  toggleMenu: () => void;
  children: React.ReactNode;
  menuWidth?: number;
  menuToggleTestId?: string;
  menuTestId?: string;
}) {
  const theme = useTheme();
  const isDesktop = useMedia(`(min-width:${theme.breakpoints.values.lg}px)`);
  const globalBannerHeight = useGlobalBanner((state) => state.totalHeight);

  return (
    <>
      <PageMenuToggleButton
        onClick={toggleMenu}
        sx={{ transition: 'all 300ms' }}
        data-testid={menuToggleTestId}
      />
      <Drawer
        open={open}
        onClose={toggleMenu}
        variant={isDesktop ? 'persistent' : 'temporary'}
        anchor="left"
        sx={(theme) => ({
          zIndex: 70,
          '--secondary-nav-item-max-width': `${menuWidth - 50}px`,
          width: open ? `${menuWidth - SIDEBAR_WIDTH}px` : '0px',
          transition: theme.transitions.create(['width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          '& .MuiDrawer-paper': {
            height: `calc(100% - ${globalBannerHeight}px)`,
            top: `${globalBannerHeight}px`,
            marginLeft: `${SIDEBAR_WIDTH}px`,
            width: `${menuWidth}px`,
            boxSizing: 'border-box',
            backgroundColor: 'blue.5',
            paddingY: '20px',
            zIndex: NAV_MENU_ZINDEX,
            //view below desktop
            [theme.breakpoints.down('lg')]: {
              boxShadow: theme.shadows[5],
              borderRight: 0,
            },
          },
        })}
        data-testid={menuTestId}
      >
        {children}
      </Drawer>
    </>
  );
}
