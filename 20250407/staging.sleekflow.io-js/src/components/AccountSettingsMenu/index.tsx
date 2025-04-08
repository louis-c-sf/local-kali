import { Badge, Box, Button, Menu, MenuProps, styled } from '@mui/material';
import { useState } from 'react';

import { AppearOnlineDict } from '@/api/company';
import { useMenuAnchor } from '@/hooks/useMenuAnchor';
import { useMyProfile } from '@/hooks/useMyProfile';
import { testIds } from '@/playwright/lib/test-ids';
import { useAuth } from '@/hooks/useAuth';

import Icon from '../Icon';
import StaffAvatar from '../StaffAvatar';
import HelpCenterPanel from './HelpCenterPanel';
import MainPanel from './MainPanel';
import SwitchLanguagePanel from './SwitchLanguagePanel';
import isAccountAppearOnline from './helpers/isAccountAppearOnline';
import { AccountSettingsPanel } from './constants';

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    transitionDuration={250}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 8,
    width: '280px',
    backgroundColor: 'white',
    boxShadow: theme.shadows[3],
    marginTop: '20px',
  },
}));

export default function AccountSettingsMenu() {
  const { logout } = useAuth();
  const { data: myStaff } = useMyProfile();
  const [selectedTab, setSelectedTab] = useState<AccountSettingsPanel>(
    AccountSettingsPanel.MAIN,
  );
  const { anchorEl, open, handleAnchorClick, handleAnchorClose } =
    useMenuAnchor();

  function goBack() {
    setSelectedTab(AccountSettingsPanel.MAIN);
  }

  if (myStaff === undefined) {
    return null;
  }

  const userId = myStaff.userInfo.id;
  return (
    <Box>
      <Button
        data-testid={testIds.accountSettingsMenuTrigger}
        variant="text"
        id="settings-menu-button"
        aria-controls={open ? 'settings-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        disableElevation
        onClick={handleAnchorClick}
        endIcon={<Icon icon="chevron-down" size={12} />}
        sx={{
          display: 'flex',
          gap: '8px',
          borderRadius: '8px',
          padding: '8px',
        }}
      >
        <Badge
          variant="dot"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          overlap="circular"
          color={
            isAccountAppearOnline(myStaff.status ?? AppearOnlineDict.Away)
              ? 'forest'
              : 'gray'
          }
          sx={{ marginRight: '6px' }}
        >
          <StaffAvatar userId={userId} alt={myStaff.userInfo.displayName} />
        </Badge>
        {myStaff.userInfo.displayName}
      </Button>
      <StyledMenu
        id="settings-menu"
        open={open}
        anchorEl={anchorEl}
        onClose={handleAnchorClose}
        MenuListProps={{
          'aria-labelledby': 'settings-menu-button',
        }}
      >
        {selectedTab === AccountSettingsPanel.MAIN && (
          <MainPanel
            name={myStaff.userInfo.displayName}
            email={myStaff.userInfo.email}
            goTo={setSelectedTab}
            logout={logout}
          />
        )}
        {selectedTab === AccountSettingsPanel.LANGUAGE && (
          <SwitchLanguagePanel goBack={goBack} />
        )}
        {selectedTab === AccountSettingsPanel.HELP_CENTER && (
          <HelpCenterPanel goBack={goBack} />
        )}
      </StyledMenu>
    </Box>
  );
}
