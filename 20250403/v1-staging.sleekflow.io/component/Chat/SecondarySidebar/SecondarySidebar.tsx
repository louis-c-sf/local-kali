import ProfileInfo from "../ProfileInfo/ProfileInfo";
import SearchPanel from "../Sidebar/Search/SearchPanel";
import React, { useCallback, useState } from "react";
import styles from "./SecondarySidebar.module.css";
import AnalyticsWidget from "../AnalyticsWidget/AnalyticsWidget";
import ShopifyWidget from "../ShopifyWidget/ShopifyWidget";
import { ProfilePic } from "../../Profile";
import { useAppSelector } from "../../../AppRootContext";
import { equals } from "ramda";
import { useProfileDisplayName } from "../utils/useProfileDisplayName";
import { channelPhoneNumberImage } from "../ChatGroupItemImage/ChatGroupItemImage";
import { ProfileLabels } from "../ProfileInfo/ProfileLabels";
import { FieldValue } from "../../Contact/NewContact/NewContact";
import MockShopifyWidget from "../../Onboarding/GetStarted/InboxDemo/MockInbox/MockShopifyWidget";
import { useFeaturesGuard } from "../../Settings/hooks/useFeaturesGuard";
import { StripeWidget } from "../../../features/Stripe/usecases/StripeWidget/StripeWidget";
import { useFieldLocales } from "component/Contact/locaizable/useFieldLocales";
import { SalesforceLeadWidget } from "../SalesforceLeadWidget/SalesforceLeadWidget";
import Dynamic365Widget from "../Dynamic365Widget/Dynamic365Widget";
import SalesforcesCreateNewLeadModal from "../SalesforcesCreateNewLeadModal/SalesforcesCreateNewLeadModal.";
import { Button } from "component/shared/Button/Button";
import SalesforceImg from "../SalesforceLeadWidget/assets/salesforce-logo.svg";
import { useTranslation } from "react-i18next";
import { Image } from "semantic-ui-react";
import { SalesforceCreateLeadButton } from "../SalesforceCreateLeadButton/SalesforceCreateLeadButton";
const SecondarySidebar = (props: {
  setFieldValue: Function;
  fieldValue: FieldValue;
  isDemo?: boolean;
}) => {
  const { setFieldValue, isDemo = false } = props;
  const { profileDisplayName: getProfileDisplayName } = useProfileDisplayName();
  const profile = useAppSelector((s) => s.profile, equals);
  const featuresGuard = useFeaturesGuard();
  const { cellValueFactory } = useFieldLocales();
  const name = getProfileDisplayName(profile);
  const phoneNumberImage = channelPhoneNumberImage(name, profile.lastChannel);
  const [isCreateListOpened, setIsCreateListOpened] = useState(false);
  const pic = profile.displayProfilePicture || phoneNumberImage || "";

  const featureGuard = useFeaturesGuard();
  const isSearchPanelActive = useAppSelector(
    (s) => s.inbox.messageSearch.active
  );

  const canShowAnalytics = useCallback(
    () => profile.webClient?.webClientUUID !== undefined,
    [profile.webClient?.webClientUUID]
  );

  const isShopifyProfile = useCallback(
    () => profile.isShopifyProfile,
    [profile.isShopifyProfile]
  );
  const isSalesforceIntegratorConnected = useAppSelector((s) =>
    s.company?.crmHubProviderConfigs?.some(
      (c) => c.provider_name === "salesforce-integrator"
    )
  );

  const isD365IntegratorConnected = useAppSelector((s) =>
    s.company?.crmHubProviderConfigs?.some((c) => c.provider_name === "d365")
  );

  function demoStyle() {
    return isDemo ? styles.demoCover : "";
  }

  function hideableOnSearchStyle() {
    return isSearchPanelActive ? styles.searchActive : "";
  }

  const isDisplayD365HistoryCompany = useAppSelector(
    (s) => s.company?.id === process.env.REACT_APP_D365_SPECIFIED_COMPANY
  );

  const phoneNumber = cellValueFactory("PhoneNumber", profile);

  return (
    <div className={styles.sidebar}>
      <div
        className={`${styles.widget} ${demoStyle()} ${hideableOnSearchStyle()}`}
      >
        <ProfilePic
          id={profile.id}
          name={getProfileDisplayName(profile)}
          address={profile.address}
          pic={pic}
          hasIcon={true}
        />
      </div>
      <div
        className={`${styles.widget} ${demoStyle()} ${hideableOnSearchStyle()}`}
      >
        <ProfileLabels profile={profile} />
      </div>
      {featureGuard.canUseCreateLead() && (
        <SalesforceCreateLeadButton
          setIsCreateListOpened={setIsCreateListOpened}
        />
      )}
      {featuresGuard.canUseStripePayments() && (
        <>
          <div
            className={`${
              styles.widget
            } ${demoStyle()} ${hideableOnSearchStyle()}`}
          >
            <StripeWidget />
          </div>
          <div className={styles.separator} />
        </>
      )}
      {!isDemo && phoneNumber !== "-" && isSalesforceIntegratorConnected && (
        <>
          <div
            className={`${
              styles.widget
            } ${demoStyle()} ${hideableOnSearchStyle()}`}
          >
            <SalesforceLeadWidget phoneNumber={phoneNumber} />
          </div>
          <div className={styles.separator} />
        </>
      )}
      {isShopifyProfile() && (
        <>
          <div
            className={`${
              styles.widget
            } ${demoStyle()} ${hideableOnSearchStyle()}`}
          >
            {isDemo ? <MockShopifyWidget /> : <ShopifyWidget id={profile.id} />}
          </div>
          <div className={styles.separator} />
        </>
      )}
      {!isDemo &&
        phoneNumber !== "-" &&
        isD365IntegratorConnected &&
        isDisplayD365HistoryCompany && (
          <>
            <div className={`${styles.widget} ${hideableOnSearchStyle()}`}>
              <Dynamic365Widget phoneNumber={phoneNumber} />
            </div>
            <div className={styles.separator} />
          </>
        )}
      {canShowAnalytics() && (
        <>
          <div
            className={`${
              styles.widget
            } ${demoStyle()} ${hideableOnSearchStyle()}`}
          >
            <AnalyticsWidget />
          </div>
          <div className={styles.separator} />
        </>
      )}
      <div
        className={`${styles.widget} ${demoStyle()} ${hideableOnSearchStyle()}`}
      >
        <ProfileInfo setFieldValue={setFieldValue} />
      </div>
      {!isDemo && <SearchPanel />}
      {isCreateListOpened && (
        <SalesforcesCreateNewLeadModal setOpen={setIsCreateListOpened} />
      )}
    </div>
  );
};
export default SecondarySidebar;
