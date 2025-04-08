import {
  Avatar,
  Box,
  Button,
  Stack,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { generateV1RedirectionLink } from '@/utils/v1-utils';

import GlobalTopMenu from '../GlobalTopMenu';
import Icon from '../Icon';
import PageHeaderWithBackButton from '../PageHeaderWithBackButton';
import PageTitle from '../PageTitle';

const redirectUrlMap: { [key: string]: string } = {
  channels: '/channels',
  integrations: '/channels',
  'commerce-hub': '/channels',
  analytics: '/analytics/conversations',
  settings: '/settings',
  'invite-users': '/settings/usermanagement',
  'flow-builder': '/automations',
  'team-management': '/settings/teams',
  subscription: '/settings/plansubscription',
  'inbox-settings': '/settings/inbox',
  whatsappQrCode: '/settings/whatsappQrCode',
  whatsappTemplate: '/settings/templates',
  whatsappOptIn: '/settings/opt-in',
  whatsappBilling: '/settings/topup',
};

const UnderConstruction = ({
  title,
  hiddenHeader = false,
  sx = { mt: '200px' },
}: {
  title: string;
  hiddenHeader?: boolean;
  sx?: SxProps<Theme>;
}) => {
  const { t } = useTranslation();

  const redirectLink = generateV1RedirectionLink({
    path: redirectUrlMap[title],
  });
  return (
    <>
      {hiddenHeader ? null : (
        <Box width="100%">
          <Stack
            direction="row"
            sx={(theme) => ({
              justifyContent: 'space-between',
              borderBottom: `1px solid ${theme.palette.gray[30]}`,
              alignItems: 'center',
              paddingRight: '2rem',
            })}
          >
            {title === 'settings' ? (
              <PageHeaderWithBackButton title={t(`nav.${title}`)} />
            ) : (
              <Box sx={{ paddingX: '2rem' }}>
                <PageTitle title={t(`nav.${title}`)} />
              </Box>
            )}
            <GlobalTopMenu />
          </Stack>
        </Box>
      )}
      <Stack alignItems="center" justifyContent="center" sx={sx}>
        <Stack spacing="8px" alignItems="center">
          <Stack spacing="8px" alignItems="center">
            <Avatar sx={{ width: '32px', height: '32px', bgcolor: 'gray.10' }}>
              <Icon icon="tool" sx={{ color: 'gray.90' }} size={20} />
            </Avatar>
            <Typography variant="headline4">
              {t('under-construction')}
            </Typography>
            <Typography
              sx={{ textAlign: 'center', maxWidth: '240px' }}
              variant="body2"
            >
              {t('under-construction-desc')}
            </Typography>
          </Stack>
          <Button
            variant="contained"
            href={redirectLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon icon="link-external" size="16px" sx={{ mr: '8px' }} />
            {t('open-in-sleekflow-1.0')}
          </Button>
        </Stack>
      </Stack>
    </>
  );
};

export default UnderConstruction;
