import { ListItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NavLink, generatePath } from 'react-router-dom';
import Icon from '@/components/Icon';
import { ROUTES } from '@/constants/navigation';
import { useRouteWithLocale } from '@/hooks/useRouteWithLocale/useRouteWithLocale';
import { NavMenuItemToolTip } from '@/components/Navbar/NavMenuItemTooltip';
import { getNavMenuItemStyles } from '@/components/Navbar/helpers';

export default function CustomObjectDataNav() {
  const routeTo = useRouteWithLocale();
  const { t } = useTranslation();

  return (
    <NavMenuItemToolTip
      title={t('nav.custom-object-data', {
        defaultValue: 'Data',
      })}
      placement="right"
      enterDelay={100}
      enterNextDelay={100}
    >
      <NavLink
        style={{ textDecoration: 'none' }}
        to={routeTo(generatePath(ROUTES.customObjectDataIndex))}
      >
        {({ isActive }) => (
          <ListItem
            component="span"
            disablePadding
            sx={(theme) => getNavMenuItemStyles(theme, isActive)}
          >
            <Icon icon="database" size={20} sx={{ flexShrink: 0 }} />
          </ListItem>
        )}
      </NavLink>
    </NavMenuItemToolTip>
  );
}
