import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimmer, Image, Loader, Menu } from "semantic-ui-react";
import { Link, matchPath, useHistory, useLocation } from "react-router-dom";
import SearchContactDropDown from "./SearchContactDropdown";
import SleekFlowIcon from "../../assets/images/logo-solid.svg";
import Helmet from "react-helmet";
import {
  getWithExceptions,
  post,
  postWithExceptions,
} from "../../api/apiRequest";
import {
  GET_CONVERSATIONS_SUMMARY,
  POST_COMPANY_NAME,
  POST_OPT_IN,
} from "../../api/apiPath";
import NewMessageSound from "../NewMessageSound";
import UserProfileDropdown from "./UserProfileDropdown";
import MenuLeftLoggedIn from "./Menu/MenuLeftLoggedIn";
import BannerMessage from "../BannerMessage/BannerMessage";
import TimeZoneInfoType from "../../types/TimeZoneInfoType";
import { ExcludedAddOn } from "../Settings/SettingPlanSubscription/SettingPlan/SettingPlan";
import moment from "moment";
import CompanyType, { BillRecordsType } from "../../types/CompanyType";
import {
  isDemoPlan,
  isFreeOrFreemiumPlan,
  isFreePlan,
  isPremiumPlan,
  isProPlan,
  isStandardPlan,
} from "../../types/PlanSelectionType";
import MessageQuota from "../AlertMessage/MessageQuota";
import ContactExceed from "../AlertMessage/ContactExceed";
import RequireUpgradeModal from "../shared/RequireUpgradeModal";
import { useTranslation } from "react-i18next";
import { useMainMenus } from "./Menu/localizable/useMainMenus";
import { matchesStaffId } from "../../types/TeamType";
import { LanguageDropdown } from "./LanguageDropdown";
import { useCompanyStaff } from "../../api/User/useCompanyStaff";
import ChannelConnectionBanner from "../Banner/ChannelConnectionBanner";
import InviteUserAutomationBanner from "../Banner/InviteUserAutomationBanner";
import PaymentFailedBanner from "../Banner/PaymentFailedBanner";
import BalanceWarningBanner from "../Banner/BalanceWarningBanner";
import { useCurrentUserDetail } from "../../api/User/useCurrentUserDetail";
import { InboxNotifier } from "../../component/Header/InboxNotifier";
import { equals, pick } from "ramda";
import { useAccessRulesGuard } from "../Settings/hooks/useAccessRulesGuard";
import useLocationAccessCheck from "../shared/useLocationAccessCheck";
import ChatsSummaryResponseType from "../../types/ChatsSummaryResponseType";
import WhatsappCreditExceed from "../AlertMessage/WhatsappCreditExceed";
import NotificationImg from "../../assets/images/notification-icon.svg";
import WhatsAppSuspend from "../AlertMessage/WhatsAppSuspend";
import InfoImg from "../../assets/images/get-started-info.svg";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import TwilioDailyLimitExceedBanner from "../TwilioDailyLimitExceedBanner";
import HelpCenterWidget from "../HelpCenter/HelpCenter";
import { hotjar } from "react-hotjar";
import useFetchCompany from "../../api/Company/useFetchCompany";
import useCountryCodeCurrencyMapping from "../../config/localizable/useCountryCodeCurrencyMapping";
import useStripeCheckout from "../../api/User/useStripeCheckout";
import { ProgressBar } from "./ProgressBar/ProgressBar";
import BookMeetingBanner from "../Banner/BookMeetingBanner/BookMeetingBanner";
import SettingsIcon from "../../assets/images/icons/cog-default.svg";
import { useTwilioOptInQuery } from "api/Company/useTwilioOptInQuery";
import { useFetchMessageSent } from "../../api/Contacts/useFetchMessageSent";
import { getCountryCode } from "../../api/countryCode";
import { fetchTimeZoneInfo } from "api/Company/fetchTimeZoneInfo";
import InviteUserButton from "./InviteUserButton/InviteUserButton";
import ReviewPlanModal from "component/shared/modal/ReviewPlanModal/ReviewPlanModal";
import useFetchPlanFeatureInfo from "api/Company/useFetchPlanFeatureInfo";
import DeprecationPage from "component/shared/content/DeprecationPage/DeprecationPage";

interface PostLoginProps {
  selectedItem: string;
  dimmed?: boolean;
  locked?: boolean;
  children?: React.ReactNode;
}

export function HavingActiveBillingRecord() {
  return (billRecord: BillRecordsType) =>
    moment().utc().diff(moment(billRecord.periodStart)) > 0 &&
    moment.utc().diff(moment(billRecord.periodEnd)) < 0;
}

export function isDisplayRequestWhatsapp(company: CompanyType | undefined) {
  if (!company) {
    return false;
  }
  return company.whatsAppConfigs && company.whatsAppConfigs.length === 0;
}

export const roleMapping = {
  admin: "Admin",
  teamadmin: "Team Admin",
  staff: "Staff",
} as const;

export function calculateTrialEndLeft(
  trialEndDate: string,
  unitOfTime: "hour" | "day"
) {
  return moment.utc(trialEndDate).diff(moment.utc(), unitOfTime);
}

type beamerConfigType = {
  [key: string]: any;
};
export const LOCATION_STORAGE_KEY = "currentLocation";
export const DEFAULT_TIMEZONE = "GMT Standard Time";

function PostLogin(props: PostLoginProps) {
  const history = useHistory();
  const location = useLocation();
  const [selectedLink, setSelectedLink] = useState("");
  const [countryCode, setCountryCode] = useState<string | undefined>();
  const { loggedInUserDetail, currentPlan, selectedStatus } = useAppSelector(
    pick(["loggedInUserDetail", "currentPlan", "company", "selectedStatus"]),
    equals
  );
  const unreadMessagesCount = useAppSelector(
    (s) => s.inbox.unreadMessagesCount
  );

  const profileSelected = useAppSelector((s) => s.profile.id);
  const isOwner = useAppSelector(
    (s) =>
      s.loggedInUserDetail?.userInfo
        ? s.staffList.findIndex(
            matchesStaffId(s.loggedInUserDetail.userInfo.id)
          ) === 0
        : false,
    equals
  );
  const resellerCompanyLogo = useAppSelector(
    (s) => s.company?.reseller?.logoLink,
    equals
  );

  const userId = useAppSelector((s) => s.user?.id);
  const { currency } = useCountryCodeCurrencyMapping(countryCode);
  const { refreshStripeCheckout, stripeCheckout } = useStripeCheckout();
  const loginDispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const { roleDisplayMenuItem } = useMainMenus();
  const menuItems = roleDisplayMenuItem(loggedInUserDetail);
  const accessRuleGuard = useAccessRulesGuard();
  const isResellerClient = accessRuleGuard.isResellerClient();
  const companyUsage = useFetchMessageSent();
  useLocationAccessCheck();
  const companyStaff = useCompanyStaff();
  const companyUserDetail = useCurrentUserDetail();
  const companyApi = useFetchCompany();
  const isCriticalApiLoaded =
    !!companyApi.company ||
    companyStaff.booted ||
    companyUserDetail.booted ||
    companyUsage.booted;

  let totalNumOfNewMessage = unreadMessagesCount;
  const isInboxPage = matchPath(location.pathname, {
    path: "/:lang/inbox",
    sensitive: false,
    exact: false,
  });
  const isDemoInboxPage = matchPath(location.pathname, {
    path: "/:lang/guide/inbox-demo",
    sensitive: false,
    exact: false,
  });
  const isProfilePage = matchPath(location.pathname, {
    path: "/:lang/profile",
    sensitive: false,
    exact: false,
  });
  useEffect(() => {
    if (!isInboxPage && !isDemoInboxPage) {
      loginDispatch({
        type: "INBOX.FILTER_STATUS_UPDATE",
        selectedStatus: "open",
      });
    }
  }, [profileSelected, location.pathname, selectedStatus]);

  useEffect(() => {
    const selectedMenu = menuItems.find((menuItem) => {
      return (
        menuItem.path &&
        matchPath(location.pathname, {
          path: menuItem.path,
          exact: false,
        })
      );
    });

    if (selectedMenu && !location.pathname.includes("official")) {
      setSelectedLink(selectedMenu.name);
    }
  }, [userId]);
  useFetchPlanFeatureInfo();
  useEffect(() => {
    if (localStorage.getItem(LOCATION_STORAGE_KEY) === undefined) {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
    }
  }, [localStorage.getItem(LOCATION_STORAGE_KEY)]);

  useEffect(() => {
    if (!isInboxPage && !isProfilePage && !isDemoInboxPage) {
      if (profileSelected !== "") {
        loginDispatch({ type: "RESET_PROFILE" });
      }
      loginDispatch({
        type: "INBOX.RESET_FILTER",
        resetStatus: true,
      });
    }
  }, [profileSelected, location.pathname]);

  let beamer_configRef = useRef<beamerConfigType>({
    product_id: "riHhDZAn27585",
  });
  useEffect(() => {
    if (!companyApi.company?.id || countryCode === undefined) {
      return;
    }
    // if company billRecords exist and find the latest billRecord
    // check if the plan is free, if free redirect to plan selection page
    // planSelection page

    if (userId) {
      try {
        hotjar.identify(userId, {
          "Company Name": companyApi.company.companyName,
          "Company ID": companyApi.company.id,
        });
      } catch (e) {
        console.error(e);
      }
    }

    if (companyApi.company?.billRecords.length > 0) {
      const foundBillRecords =
        companyApi.company.billRecords.filter(ExcludedAddOn);
      const currentBillRecord = foundBillRecords.shift();
      if (currentBillRecord) {
        const currentPlan = currentBillRecord.subscriptionPlan;
        loginDispatch({
          type: "UPDATE_CURRENT_PLAN",
          currentPlan: {
            ...currentPlan,
            currency: currentBillRecord.currency ?? currentPlan.currency,
          },
        });
        window.chmln.identify(userId, {
          subscriptionPlan: currentPlan,
        });
      }
    }
    if (!companyApi.company.timeZoneInfo) {
      if (countryCode) {
        fetchTimeZoneInfo(countryCode)
          .then((timeInfo: TimeZoneInfoType) => {
            updateCompanyTimeZone(timeInfo.id);
          })
          .catch((e) => updateCompanyTimeZone(DEFAULT_TIMEZONE));
      } else {
        updateCompanyTimeZone(DEFAULT_TIMEZONE);
      }
    }
  }, [companyApi.company?.id, countryCode]);

  useEffect(() => {
    let isMounted = true;
    getCountryCode()
      .then((res) => {
        if ("countryCode" in res && isMounted) {
          setCountryCode(res.countryCode);
        } else {
          if (isMounted) {
            setCountryCode("");
          }
        }
      })
      .catch((e) => {
        if (isMounted) {
          setCountryCode("");
        }
        console.error("Unable to fetch countryCode");
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const updateCompanyTimeZone = async (updatedTimeZoneInfoId: string) => {
    try {
      await post(POST_COMPANY_NAME, {
        param: {
          timeZoneInfoId: updatedTimeZoneInfoId,
        },
      });
      companyApi.refreshCompany(`tz:${updatedTimeZoneInfoId}`);
    } catch (e) {
      console.error(e);
    }
  };

  const updateSelectedLink = useCallback(
    (value: string) => {
      if (value) {
        setSelectedLink(value);
        loginDispatch({
          type: "HIDE_WALKTHROUGH_TOOLTIP",
        });
      }
    },
    [loginDispatch]
  );

  useEffect(() => {
    if (!currency || !currentPlan.id || !companyApi.company?.id) {
      return;
    }
    if (!stripeCheckout) {
      const selectedCurrency = isFreeOrFreemiumPlan(currentPlan)
        ? currency
        : currentPlan.currency;
      loginDispatch({
        type: "UPDATE_CURRENCY",
        currency: selectedCurrency,
      });
      refreshStripeCheckout(selectedCurrency);
    }
  }, [stripeCheckout, companyApi.company?.id, currency, currentPlan.id]);

  /*
          todo awaits for counters API
         useEffect(() => {
           if (totalNumOfNewMessage > 0 && selectedLink.includes("Inbox")) {
             document.title = t(
               "nav.chat.titleCounted",
               {
                 title: menuTitle(selectedAssignee),
                 n: totalNumOfNewMessage,
               }
             );
           } else {
             document.title = document.title.replace(/\(\d\)/i, "");
           }
         }, [totalNumOfNewMessage]);
       */

  useEffect(() => {
    if (!userId) {
      return;
    }
    getWithExceptions(GET_CONVERSATIONS_SUMMARY, {
      param: { isUnread: "true" },
    })
      .then((result: ChatsSummaryResponseType[]) => {
        loginDispatch({
          type: "INBOX.UPDATE_NOTIFICATIONS_NUMBER",
          summary: result,
        });
      })
      .catch((error) => {
        console.error("GET_CONVERSATIONS_SUMMARY init", error);
      });
  }, [userId]);

  function getLanguageName(lang: string) {
    const mapping = {
      "zh-CN": "CN",
      "zh-HK": "ZH",
      "en-US": "EN",
    };
    return mapping[lang];
  }

  useEffect(() => {
    if (!companyApi.company || countryCode === undefined) {
      return;
    }
    if (
      loggedInUserDetail?.userInfo.id &&
      currentPlan.id &&
      companyApi.company?.id
    ) {
      const user = loggedInUserDetail.userInfo;

      let planType;
      if (isPremiumPlan(currentPlan)) {
        planType = "Premium";
      } else if (isProPlan(currentPlan)) {
        planType = "Pro";
      } else if (isStandardPlan(currentPlan)) {
        planType = "Standard";
      } else if (isFreeOrFreemiumPlan(currentPlan)) {
        planType = "Freemium";
      } else {
        planType = "Enterprise";
      }
      const currentLanguage = getLanguageName(i18n.language);
      let whatsappType = [];
      if (companyApi.company?.wsChatAPIConfigs) {
        if (companyApi.company?.wsChatAPIConfigs.length > 0) {
          whatsappType.push("chatapi" + "+" + currentLanguage);
        }
      }
      if (companyApi.company?.whatsAppConfigs) {
        if (companyApi.company.whatsAppConfigs.length > 0) {
          whatsappType.push("official" + "+" + currentLanguage);
        }
      }
      const filterParams = [
        planType,
        planType + "+" + currentLanguage,
        [countryCode, planType, currentLanguage].join("+"),
        roleMapping[loggedInUserDetail.roleType.toLowerCase()],
        isOwner ? "Owner" : "Invited User",
        i18n.language,
        whatsappType.join(";"),
      ];
      beamer_configRef.current = {
        product_id: "riHhDZAn27585",
        user_firstname: user.firstName,
        user_lastname: user.lastName ?? "",
        user_email: user.email,
        user_id: user.id,
        filter: filterParams.join(";"),
      };
      try {
        hotjar.identify(user.id, {
          Plan: planType,
          "User Name": `${user.firstName} ${user.lastName}`,
          Email: user.email,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [
    loggedInUserDetail?.userInfo?.id,
    currentPlan,
    isOwner,
    companyApi.company,
    countryCode,
  ]);

  const optInQuery = useTwilioOptInQuery();

  useEffect(() => {
    optInQuery.fetch(false).catch(console.error);
  }, [optInQuery.booted]);

  useEffect(() => {
    if (isDemoPlan(currentPlan)) {
      optInQuery
        .fetch(false)
        .then((res) => {
          if (res?.readMoreTemplateMessage) {
            return;
          }
          try {
            postWithExceptions(POST_OPT_IN, {
              param: {
                isOptInOn: true,
                readMoreTemplateId: "account_update_notifications_4",
                readMoreTemplateMessage:
                  "Hello!\nYou received an update from our team.",
              },
            });
          } catch (e) {
            console.error(`Unable to update optin ${e}`);
          }
        })
        .catch((e) => {
          console.debug(`Unable to fetch optin ${e}`);
        });
    }
  }, [currentPlan.id]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    companyApi.refreshCompany(userId);
  }, [
    userId,
    JSON.stringify([companyApi.company?.id, companyApi.company?.billRecords]),
  ]);

  const loadHomePage = useCallback(() => {
    history.push("/guide/get-started");
  }, []);

  const beamerElem = document.querySelector("#beamerSelector");
  if (beamerElem) {
    beamerElem.classList.remove("hidden");
  }

  const isShowUpgradePlan =
    isProPlan(currentPlan) ||
    companyApi.company?.isFreeTrial ||
    isFreeOrFreemiumPlan(currentPlan);

  const showBeamer = useCallback(() => window.Beamer.show(), []);
  const isDeprecatedFeature = process.env.REACT_APP_FEATURE_DEPRECATION?.split(
    ","
  ).find(
    (feature) =>
      location.pathname.indexOf(feature) > -1 &&
      location.pathname.indexOf("/settings/inbox") === -1
  );
  return (
    <>
      <div
        className={`postlogin-container 
        ${props.dimmed ? "solid" : ""}`}
      >
        <ChannelConnectionBanner />

        {selectedLink.trim() && (
          <>
            <Helmet
              defaultTitle={
                selectedLink
                  ? t("nav.common.title", { page: selectedLink })
                  : ""
              }
            />
          </>
        )}
        {userId && (
          <Helmet>
            <meta name="viewport" content="width=1440; initial-scale=0" />
            <script type="text/javascript" defer>
              {`
                //Beamer init
                if (
                  window.location.hostname !== "localhost"
                  || "${process.env.REACT_APP_DISABLE_BEAMER ?? ""}" !== "true"
                ) {
                  if (Beamer !== undefined) {
                    Beamer.update(${JSON.stringify(beamer_configRef.current)})
                  } else {
                    console.error("#Beamer load failed")
                  }
                }
              `}
            </script>
          </Helmet>
        )}

        <NewMessageSound />
        <Menu className="postlogin">
          <Menu.Item header className="logo" key={"logo"}>
            <Image
              src={resellerCompanyLogo ? resellerCompanyLogo : SleekFlowIcon}
              onClick={loadHomePage}
            />
          </Menu.Item>
          <MenuLeftLoggedIn
            newMessagesCounter={totalNumOfNewMessage}
            selectedLink={selectedLink}
            setSelectedLink={updateSelectedLink}
          />
          <Menu.Item
            className={"menuItem menuItem-search"}
            key={"searchContact"}
          >
            <SearchContactDropDown />
          </Menu.Item>
          <Menu.Menu position="right" className="profile">
            <Menu.Item className="info">
              <InviteUserButton
                isShowUpgradePlan={isShowUpgradePlan}
                locked={props.locked}
                isAllowedToInvite={accessRuleGuard.canInviteNewUsers()}
              />
              {isShowUpgradePlan && !isResellerClient && (
                <>
                  <div className="info-section" key={"subscription"}>
                    <Link
                      className={"ui button primary feedback-button"}
                      to="/settings/plansubscription"
                    >
                      {t("account.upgrade.button")}
                    </Link>
                  </div>
                </>
              )}
              <div className="info-section beamerFeatures" key={"beamer"}>
                <div
                  data-beamer-click="false"
                  onClick={showBeamer}
                  className="beamerButton"
                  id="beamerFeatures"
                >
                  <Image src={NotificationImg} />
                </div>
              </div>
              <div className="info-section" key={"generalInfo"}>
                <Link to="/settings/generalinfo" className={"settings-link"}>
                  <Image src={SettingsIcon} />
                </Link>
              </div>
              <div className="info-section" key={"lang"}>
                <LanguageDropdown />
              </div>
              <div className="info-section close" key={"profile"}>
                <UserProfileDropdown />
              </div>
            </Menu.Item>
          </Menu.Menu>
          <ContactExceed />
          <WhatsappCreditExceed />
          <MessageQuota />
          <InboxNotifier />
          {!isDemoPlan(currentPlan) && <WhatsAppSuspend />}
          {/* <SignalRReconnectBannerMessage/> */}
          <BookMeetingBanner />
          <PaymentFailedBanner />
          <TwilioDailyLimitExceedBanner />
          <BalanceWarningBanner />
          <BannerMessage />
          <RequireUpgradeModal />
        </Menu>
        <InviteUserAutomationBanner />
        <ProgressBar />
        {loggedInUserDetail &&
          loggedInUserDetail?.roleType.toLowerCase() !== "staff" &&
          !isResellerClient && (
            <div
              className={
                i18n.language.includes("zh")
                  ? "zh-get-started-button"
                  : "get-started-button"
              }
              onClick={loadHomePage}
            >
              <div>{t("onboarding.get-started-button")}</div>
              <img src={InfoImg} alt="Get Started" />
            </div>
          )}
        {!isResellerClient && <HelpCenterWidget />}
      </div>
      {isCriticalApiLoaded ? (
        isDeprecatedFeature ? (
          <DeprecationPage moduleName={isDeprecatedFeature} />
        ) : (
          props.children
        )
      ) : (
        <Dimmer active inverted>
          <Loader inverted></Loader>
        </Dimmer>
      )}
    </>
  );
}

export default PostLogin;
