import {
  Button,
  ListItemText,
  Stack,
  SxProps,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { colors } from '@/themes';

import Icon from '../Icon';
import { ListItemButton, MenuList } from './styled';
import { TFunction } from 'i18next';

export const getLanguageList = (t: TFunction) => [
  {
    lang: 'en',
    label: t('language.en', { defaultValue: 'English' }),
  },
  {
    lang: 'zh-HK',
    label: t('language.zh-HK', { defaultValue: '繁體中文' }),
  },
  {
    lang: 'zh-CN',
    label: t('language.zh-CN', { defaultValue: '简体中文' }),
  },
  {
    lang: 'id',
    label: t('language.id', { defaultValue: 'Bahasa Indonesia' }),
  },
  {
    lang: 'pt-BR',
    label: t('language.pt-BR', { defaultValue: 'Português (BR)' }),
  },
  {
    lang: 'de',
    label: t('language.de', { defaultValue: 'Deutsch' }),
  },
  {
    lang: 'it',
    label: t('language.it', { defaultValue: 'Italiano' }),
  },
];
export const LanguageOptions = (props: { sx?: SxProps }) => {
  const { t, i18n } = useTranslation();

  return (
    <MenuList sx={[...(Array.isArray(props.sx) ? props.sx : [props.sx])]}>
      {getLanguageList(t).map((lang) => (
        <ListItemButton
          key={lang.lang}
          onClick={() => i18n.changeLanguage(lang.lang)}
          sx={(theme) => ({
            '&:hover': {
              backgroundColor: theme.palette.componentToken.menu.bgHover,
            },
          })}
        >
          <ListItemText
            primary={<Typography variant="menu1">{lang.label}</Typography>}
          />
          {i18n.language === lang.lang && (
            <Icon icon="check-single" size={20} sx={{ color: colors.blue90 }} />
          )}
        </ListItemButton>
      ))}
    </MenuList>
  );
};

export default function SwitchLanguagePanel({
  goBack,
}: {
  goBack: () => void;
}) {
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
        })}
      >
        <Stack direction="row" alignItems="center">
          <Button
            variant="text"
            startIcon={<Icon icon="chevron-left" size={16} />}
            onClick={goBack}
            sx={{ px: '12px' }}
          >
            <Typography variant="button1">{t('switch-language')}</Typography>
          </Button>
        </Stack>
      </Stack>
      <LanguageOptions />
    </>
  );
}
