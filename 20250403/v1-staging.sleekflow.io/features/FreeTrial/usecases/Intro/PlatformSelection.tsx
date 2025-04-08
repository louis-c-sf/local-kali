import React from "react";
import { useTranslation } from "react-i18next";
import { Image, Radio } from "semantic-ui-react";
import { FreeTrialHubDict, PlatformOptionType } from "../../modules/types";
import styles from "./PlatformSelection.module.css";
import SalesforceLogo from "../../../Salesforce/assets/salesforce-logo.svg";
import HubspotLogo from "../../../../assets/images/channels/hubspot-logo.svg";

const PlatformSelection = (props: {
  setOption: (option: PlatformOptionType) => void;
  option: PlatformOptionType;
}) => {
  const { t } = useTranslation();
  const { setOption, option } = props;
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {t("channels.freeTrial.intro.section.combinedSelection.title")}
      </div>
      <div className={`${styles.optionContainer} ${styles.salesforceOption}`}>
        <Radio
          className={styles.radio}
          name="platform"
          value={FreeTrialHubDict.salesforce}
          onChange={(_, { value }) => setOption(value as PlatformOptionType)}
          checked={option === FreeTrialHubDict.salesforce}
        />
        <Image src={SalesforceLogo} />
        <span>
          {t(
            "channels.freeTrial.intro.section.combinedSelection.option.salesforce"
          )}
        </span>
      </div>
      <div className={styles.optionContainer}>
        <Radio
          className={styles.radio}
          name="platform"
          value={FreeTrialHubDict.hubspot}
          onChange={(_, { value }) => setOption(value as PlatformOptionType)}
          checked={option === FreeTrialHubDict.hubspot}
        />
        <Image className={styles.hubspotLogo} src={HubspotLogo} />
        <span>
          {t(
            "channels.freeTrial.intro.section.combinedSelection.option.hubspot"
          )}
        </span>
      </div>
    </div>
  );
};
export default PlatformSelection;
