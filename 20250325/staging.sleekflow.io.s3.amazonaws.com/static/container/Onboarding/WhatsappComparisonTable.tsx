import React from "react";
import styles from "./WhatsappComparisonContainer.module.css";
import { Trans, useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import ApiTypeIcon from "./assets/ApiTypeIcon";
import { Button, Image } from "semantic-ui-react";
import ReliabilityIcon from "./assets/ReliabilityIcon";
import AuthorityIcon from "./assets/AuthorityIcon";
import iconStyles from "../../component/shared/Icon/Icon.module.css";
import PhoneNumberIcon from "./assets/PhoneNumberIcon";
import ApprovalIcon from "./assets/ApprovalIcon";
import RegistrationIcon from "./assets/RegistrationIcon";
import BroadcastIcon from "./assets/BroadcastIcon";
import PricingIcon from "./assets/PricingIcon";
import { useHistory, useParams } from "react-router-dom";
import useRouteConfig, { routeToType } from "../../config/useRouteConfig";
import { useCompanyChannelsWithIntegrations } from "../../component/Chat/hooks/useCompanyChannels";
import { is360DialogConfig } from "../../component/Channel/selectors";
import { useChannelLocales } from "../../component/Channel/localizable/useChannelLocales";
import { toChannelInfoTypes } from "../../types/ChannelInfoType";
import { is360DialogConnected } from "../../component/CreateWhatsappFlow/WhatsappAccessLabel";
import { InfoTooltip } from "component/shared/popup/InfoTooltip";
import { BackLink } from "component/shared/nav/BackLink";
import WhatsappBusinessGif from "../../assets/images/onboarding/whatsApp-business.gif";
import MetaLogo from "../../assets/images/channels/meta_logo.png";
import the360DialogImg from "../../assets/images/onboarding/360-dialog.svg";
import { Link } from "react-router-dom";

const approvalToolTipHoverable = true;

export function WhatsappComparisonTable(props: {}) {
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const { t, i18n } = useTranslation();
  const param = useParams<{ channel: string }>();
  const companyChannelsExist = useCompanyChannelsWithIntegrations();

  const { channelPrototypeList, channelIntegrationList } = useChannelLocales();

  const companyChannelsConfigured = companyChannelsExist.reduce(
    toChannelInfoTypes(channelPrototypeList, channelIntegrationList),
    []
  );

  const deactivated360DialogChannel = companyChannelsConfigured.find((c) => {
    return is360DialogConfig(c.config) && !is360DialogConnected(c.config);
  });

  async function handleOfficialClick() {
    if (deactivated360DialogChannel) {
      return history.push({
        pathname: routeTo(
          "/channels/official/whatsapp/360dialog/activate/help"
        ),
        state: { channel: deactivated360DialogChannel },
      });
    }
    history.push({
      pathname: routeTo("/request-whatsapp"),
      search:
        param.channel?.toLowerCase() === "cloudapi" ? "isCloudAPI=true" : "",
      state: { haveTwilio: false },
    });
  }

  const handleBack = () => {
    history.push(routeTo("/guide/get-started"));
  };

  return (
    <div className={`channel-selection__main main getting-started`}>
      <div className={styles.main}>
        <div className={styles.navContainer}>
          <BackLink onClick={handleBack}>{t("nav.backShort")}</BackLink>
        </div>
        <div className={styles.container}>
          <div className="whatsapp-comparison-table">
            <div>
              {getTableRows(
                t,
                handleOfficialClick,
                param.channel === "cloudAPI",
                i18n.language,
                routeTo
              ).map((row) => (
                <div className="table-row">
                  <div className="table-header">{row.headerName ?? null}</div>
                  {/* {row.chatapi(history)} */}
                  {row.official(history, routeTo)}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.previewContainer}>
            <div className={styles.previewTitle}>
              {t("onboarding.whatsappComparison.previewTitle")}
            </div>
            <div className={styles.gifContainer}>
              <img src={WhatsappBusinessGif} alt="gif" />
            </div>
            <div className="talk-to-sales">
              <div className={styles.salesBox}>
                <Trans i18nKey={"onboarding.whatsappComparison.talkToSales"}>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://wa.me/85264522442"
                  >
                    Talk to our sales team
                  </a>
                  for a quick consultation.
                </Trans>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTableRows(
  t: TFunction,
  handleOfficialClick: () => void,
  isCloudAPI: boolean,
  language: string,
  routeTo: routeToType
) {
  return [
    {
      header: "poweredBy",
      headerName: (
        <div className="header-title">
          <ApiTypeIcon />
          {t("onboarding.whatsappComparison.apiType")}
        </div>
      ),
      official: (history: any, routeTo: any) => {
        return (
          <div className="official-column grey-border-bottom">
            <div className="whatsapp-api-column">
              <div className="whatsapp-sub-header">
                {isCloudAPI ? (
                  <>
                    <div className={styles.subHeader}>
                      {t("onboarding.whatsappComparison.title")}
                      <Image src={MetaLogo} />
                    </div>
                    <div className={styles.feeTitle}>
                      {t("onboarding.whatsappComparison.fee.perNumber")}
                    </div>
                    <div className={styles.feeWrapper}>
                      <div className={styles.fee}>
                        {t("onboarding.whatsappComparison.fee.price")}
                      </div>
                      <div className={styles.perMonth}>
                        <span>/</span>
                        {t("onboarding.whatsappComparison.fee.month")}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {t("onboarding.whatsappComparison.official")}
                    <div className="poweredByWrapper">
                      <div className="helper-text small-icon icon-left-margin powerby-row">
                        {t("onboarding.whatsappComparison.poweredBy", {
                          name: "360 Dialog",
                        })}
                      </div>
                      <div className="image">
                        <img src={the360DialogImg} alt="360Dialog" />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <Button
                className="ui button primary feedback-button button-small"
                onClick={handleOfficialClick}
              >
                {t("onboarding.whatsappComparison.connect")}
              </Button>
              <div className={`${styles.linkContainer} ${styles.noMargin}`}>
                <Link
                  className="highlight-text clickable"
                  to={routeTo("/channels/official/whatsapp/360dialog/activate")}
                >
                  {t(
                    "onboarding.whatsappComparison.alreadyHave360DialogAccount"
                  )}
                </Link>
                <span className={styles.border} />
                <div
                  className="highlight-text clickable"
                  onClick={() =>
                    history.push({
                      pathname: routeTo("/request-whatsapp"),
                      state: { haveTwilio: true },
                    })
                  }
                >
                  {t("onboarding.whatsappComparison.alreadyTwilio")}
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "reliability",
      headerName: (
        <div className="header-title">
          <ReliabilityIcon />
          {t("onboarding.whatsappComparison.reliability")}
        </div>
      ),
      official: (history: any, routeTo: any) => (
        <div className="official-column grey-background">
          <div>
            <div className="normal-text">
              {t("onboarding.whatsappComparison.officialReliability")}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "authority",
      headerName: (
        <div className="header-title">
          <AuthorityIcon />
          {t("onboarding.whatsappComparison.authority")}
        </div>
      ),
      official: () => (
        <div className="official-column">
          <div>
            <div className="normal-text small-icon icon-right-margin">
              <i className={`${iconStyles.icon} ${styles.tick}`} />
              {t("onboarding.whatsappComparison.officialAuthority")}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "phoneNumber",
      headerName: (
        <div className="header-title">
          <PhoneNumberIcon />
          {t("onboarding.whatsappComparison.phoneNumber")}
        </div>
      ),
      official: () => (
        <div className="official-column grey-background">
          <div>
            <div className="normal-text">
              <Trans i18nKey="onboarding.whatsappComparison.officialPhoneNumber">
                Come with new number OR migrate from other solution provider
                (e.g. Twilio, Messagebird)
              </Trans>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "approval",
      headerName: (
        <div className="header-title">
          <ApprovalIcon />
          {t("onboarding.whatsappComparison.approval")}
        </div>
      ),
      official: () => (
        <div className={`official-column ${styles.approval}`}>
          <div>
            <div className="normal-text">
              {t("onboarding.whatsappComparison.officialApproval.description")}
              <InfoTooltip
                placement={"right"}
                hoverable={approvalToolTipHoverable}
                children={
                  <div className={styles.tooltip}>
                    <section className="description">
                      {t(
                        "onboarding.whatsappComparison.officialApproval.tooltip.description"
                      )}
                    </section>
                    <ul>
                      <li>
                        {t(
                          "onboarding.whatsappComparison.officialApproval.tooltip.standard.phoneNumbers"
                        )}
                      </li>
                      <li>
                        {t(
                          "onboarding.whatsappComparison.officialApproval.tooltip.standard.greenTick"
                        )}
                      </li>
                      <li>
                        {t(
                          "onboarding.whatsappComparison.officialApproval.tooltip.standard.conversations"
                        )}
                      </li>
                    </ul>
                    <span className="moreInfo">
                      <Trans
                        i18nKey={
                          "onboarding.whatsappComparison.officialApproval.tooltip.moreInfo"
                        }
                      >
                        For more information, please check
                        <a
                          href="https://docs.sleekflow.io/messaging-channels/360dialog-whatsapp/apply-via-360dialog/whatsapp-business-account-tiers-360dialog"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          here
                        </a>
                      </Trans>
                    </span>
                  </div>
                }
                trigger={
                  <span className={`${iconStyles.icon} ${styles.infoIcon}`} />
                }
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "messageLimit",
      headerName: (
        <div className="header-title">
          <span className={`${iconStyles.icon} ${styles.messageIcon}`} />
          {t("onboarding.whatsappComparison.messageLimit")}
        </div>
      ),
      official: (history: any, routeTo: any) => (
        <div className="official-column grey-background">
          <div className={styles.messageLimitGrid}>
            <div className={styles.userTitle}>
              {t(
                "onboarding.whatsappComparison.officialMessageLimit.user.title"
              )}
            </div>
            <div className={styles.businessTitle}>
              {t(
                "onboarding.whatsappComparison.officialMessageLimit.business.title"
              )}
            </div>
            <div className={styles.userDescription}>
              {t(
                "onboarding.whatsappComparison.officialMessageLimit.user.description"
              )}
            </div>
            <div className={styles.businessDescription}>
              {t(
                "onboarding.whatsappComparison.officialMessageLimit.business.description"
              )}
            </div>
            <div className={styles.messageLimitHint}>
              {t("onboarding.whatsappComparison.officialMessageLimit.hint")}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "templateRegistration",
      headerName: (
        <div className="header-title">
          <RegistrationIcon />
          {t("onboarding.whatsappComparison.templateRegistration")}
        </div>
      ),
      official: (history: any, routeTo: any) => (
        <div className="official-column">
          <div>
            <div className="normal-text">
              {t("onboarding.whatsappComparison.officialTemplate")}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "broadcast",
      headerName: (
        <div className="header-title">
          <BroadcastIcon />
          {t("onboarding.whatsappComparison.broadcast")}
        </div>
      ),
      official: () => (
        <div className="official-column grey-background">
          <div className="row-flex">
            <Trans i18nKey="onboarding.whatsappComparison.officialBroadcast1">
              Up to 100,000 messages per day
              <br />
              with registered template message
            </Trans>
          </div>
        </div>
      ),
    },
    {
      header: "pricing",
      headerName: (
        <div className="header-title">
          <PricingIcon />
          {t("onboarding.whatsappComparison.pricing")}
        </div>
      ),
      official: (history: any, routeTo: any) => (
        <div className="official-column">
          <Trans i18nKey="onboarding.whatsappComparison.officialPricing1">
            Starting from 1 June 2023, there will be new pricing for WhatsApp
            messaging. View the new pricing updates
            <a
              className="highlight-text"
              href="https://docs.sleekflow.io/messaging-channels/whatsapp-bsp/new-whatsapp-pricing-2023#b.-conversation-charges-will-be-based-on-the-template-category"
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </a>
            . Calculate your WhatsApp Business costs with
            <a
              className="highlight-text"
              href={`https://sleekflow.io/whatsapp-pricing-calculator`}
              target="_blank"
              rel="noopener noreferrer"
            >
              our pricing calculator
            </a>
            .
          </Trans>
        </div>
      ),
    },
  ];
}
