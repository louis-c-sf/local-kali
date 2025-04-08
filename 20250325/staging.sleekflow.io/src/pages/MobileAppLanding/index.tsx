import { Box, Button, Link, Stack, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useSessionStorage } from 'react-use';

import { ReactComponent as FullLogo } from '@/assets/logo/sleekflow-logo-full.svg';
import { generateMarketingWebsiteURL } from '@/utils/v1-utils';

const MobileAppLandingPage = () => {
  const { i18n, t } = useTranslation();
  const [, setViewAsMobile] = useSessionStorage('viewAsMobile', false);
  const redirectUrl = generateMarketingWebsiteURL({
    language: i18n.language,
    path: '/',
  });

  function handleViewAsMobile() {
    setViewAsMobile(true);
    // HACK: Force refresh to remount the app and load the updated viewAsMobile value
    window.location.reload();
  }

  return (
    <Box p="16px">
      <Box mb="36px">
        <Link href={redirectUrl}>
          <FullLogo width={120} />
        </Link>
      </Box>
      <Stack
        sx={(theme) => ({
          background: theme.palette.blue[20],
          borderRadius: '32px',
          textAlign: 'center',
          padding: '48px 24px',
          gap: '24px',
          img: {
            height: '40px',
          },
        })}
      >
        <Typography variant="display1">
          <Trans i18nKey="mobile-app-landing-page.description">
            Experience the power of social commerce with the
            <Box component="span" sx={{ color: 'blue.70' }}>
              Sleekflow
            </Box>
            desktop and mobile app
          </Trans>
        </Typography>
        <Typography variant="headline4" sx={{ letterSpacing: '1.5px' }}>
          {t('mobile-app-landing-page.cta')}
        </Typography>
        <Box
          component="a"
          href="https://apps.apple.com/app/sleekflow-social-commerce/id1495751100?l=en"
          target="_blank"
          rel="noreferrer"
        >
          <Box
            component="img"
            src={`/images/mobile-app/appstore-${i18n.language}.png`}
            alt="appstore"
          />
        </Box>
        <Box
          component="a"
          href="https://play.google.com/store/apps/details?id=io.sleekflow.sleekflow"
          target="_blank"
          rel="noreferrer"
        >
          <Box
            component="img"
            src={`/images/mobile-app/googleplay-${i18n.language}.png`}
            alt="appstore"
          />
        </Box>
      </Stack>
      <Stack sx={{ marginTop: '44px' }}>
        <Button onClick={handleViewAsMobile}>
          {t('mobile-app-landing-page.continue')}
        </Button>
      </Stack>
    </Box>
  );
};

export default MobileAppLandingPage;
