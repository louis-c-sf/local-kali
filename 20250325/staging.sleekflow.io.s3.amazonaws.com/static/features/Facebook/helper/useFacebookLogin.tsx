import { useState, useCallback } from "react";
import useFacebook from "../../../component/CreateWhatsappFlow/useFacebook";
import { assoc } from "ramda";

interface FacebookPhoneNumberOptionType {
  facebookConnect: string;
  instagramConnect: string;
  facebookLeadAdsConnect: string;
  cloudAPIConnect: string;
  existingCloudAPIConnect: string;
  whatsappCatalogConnect: string;
}
export type FacebookPhoneNumberOptionKeyType =
  keyof FacebookPhoneNumberOptionType;
const facebookInitOptionType: FacebookPhoneNumberOptionType = {
  facebookConnect: process.env.REACT_APP_FACEBOOK_CONNECT_ID,
  instagramConnect: process.env.REACT_APP_INSTAGRAM_CONNECT_ID,
  facebookLeadAdsConnect: process.env.REACT_APP_FACEBOOK_LEAD_ADS_CONNECT_ID,
  cloudAPIConnect: process.env.REACT_APP_CLOUD_API_CONNECT_ID,
  existingCloudAPIConnect: process.env.REACT_APP_CLOUD_API_CONNECT_ID,
  whatsappCatalogConnect: process.env.REACT_APP_WHATSAPP_CATALOG_CONNECT_ID,
} as const;
export const useFacebookLogin = (props: {
  updateEvent: (token: string, type: FacebookPhoneNumberOptionKeyType) => void;
}) => {
  const { updateEvent } = props;
  const [showConnectError, setShowConnectError] = useState(false);
  const [loader, setLoader] = useState({
    isLoading: false,
  });
  const onReady = useCallback(() => setLoader(assoc("isLoading", false)), []);
  const [_, isReady] = useFacebook(onReady);

  const handleClick = ({
    type,
  }: {
    type: FacebookPhoneNumberOptionKeyType;
  }) => {
    setLoader({
      isLoading: true,
    });
    setShowConnectError(false);
    return window.FB.login(
      function (response: any) {
        if (response.authResponse?.code) {
          updateEvent(response.authResponse.code, type);
        }
      },
      {
        ...(type === "existingCloudAPIConnect" && {
          extras: {
            featureType: "only_waba_sharing", // Bypass phone number selection
          },
        }),
        config_id: facebookInitOptionType[type],
        response_type: "code",
        override_default_response_type: true,
        auth_type: "reauthorize",
      }
    );
  };

  return {
    handleClick,
    showConnectError,
    loader,
    setLoader,
    isReady,
  };
};
