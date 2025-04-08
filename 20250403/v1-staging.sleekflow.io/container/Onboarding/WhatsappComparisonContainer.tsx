import React, { useEffect } from "react";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import { PostLogin } from "../../component/Header";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { useFlashMessageChannel } from "../../component/BannerMessage/flashBannerMessage";
import { WhatsappComparisonTable } from "./WhatsappComparisonTable";

function WhatsappComparisonContainer() {
  const { t } = useTranslation();
  const pageTitle = t("onboarding.getStarted.pageTitle");
  const isPlanUpdated = useAppSelector((s) => s.isPlanUpdated);
  const loginDispatch = useAppDispatch();

  const flash = useFlashMessageChannel();

  useEffect(() => {
    if (isPlanUpdated) {
      flash(t("flash.channels.subscription.updated"));
      loginDispatch({ type: "UPDATED_PLAN", isPlanUpdated: false });
    }
  }, [isPlanUpdated]);

  return (
    <div className="post-login channel-selection">
      <PostLogin selectedItem={""} />
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      <WhatsappComparisonTable />
    </div>
  );
}

export default WhatsappComparisonContainer;
