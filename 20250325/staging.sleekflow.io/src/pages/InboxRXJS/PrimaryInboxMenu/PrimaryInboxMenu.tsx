import { IconButton, List, Stack, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useMedia, useUpdateEffect } from 'react-use';

import Icon from '@/components/Icon';
import { ScrollArea } from '@/components/ScrollArea';
import SecondaryNav from '@/components/SecondaryNav';
import { testIds } from '@/playwright/lib/test-ids';

import { CompanyInboxSection } from './CompanyInboxSection';
import { MyInboxMenuSection } from './MyInboxMenuSection';
import { INBOX_MENU_WIDTH } from './utils';

export const PrimaryInboxMenu = ({
  toggleMenu,
  open,
}: {
  open: boolean;
  toggleMenu: () => void;
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMedia(`(min-width:${theme.breakpoints.values.lg}px)`);

  useUpdateEffect(() => {
    if (open && !isDesktop) {
      toggleMenu();
    }
  }, [location]);

  return (
    <SecondaryNav
      menuToggleTestId={testIds.inboxMenuToggle}
      menuTestId={testIds.inboxMenu}
      menuWidth={INBOX_MENU_WIDTH}
      open={open}
      toggleMenu={toggleMenu}
    >
      <Stack
        direction="row"
        width="100%"
        paddingX="16px"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="headline1">{t('menu.nav.inbox')}</Typography>
        <IconButton
          data-testid={testIds.inboxMenuToggleClose}
          aria-label="inbox-menu-toggle"
          onClick={toggleMenu}
        >
          <Icon icon="layout-flex-align-left" size={20} />
        </IconButton>
      </Stack>
      <List
        component={ScrollArea}
        slotProps={{ viewport: { sx: { overflow: 'hidden scroll' } } }}
        sx={{
          paddingTop: '15px',
          width: '100%',
          paddingX: '16px',
          margin: '0px',
        }}
      >
        <Stack width="inherit" spacing="10px" flexShrink={1}>
          <MyInboxMenuSection />
          <CompanyInboxSection />
        </Stack>
      </List>
    </SecondaryNav>
  );
};
