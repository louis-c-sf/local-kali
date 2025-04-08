import dayjs from 'dayjs';
import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useMatch, useNavigate } from 'react-router-dom';

import { getICUConfig, icu } from '@/i18n';

export function useLocaleSetup() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const match = useMatch('/:lang/*');
  const restPath = match?.params['*'] || '';

  useLayoutEffect(() => {
    const handleLanguageChange = (lng: string) => {
      dayjs.locale(lng.toLowerCase());
      icu.addUserDefinedFormats(getICUConfig(lng));

      const { search, hash } = location;
      const newUrl = `/${lng}/${restPath}`;

      // Navigate to the new localized URL
      navigate({
        pathname: newUrl,
        search,
        hash,
      });
    };
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, location, navigate, restPath]);
}
