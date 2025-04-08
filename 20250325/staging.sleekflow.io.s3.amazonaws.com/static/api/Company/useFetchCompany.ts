import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { useCallback, useEffect } from "react";
import { equals } from "ramda";

export default function useFetchCompany() {
  const company = useAppSelector((s) => s.company, equals);
  const userId = useAppSelector((s) => s.user.id);
  const loginDispatch = useAppDispatch();

  useEffect(() => {
    if (company) {
      window.chmln.identify(userId, {
        companyId: company.id,
        connectedFacebook: Boolean(
          company.facebookConfigs && company.facebookConfigs.length > 0
        ),
        connectedInstagram: Boolean(
          company.instagramConfigs && company.instagramConfigs.length > 0
        ),
        connectedWechat: Boolean(
          company.weChatConfig && company.weChatConfig.webChatId
        ),
        connectedLine: Boolean(
          company.lineConfigs && company.lineConfigs.length > 0
        ),
        connectedSms: Boolean(
          company.smsConfigs && company.smsConfigs.length > 0
        ),
      });
    }
  }, [company]);

  const refreshCompany = useCallback(
    (hash?: string) => loginDispatch({ type: "COMPANY.API.LOAD", hash }),
    [loginDispatch]
  );

  return {
    refreshCompany,
    company,
  };
}
