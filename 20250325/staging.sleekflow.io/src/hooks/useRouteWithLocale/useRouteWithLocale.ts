import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { To } from 'react-router-dom';

function getSlashPath(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

export function useRouteWithLocale() {
  const { i18n } = useTranslation();

  const routeTo = useCallback(
    (path: To) => {
      if (typeof path === 'string') {
        if (path.startsWith('https')) {
          return path;
        }
        return `/${i18n.language}${getSlashPath(path)}`;
      } else {
        return {
          ...path,
          pathname: `/${i18n.language}${getSlashPath(path.pathname ?? '')}`,
        } as To;
      }
    },
    [i18n.language],
  );

  return routeTo;
}
