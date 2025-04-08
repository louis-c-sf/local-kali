import { useEffect, useState } from "react";

import { fetchSleekPayVolume } from "api/StripePayment/fetchSleekPayVolume";
import { fetchSleekPayStatus } from "api/StripePayment/fetchSleekPayStatus";
import { SleekPayStatusType } from "core/models/Ecommerce/Payment/SleekPayStatusType";
import { SleekPayVolumeType } from "core/models/Ecommerce/Payment/SleekPayVolumeType";
import {
  fetchShopifySetting,
  ShopifySettingResponseType,
} from "api/StripePayment/fetchShopifySetting";

export function useFetchSleekPaySettings(props: { countryCode: string }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    status: SleekPayStatusType;
    volume: SleekPayVolumeType;
    shopifySettings: ShopifySettingResponseType;
  }>();
  const [error, setError] = useState();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchSleekPayStatus(props.countryCode),
      fetchSleekPayVolume(props.countryCode),
      fetchShopifySetting(),
    ])
      .then(([statusData, volumeData, shopifySettingData]) => {
        setData({
          status: statusData,
          volume: volumeData,
          shopifySettings: shopifySettingData,
        });
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [props.countryCode]);

  const settingsData = {
    companyLogoUrl: data?.status?.companyLogoUrl,
    accountId: data?.status?.accountId,
    brandColor: data?.status?.accountInfo?.settings?.branding?.primary_color,
    buttonsColor:
      data?.status?.accountInfo?.settings?.branding?.secondary_color,
    isShippingEnabled: data?.status?.isShippingEnabled,
    shippingAllowedCountries: data?.status?.shippingAllowedCountries,
    shippingOptions: data?.status?.shippingOptions,
    volume: data?.volume?.volume,
    currency: data?.status?.accountInfo?.default_currency.toUpperCase(),
    paymentLinkExpirationOption: data?.status?.paymentLinkExpirationOption,
    loginUrl: data?.status?.connectStripeResponse?.url,
    countryCode: data?.status?.countryCode,
    isEnabledDiscounts: data?.shopifySettings.isEnabledDiscounts,
    contactDetail: data?.status.accountInfo.business_profile
      ? {
          email: data?.status.accountInfo.business_profile.support_email,
          phoneNumber: data?.status.accountInfo.business_profile.support_phone,
        }
      : undefined,
  };

  return {
    data: settingsData,
    loading,
    error,
  };
}
