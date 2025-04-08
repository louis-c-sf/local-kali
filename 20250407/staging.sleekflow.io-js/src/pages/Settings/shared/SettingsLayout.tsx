import {
  Box,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useOutletContext } from 'react-router-dom';
import { useMedia, useToggle } from 'react-use';

import SettingsHeader from './SettingsHeader';
import SettingsMenu from './SettingsMenu';

export default function SettingsLayout() {
  const theme = useTheme();
  const [pageTitleEl, setPageTitleEl] = useState<HTMLElement | null>(null);
  const { t } = useTranslation();

  const isDesktop = useMedia(`(min-width:${theme.breakpoints.values.lg}px)`);
  const [expanded, toggle] = useToggle(isDesktop);

  return (
    <Stack position="relative" sx={{ height: '100%', width: '100%' }}>
      <Stack justifyContent="flex-start" height="100%">
        <Stack direction="row">
          <SettingsMenu open={expanded} toggleMenu={toggle} />
          <Box width="100%">
            <SettingsHeader setPageTitleEl={setPageTitleEl} />
          </Box>
        </Stack>
        <Stack
          sx={(theme) => ({
            [theme.breakpoints.up('lg')]: {
              marginLeft: expanded ? `${theme.secondaryMenu.width.md}px` : 0,
              transition: theme.transitions.create(['margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            },
            flex: 1,
            minHeight: 0,
            padding: '16px 20px',
          })}
        >
          <Suspense
            fallback={
              <Stack flex={1} justifyContent="center" alignItems="center">
                <CircularProgress sx={{ mb: '8px' }} />
                <Typography variant="body2">{t('general.loading')}</Typography>
              </Stack>
            }
          >
            <Outlet context={{ pageTitleEl, sideBarExpanded: expanded }} />
          </Suspense>
        </Stack>
      </Stack>
    </Stack>
  );
}

export const useSettingsLayout = () => {
  return useOutletContext<{
    pageTitleEl: HTMLElement;
    sideBarExpanded: boolean;
  }>();
};
