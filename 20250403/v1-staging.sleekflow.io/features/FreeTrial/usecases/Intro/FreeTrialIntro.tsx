import React, { useState } from "react";
import Helmet from "react-helmet";
import { Button } from "component/shared/Button/Button";
import { BackLink } from "component/shared/nav/BackLink";
import { Trans, useTranslation } from "react-i18next";
import { useHistory, useLocation, useParams } from "react-router";
import { Image } from "semantic-ui-react";
import { FreeTrialHubDict, PlatformOptionType } from "../../modules/types";
import PlatformSelection from "./PlatformSelection";
import styles from "./FreeTrialIntro.module.css";
import TickIcon from "../../../../assets/images/icons/tick-circle-blue.svg";
import { PostLogin } from "component/Header";
import { CurrencyDict, CurrencySymbolDict } from "../../modules/CurrencyDict";
import {
  AdditionalStaffMonthlyPrice,
  MonthlyPrice,
} from "../../modules/FreeTriaMonthlyPriceDict";
import { onClickRedirectToStripe } from "component/Settings/SettingPlanSubscription/SettingPlanUtils";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { useSettingsSubscriptionPlan } from "component/Settings/SettingPlanSubscription/hooks/useSettingsSubscriptionPlan";
import { isPremiumPlan } from "types/PlanSelectionType";

const FreeTrialIntro = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const pageTitle = t("nav.freeTrial.title");
  const { commerceHub } = useParams<{
    commerceHub: string;
  }>();
  const flash = useFlashMessageChannel();
  const {
    currency,
    countryCode,
    setSelectedCurrency,
    currentPlan,
    ...settingSubscriptionPlanRest
  } = useSettingsSubscriptionPlan();
  const stripePublicKey = settingSubscriptionPlanRest.stripePublicKey;
  const upperCurrency = currency.toUpperCase();
  const lowerCurrency = currency.toLowerCase();
  const currentPlanString = isPremiumPlan(currentPlan) ? "premium" : "pro";
  const currencySymbol = CurrencySymbolDict[upperCurrency];
  const [optionType, setOptionType] = useState<PlatformOptionType>(
    FreeTrialHubDict.salesforce
  );
  const [buttonLoading, setButtonLoading] = useState(false);
  const location = useLocation<{
    back: string;
  }>();
  //default set salesforce
  const selectedCRM: PlatformOptionType =
    commerceHub === FreeTrialHubDict.combined
      ? optionType
      : [FreeTrialHubDict.salesforce, FreeTrialHubDict.hubspot].includes(
          commerceHub as FreeTrialHubDict
        )
      ? (commerceHub as PlatformOptionType)
      : FreeTrialHubDict.salesforce;
  const monthlyPrice =
    commerceHub === FreeTrialHubDict.additionalStaff
      ? AdditionalStaffMonthlyPrice[upperCurrency][currentPlanString]
      : MonthlyPrice[upperCurrency][selectedCRM];
  const isUSD = lowerCurrency === CurrencyDict.USD.toLowerCase();
  const planId =
    commerceHub === FreeTrialHubDict.additionalStaff
      ? `sleekflow_v9_agent_${currentPlanString}_monthly${
          isUSD ? "" : "_" + lowerCurrency
        }`
      : `sleekflow_v9_${selectedCRM}_integration${
          isUSD ? "" : "_" + lowerCurrency
        }`;
  const learnMoreLink = {
    [FreeTrialHubDict.salesforce]:
      "https://sleekflow.io/blog/product-updates-salesforce-contacts-sync",
    [FreeTrialHubDict.hubspot]:
      "https://sleekflow.io/blog/hubspot-contact-sync",
    [FreeTrialHubDict.additionalStaff]:
      "https://docs.sleekflow.io/settings/user-management",
  };
  const currentLink =
    learnMoreLink[
      commerceHub === FreeTrialHubDict.combined ? selectedCRM : commerceHub
    ];
  const firstUpperSalesforce =
    FreeTrialHubDict.salesforce.charAt(0).toUpperCase() +
    FreeTrialHubDict.salesforce.slice(1);
  const firstUpperHubspot = t("settings.hubspot.header");
  const infoDict = {
    header: {
      title: {
        [FreeTrialHubDict.salesforce]: t(
          "channels.freeTrial.intro.header.title.single",
          { platform: firstUpperSalesforce }
        ),
        [FreeTrialHubDict.hubspot]: t(
          "channels.freeTrial.intro.header.title.single",
          { platform: firstUpperHubspot }
        ),
        [FreeTrialHubDict.combined]: t(
          "channels.freeTrial.intro.header.title.combined"
        ),
        [FreeTrialHubDict.additionalStaff]: t(
          "channels.freeTrial.intro.header.title.additionalStaff"
        ),
      },
      description: {
        [FreeTrialHubDict.salesforce]: t(
          "channels.freeTrial.intro.header.description.single",
          { platform: firstUpperSalesforce }
        ),
        [FreeTrialHubDict.hubspot]: t(
          "channels.freeTrial.intro.header.description.single",
          { platform: firstUpperHubspot }
        ),
        [FreeTrialHubDict.combined]: t(
          "channels.freeTrial.intro.header.description.combined"
        ),
        [FreeTrialHubDict.additionalStaff]: t(
          "channels.freeTrial.intro.header.description.additionalStaff"
        ),
      },
    },
    article: {
      title: {
        [FreeTrialHubDict.salesforce]: t(
          "channels.freeTrial.intro.article.title.single",
          { platform: firstUpperSalesforce }
        ),
        [FreeTrialHubDict.hubspot]: t(
          "channels.freeTrial.intro.article.title.single",
          { platform: firstUpperHubspot }
        ),
        [FreeTrialHubDict.combined]: t(
          "channels.freeTrial.intro.article.title.combined"
        ),
        [FreeTrialHubDict.additionalStaff]: t(
          "channels.freeTrial.intro.article.title.additionalStaff"
        ),
      },
      subtitle: {
        [FreeTrialHubDict.salesforce]: t(
          "channels.freeTrial.intro.article.subtitle.single",
          { platform: firstUpperSalesforce }
        ),
        [FreeTrialHubDict.hubspot]: t(
          "channels.freeTrial.intro.article.subtitle.single",
          { platform: firstUpperHubspot }
        ),
        [FreeTrialHubDict.combined]: t(
          "channels.freeTrial.intro.article.subtitle.combined"
        ),
        [FreeTrialHubDict.additionalStaff]: t(
          "channels.freeTrial.intro.article.subtitle.additionalStaff"
        ),
      },
      list: {
        [commerceHub]:
          commerceHub === FreeTrialHubDict.additionalStaff
            ? [
                t("channels.freeTrial.intro.article.list.auto"),
                t("channels.freeTrial.intro.article.list.easily"),
                t("channels.freeTrial.intro.article.list.holistic"),
              ]
            : [
                t("channels.freeTrial.intro.article.list.realtime"),
                t("channels.freeTrial.intro.article.list.database"),
                t("channels.freeTrial.intro.article.list.growth"),
              ],
      },
      hint: {
        [FreeTrialHubDict.salesforce]: (
          <Trans
            i18nKey={"channels.freeTrial.intro.article.hint.single"}
            values={{
              platform: firstUpperSalesforce,
            }}
          >
            Check out our video
            <a href={currentLink} target="_blank" rel="noreferrer">
              here
            </a>
            and learn more about ${firstUpperSalesforce} CRM integration.
          </Trans>
        ),
        [FreeTrialHubDict.hubspot]: (
          <Trans
            i18nKey={"channels.freeTrial.intro.article.hint.single"}
            values={{
              platform: firstUpperHubspot,
            }}
          >
            Check out our video
            <a href={currentLink} target="_blank" rel="noreferrer">
              here
            </a>
            and learn more about ${firstUpperHubspot} CRM integration.
          </Trans>
        ),
        [FreeTrialHubDict.combined]: (
          <Trans i18nKey={"channels.freeTrial.intro.article.hint.combined"}>
            Check out our video
            <a href={currentLink} target="_blank" rel="noreferrer">
              here
            </a>
            and earn more about SleekFlow’s CRM integration.
          </Trans>
        ),
        [FreeTrialHubDict.additionalStaff]: (
          <Trans
            i18nKey={"channels.freeTrial.intro.article.hint.additionalStaff"}
          >
            Check out our guide
            <a href={currentLink} target="_blank" rel="noreferrer">
              here
            </a>
            and learn how to leverage SleekFlow’s team management.
          </Trans>
        ),
      },
    },
    section: {
      hint: {
        [FreeTrialHubDict.salesforce]: t(
          "channels.freeTrial.intro.section.hint.single",
          {
            symbol: currencySymbol,
            price: monthlyPrice,
            platform: firstUpperSalesforce,
          }
        ),
        [FreeTrialHubDict.hubspot]: t(
          "channels.freeTrial.intro.section.hint.single",
          {
            symbol: currencySymbol,
            price: monthlyPrice,
            platform: firstUpperHubspot,
          }
        ),
        [FreeTrialHubDict.combined]: t(
          "channels.freeTrial.intro.section.hint.combined",
          {
            symbol: currencySymbol,
            price: monthlyPrice,
          }
        ),
        [FreeTrialHubDict.additionalStaff]: t(
          "channels.freeTrial.intro.section.hint.additionalStaff",
          {
            symbol: currencySymbol,
            price: monthlyPrice,
          }
        ),
      },
    },
  };

  const handleClickTry = () =>
    commerceHub === FreeTrialHubDict.additionalStaff
      ? history.push(
          `/subscriptions/add-ons/additional-staff?planId=${planId}&currency=${upperCurrency}&isFreeTrial=${true}`
        )
      : onClickRedirectToStripe({
          setLoading: setButtonLoading,
          flash,
          planId,
          stripePublicKey,
          t,
          isFreeTrial: true,
          data: {
            info: "freeTrial",
            freeTrialType: selectedCRM,
          },
        });

  return (
    <div className={`post-login ${styles.container}`}>
      <PostLogin selectedItem={""} />
      <Helmet title={pageTitle} />
      <div className={`${styles.main} main`}>
        <div className={styles.back}>
          <BackLink
            onClick={() =>
              commerceHub === FreeTrialHubDict.additionalStaff
                ? history.push("/settings/plansubscription")
                : history.push(location.state.back)
            }
            children={t("nav.backShort")}
            transparent
          />
        </div>
        <div className={styles.header}>
          <div className={"title"}>{infoDict.header.title[commerceHub]}</div>
          <div className={"description"}>
            {infoDict.header.description[commerceHub]}
          </div>
        </div>
        <div className={styles.content}>
          <article>
            <div className={"title"}>{infoDict.article.title[commerceHub]}</div>
            <div className={"subtitle"}>
              {infoDict.article.subtitle[commerceHub]}
            </div>
            <ul>
              {infoDict.article.list[commerceHub].map(
                (li: string, index: number) => (
                  <li key={index}>
                    <Image src={TickIcon} size="tiny" />
                    {li}
                  </li>
                )
              )}
            </ul>
            <div className={"hint"}>{infoDict.article.hint[commerceHub]}</div>
          </article>
          <section>
            {commerceHub === FreeTrialHubDict.combined && (
              <PlatformSelection
                setOption={setOptionType}
                option={optionType}
              />
            )}
            <div className={styles.totalAmount}>
              {t("channels.freeTrial.intro.section.totalAmount")}
            </div>
            <div className={styles.originalPrice}>
              {t("channels.freeTrial.intro.section.originalPrice", {
                symbol: currencySymbol,
                price:
                  commerceHub === FreeTrialHubDict.additionalStaff
                    ? monthlyPrice * 5
                    : monthlyPrice,
              })}
            </div>
            <div className={styles.trialPrice}>
              {currencySymbol}
              {0.0}
            </div>
            <div className={styles.firstMonth}>
              {commerceHub === FreeTrialHubDict.additionalStaff
                ? t("channels.freeTrial.intro.section.first3Months")
                : t("channels.freeTrial.intro.section.firstMonth")}
            </div>
            <div
              className={`${styles.footer} ${
                commerceHub === FreeTrialHubDict.combined ? "revert" : ""
              }`}
            >
              <div className={styles.trialNotice}>
                {infoDict.section.hint[commerceHub]}
              </div>
              <span className={styles.buttonWrapper}>
                <Button
                  primary
                  loading={buttonLoading}
                  onClick={handleClickTry}
                  content={t("channels.freeTrial.intro.section.button")}
                />
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FreeTrialIntro;
