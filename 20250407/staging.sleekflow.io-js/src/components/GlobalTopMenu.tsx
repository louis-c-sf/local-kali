import { Stack } from '@mui/material';
import { ReactNode } from 'react';

import AccountSettingsMenu from './AccountSettingsMenu';
import GlobalBeamerButton from './GlobalBeamerButton';
import GlobalSearchBar from './GlobalSearchBar';
import { GuideButton } from './GuideButton';
import { PERMISSION_KEY } from '../constants/permissions';
import { PermissionGuard } from './PermissionGuard';

export default function GlobalTopMenu(props: { children?: ReactNode }) {
  return (
    <Stack
      spacing="12px"
      direction="row"
      sx={{ alignItems: 'center', position: 'relative' }}
    >
      {props.children}
      <GuideButton />
      <PermissionGuard keys={PERMISSION_KEY.contactsAccess}>
        <GlobalSearchBar />
      </PermissionGuard>
      <GlobalBeamerButton />
      <AccountSettingsMenu />
    </Stack>
  );
}
