import { IconButton, Tooltip, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetCurrentCountryQuery } from '@/api/common';
import { useCompany, useGetStaffOverview } from '@/api/company';
import { useMyProfile } from '@/hooks/useMyProfile';
import { titleCase } from '@/pages/Contacts/shared/utils';
import {
  fromApiBillRecordsToActiveBillRecord,
  transformPlanDetails,
} from '@/utils/billing';
import { getLanguage } from '@/utils/mixpanelLibs';

import Icon from '../Icon';

declare global {
  interface Window {
    Beamer: any;
    beamer_config: string;
  }
}

function useBeamerParameter() {
  const myProfile = useMyProfile();
  const {
    i18n: { language },
  } = useTranslation();
  const currentLanguage = getLanguage(language);
  const company = useCompany({
    select: ({
      id,
      companyName,
      billRecords,
      createdAt,
      companyCountry,
      whatsApp360DialogConfigs,
      whatsAppConfigs,
      whatsappCloudApiConfigs,
    }) => {
      const activeBillRecord =
        fromApiBillRecordsToActiveBillRecord(billRecords);
      const planName = transformPlanDetails(
        activeBillRecord?.subscriptionPlan?.id,
      ).planName;
      const connectedWhatsApp = [];
      if (whatsappCloudApiConfigs.length > 0) {
        connectedWhatsApp.push(`cloudapi+${currentLanguage}`);
      }
      if (whatsApp360DialogConfigs.length > 0) {
        connectedWhatsApp.push(`360dialog+${currentLanguage}`);
      }
      if (whatsAppConfigs.length > 0) {
        connectedWhatsApp.push(`twilio+${currentLanguage}`);
      }
      return {
        id,
        companyName,
        subscriptionPlan: planName ? titleCase(planName) : 'Unknown',
        currency: activeBillRecord?.subscriptionPlan?.currency,
        createdAt,
        connectedWhatsApp,
        companyCountry,
      };
    },
  });
  const { data: currentCountry } = useGetCurrentCountryQuery();
  const isOwner = useGetStaffOverview({
    select: (data) => {
      return {
        isOwner: myProfile.data?.userInfo.id
          ? data.findIndex(
              (s) => s.staffIdentityId === myProfile.data?.userInfo.id,
            ) === 0
          : false,
      };
    },
  });
  if (!company.data || !myProfile.data || !isOwner.data) {
    return;
  }
  const planType = company.data?.subscriptionPlan;
  const { userInfo } = myProfile.data;
  const countryCode = currentCountry?.countryCode2;
  const filterParam = [
    planType,
    planType + '+' + currentLanguage,
    planType + '+' + currentLanguage + '+' + company.data.currency,
    countryCode,
    [countryCode, planType, currentLanguage].join('+'),
    myProfile.data.roleType.toLowerCase(),
    isOwner.data ? 'Owner' : 'Invited User',
    language,
    company.data.connectedWhatsApp.join(';'),
  ];
  return {
    user_firstname: (userInfo.firstName || '').trim(),
    user_lastname: (userInfo.lastName || '').trim(),
    user_email: userInfo.email,
    user_id: userInfo.id,
    filter: filterParam.join(';'),
  };
}

let hasSetupBeamer = false;

export default function GlobalBeamerButton() {
  const { t } = useTranslation();
  const beamerParameter = useBeamerParameter();

  useEffect(() => {
    if (hasSetupBeamer) return;

    hasSetupBeamer = true;
    // Create a new script element
    const scriptElement = document.createElement('script');
    scriptElement.type = 'text/javascript';
    scriptElement.defer = true; // or use scriptElement.setAttribute("defer", "true");

    // Add user information to the script content
    scriptElement.innerHTML = `
      var beamer_config = {
        product_id: '${import.meta.env.VITE_BEAMER_PRODUCT_ID}',
        selector: '#beamerButton',
        button: false,
      };
    `;

    // Append the script element to the document
    document.head.appendChild(scriptElement);

    // Create another script element for the Beamer embed script
    const beamerScriptElement = document.createElement('script');
    beamerScriptElement.type = 'text/javascript';
    beamerScriptElement.src = 'https://app.getbeamer.com/js/beamer-embed.js';
    beamerScriptElement.defer = true;

    document.head.appendChild(beamerScriptElement);
  }, []);

  useEffect(() => {
    if (beamerParameter && window.Beamer?.update && window.beamer_config) {
      window.Beamer.update({ ...beamerParameter });
    }
  }, [beamerParameter, window.Beamer?.update, window.beamer_config]);

  if (window.beamer_config === undefined || window.Beamer === undefined) {
    return <></>;
  }

  return (
    <>
      <Tooltip
        title={
          <Typography variant="body1" sx={{ color: 'white' }}>
            {t('beamer.tooltip.title', {
              defaultValue: 'Product updates',
            })}
          </Typography>
        }
        placement="bottom"
      >
        <IconButton id="beamerButton">
          <Icon icon="bell" size={20} sx={{ color: 'gray.80' }} />
        </IconButton>
      </Tooltip>
    </>
  );
}
