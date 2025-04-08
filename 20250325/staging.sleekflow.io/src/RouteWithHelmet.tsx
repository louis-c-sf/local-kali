import { Helmet, HelmetProvider } from 'react-helmet-async';
import { TFunction, useTranslation } from 'react-i18next';
import { useLocation, type Location } from 'react-router-dom';

import { ROUTES } from './constants/navigation';
import { CHANNEL } from './pages/Broadcasts/constants';

export default function RouteWithHelmet({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const { t } = useTranslation();
  const titles = getPageTitleByUrl(location.pathname, t);
  return (
    <HelmetProvider>
      <Helmet prioritizeSeoTags>
        <title>{titles.join(' | ')}</title>
      </Helmet>
      {children}
    </HelmetProvider>
  );
}

const getPageTitleByUrl = (
  url: Location['pathname'],
  t: TFunction,
): string[] => {
  const titleMap: { [key: string]: string } = {
    //Nav
    [ROUTES.inbox]: t('page-title.inbox'),
    [ROUTES.contacts]: t('page-title.contacts'),
    [ROUTES.broadcasts]: t('page-title.broadcast'),
    [ROUTES.analytics]: t('page-title.analytics'),
    [ROUTES.flowBuilder]: t('page-title.flow-builder'),
    [ROUTES.channels]: t('page-title.channels'),
    [ROUTES.integrations.index]: t('page-title.integrations'),
    [ROUTES.commerceHub]: t('page-title.commerce-hub'),
    [ROUTES.gettingStarted]: t('page-title.getting-started'),
    [ROUTES.invite]: t('page-title.invite'),
    [ROUTES.settings]: t('page-title.settings'),
    //Broadcast
    [`${ROUTES.broadcasts}/${CHANNEL.whatsappCloudApi}`]: t(
      'page-title.new-broadcast',
    ),
    [`${ROUTES.broadcasts}/${CHANNEL.whatsappTwilio}`]: t(
      'page-title.new-broadcast',
    ),
    [`${ROUTES.broadcasts}/${CHANNEL.whatsapp360Dialog}`]: t(
      'page-title.new-broadcast',
    ),
    [`${ROUTES.broadcasts}/${CHANNEL.wechat}`]: t('page-title.new-broadcast'),
    [`${ROUTES.broadcasts}/${CHANNEL.facebook}`]: t('page-title.new-broadcast'),
    [`${ROUTES.broadcasts}/${CHANNEL.sms}`]: t('page-title.new-broadcast'),
    [`${ROUTES.broadcasts}/${CHANNEL.line}`]: t('page-title.new-broadcast'),
    [`${ROUTES.broadcasts}/${CHANNEL.note}`]: t('page-title.new-broadcast'),
    [`${ROUTES.broadcasts}/${CHANNEL.telegram}`]: t('page-title.new-broadcast'),
    [`${ROUTES.broadcasts}/${CHANNEL.viber}`]: t('page-title.new-broadcast'),
    //Contacts
    [ROUTES.contactsTeam]: t('page-title.team-contact'),
    [ROUTES.contactsShopify]: t('page-title.shopify-contact'),
    [ROUTES.contactsMyContacts]: t('page-title.my-contact'),
    [ROUTES.contactsList]: t('page-title.contact-list'),
    [ROUTES.contactsCreate]: t('page-title.create-new-contact'),
    [ROUTES.settingsContactPropertiesDefault]: t('page-title.edit-columns'),
    [ROUTES.settingsContactPropertiesPersonal]: t('page-title.edit-columns'),
    [ROUTES.contactsImport]: t('page-title.import-contacts'),
  };

  const titleArr: string[] = [t('page-title.sleekflow')];

  for (const path in titleMap) {
    if (url.includes(path)) {
      titleArr.unshift(titleMap[path]);
    }
  }

  return titleArr;
};
