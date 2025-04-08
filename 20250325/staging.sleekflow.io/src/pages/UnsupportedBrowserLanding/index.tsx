import {
  Box,
  Stack,
  Typography,
  List,
  Button,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSessionStorage, useLocalStorage } from 'react-use';

import { ReactComponent as FullLogo } from '@/assets/logo/sleekflow-logo-full.svg';
import Icon from '@/components/Icon';
import { ScrollArea } from '@/components/ScrollArea';
import { SUPPORTED_BROWSER } from '@/constants/supportedBrowser';

export default function UnsupportedBrowserLanding() {
  const { t } = useTranslation();
  const [, setViewInUnsupportedBrowser] = useSessionStorage(
    'viewInUnsupportedBrowser',
    false,
  );
  const [, setHiddenUnsupportedBrowserLayout] = useLocalStorage(
    'hiddenUnsupportedBrowserLayout',
    false,
  );

  const clickHideLanding = (_e: unknown, checked: boolean) => {
    setHiddenUnsupportedBrowserLayout(checked);
  };

  const continueWithCurrentBrowser = () => {
    setViewInUnsupportedBrowser(true);
    window.location.reload();
  };

  return (
    <ScrollArea position="relative" height="100svh">
      <Box py={5} px={10}>
        <FullLogo />
        <Box display="flex" alignItems="center" justifyContent="center" mt={10}>
          <Stack m={2} spacing={2.5} sx={{ maxWidth: '480px', py: 2.5, px: 2 }}>
            <Stack spacing={1} display="flex" alignItems="center">
              <Box
                sx={(theme) => ({
                  height: '36px',
                  width: '36px',
                  borderRadius: '100%',
                  background: theme.palette.bgSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <Icon size={24} icon="alert-triangle" />
              </Box>
              <Typography variant="headline2">
                {t('unsupported-browser.title', {
                  defaultValue: 'Unsupported browser',
                })}
              </Typography>
              <Typography sx={{ textAlign: 'center' }}>
                {t('unsupported-browser.description', {
                  defaultValue:
                    'This browser is currently unsupported. Please use one of these recommended options to improve your experience.',
                })}
              </Typography>
            </Stack>
            <Box
              sx={(theme) => ({
                border: `1px solid ${theme.palette.borderEnabled}`,
                borderRadius: '8px',
                p: 3,
              })}
            >
              <Typography variant="headline3">
                {t('unsupported-browser.recommended-browsers', {
                  defaultValue: 'Recommended browsers',
                })}
              </Typography>
              <List sx={{ listStyle: 'disc', pl: 3, py: 0 }}>
                {SUPPORTED_BROWSER.map((browser) => (
                  <Typography key={browser.label} sx={{ display: 'list-item' }}>
                    {browser.label}
                  </Typography>
                ))}
              </List>
              <Typography>
                {t('unsupported-browser.or-above', {
                  defaultValue: 'or above',
                })}
              </Typography>
              <Typography sx={{ mt: 2.5 }}>
                {t('unsupported-browser.not-supported-ie', {
                  defaultValue:
                    'Please note that SleekFlow is not supported on Internet Explorer',
                })}
              </Typography>
            </Box>
            <Stack spacing={2} display="flex" alignItems="center">
              <Typography textAlign="center">
                {t('unsupported-browser.use-supported-browser', {
                  defaultValue:
                    'To use SleekFlow web app, please update your browser to the latest version or use a different browser',
                })}
              </Typography>
              <Box>
                <FormControlLabel
                  control={<Checkbox />}
                  onChange={clickHideLanding}
                  label={
                    <Typography sx={{ ml: 1 }}>
                      {t('unsupported-browser.hide-landing', {
                        defaultValue: 'Don’t show this again',
                      })}
                    </Typography>
                  }
                />
              </Box>
              <Button onClick={continueWithCurrentBrowser}>
                {t('unsupported-browser.continue', {
                  defaultValue: 'Continue with the current browser',
                })}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </ScrollArea>
  );
}
