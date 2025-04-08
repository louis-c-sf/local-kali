import { Box, Stack, Button, Typography, Menu, Link } from '@mui/material';
import Logo from '../assets/logo/sleekflow-logo-full.svg';
import Icon from '@/components/Icon';
import { useTranslation } from 'react-i18next';
import {
  getLanguageList,
  LanguageOptions,
} from '@/components/AccountSettingsMenu/SwitchLanguagePanel';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMenuAnchor } from '@/hooks/useMenuAnchor';

const TERMS_URL = 'https://sleekflow.io/terms';
const PRIVACY_URL = 'https://sleekflow.io/privacy';

export default function UnAuthenticatedLayout() {
  const { t, i18n } = useTranslation();
  const { anchorEl, open, handleAnchorClick, handleAnchorClose } =
    useMenuAnchor();
  const currentLanguage = getLanguageList(t).find(
    (lang) => lang.lang === i18n.language,
  );
  return (
    <>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=0.1" />
      </Helmet>
      <Stack
        height="100svh"
        sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column' }}
      >
        <Box
          component="header"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 65px',
          }}
        >
          <Box>
            <img src={Logo} alt="SleekFlow" height={23} />
          </Box>
          <Stack direction="row" alignItems="center">
            <Button
              variant="text"
              startIcon={<Icon icon="globe" size={16} />}
              endIcon={
                <Icon icon={open ? 'chevron-up' : 'chevron-down'} size={16} />
              }
              onClick={handleAnchorClick}
              sx={{ px: '12px' }}
            >
              <Typography variant="button1">
                {currentLanguage?.label}
              </Typography>
            </Button>
          </Stack>
          <Menu open={open} anchorEl={anchorEl} onClose={handleAnchorClose}>
            <LanguageOptions sx={{ width: '260px' }} />
          </Menu>
        </Box>
        <Box
          sx={{
            flex: 1,
          }}
        >
          <Outlet />
        </Box>
        <Box
          component="footer"
          sx={{
            display: 'flex',
            justifyContent: 'left',
            alignItems: 'center',
            paddingX: 8,
            paddingY: 4,
          }}
        >
          <Link
            href={TERMS_URL}
            underline="none"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Typography
              variant="link2"
              sx={{
                color: 'darkBlue.70',
                fontWeight: 600,
                fontSize: '12px',
                mr: 1.5,
              }}
            >
              {t('footer.terms', { defaultValue: 'Terms of Service' })}
            </Typography>
          </Link>
          <Link
            href={PRIVACY_URL}
            underline="none"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Typography
              variant="link2"
              sx={{ color: 'darkBlue.70', fontWeight: 600, fontSize: '12px' }}
            >
              {t('footer.privacy', { defaultValue: 'Privacy Policy' })}
            </Typography>
          </Link>
        </Box>
      </Stack>
    </>
  );
}
