import React, { useEffect, useState } from "react";
import Helmet from "react-helmet";
import { Trans, useTranslation } from "react-i18next";
import ReminderGuide, {
  WarningContentType,
} from "../component/Channel/ReminderGuide";
import ChatImg from "../assets/images/official-guide/chat.svg";
import GreenTickImg from "../assets/images/official-guide/greenTick.svg";
import PhoneImg from "../assets/images/official-guide/phone.svg";
import PriceTagImg from "../assets/images/official-guide/price-tag.svg";
import { useHistory } from "react-router";
import useRouteConfig from "../config/useRouteConfig";
import { Checkbox } from "semantic-ui-react";
import { PostLogin } from "../component/Header";

function OfficalWhatsappGuideContainer() {
  const history = useHistory();
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();
  const pageTitle = t("nav.menu.officalWhatsappGuide");
  const [checked, isChecked] = useState<boolean>(false);
  const warningContent: WarningContentType[] = [
    {
      title: t("guideContainer.official.greenTick.title"),
      content: (
        <Trans i18nKey="guideContainer.official.greenTick.content">
          The Official Account provides the best speed & relability. The
          <br />
          verified green tick will make your brand instantly recognisable
          <br />
          to your customers and reduce the risk of account suspension.
        </Trans>
      ),
      img: GreenTickImg,
    },
    {
      title: t("guideContainer.official.phone.title"),
      content: (
        <Trans i18nKey="guideContainer.official.phone.content">
          You are required to buy a new local number through SleekFlow
          <br />
          starting from US$1. You can also seamlessly migrate all your
          <br />
          existing contacts and conversations to this Official Account.
        </Trans>
      ),
      img: PhoneImg,
    },
    {
      title: t("guideContainer.official.priceTag.title"),
      content: (
        <Trans i18nKey="guideContainer.official.priceTag.content">
          Use pre-approved templates to send outbound messages to
          <br />
          customers who have not talked to you in the past 24 hours.
          <br />
          There is a
          <a
            className="link"
            href="https://sleekflow.io/blog/whatsapp-business-price/"
            target="_blank"
          >
            small charge
          </a>
          for each successful message sent.
        </Trans>
      ),
      img: PriceTagImg,
    },
    {
      title: t("guideContainer.official.chat.title"),
      content: (
        <Trans i18nKey={"guideContainer.official.chat.content"}>
          There will be a US$0.005 charge per message for all inbound
          <br />
          and outbound messages within the 24-hour conversation
          <br />
          window regardless of message destination.
        </Trans>
      ),
      img: ChatImg,
    },
  ];

  function goToNext() {
    history.push(routeTo("/channels/official/whatsapp/video"));
  }

  const agreement = (
    <div className="field">
      <Checkbox
        key="checkbox_whatsapp_agreement"
        value=""
        label={t("guideContainer.official.agreement")}
        onClick={() => isChecked(!checked)}
      />
    </div>
  );
  return (
    <div className="post-login whatsapp-guide-container">
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      <PostLogin selectedItem={""} />
      <ReminderGuide
        header={t("guideContainer.official.header")}
        warningContent={warningContent}
        agreement={agreement}
        button={
          <div
            className={`ui button primary ${checked ? "" : "disabled"}`}
            onClick={goToNext}
          >
            {t("guideContainer.button.next")}
          </div>
        }
        link={<></>}
      />
    </div>
  );
}

export default OfficalWhatsappGuideContainer;
