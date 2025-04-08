import { Button, ListItemText, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { colors } from '@/themes';

import Icon from '../Icon';
import { ListItemButton, MenuList } from './styled';

export default function HelpCenterPanel({ goBack }: { goBack: () => void }) {
  const { t } = useTranslation();

  return (
    <>
      <Stack
        component="li"
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        p="8px"
        sx={(theme) => ({
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: colors.darkBlue70,
        })}
      >
        <Stack direction="row" alignItems="center">
          <Button
            variant="text"
            startIcon={<Icon icon="chevron-left" size={16} />}
            onClick={goBack}
            sx={{ px: '12px' }}
          >
            <Typography variant="button1">{t('help-center')}</Typography>
          </Button>
        </Stack>
      </Stack>
      <MenuList>
        <ListItemButton>
          <ListItemText
            primary={
              <Typography variant="menu1">
                {t('submit-support-ticket')}
              </Typography>
            }
          />
          <Icon icon="chevron-right" size={20} />
        </ListItemButton>
        <ListItemButton>
          <ListItemText
            primary={
              <Typography variant="menu1">{t('documentation')}</Typography>
            }
          />
          <Icon icon="chevron-right" size={20} />
        </ListItemButton>
        <ListItemButton>
          <ListItemText
            primary={
              <Typography variant="menu1">{t('product-roadmap')}</Typography>
            }
          />
          <Icon icon="chevron-right" size={20} />
        </ListItemButton>
      </MenuList>
    </>
  );
}
