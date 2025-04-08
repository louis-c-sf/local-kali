import React, { useContext, useState } from "react";
import salesforceStyles from "core/features/Crm/components/Settings/SettingCrm.module.css";
import MapUserTable, {
  StatusType,
} from "core/features/Crm/components/Onboarding/MapUserTable";
import { Button } from "component/shared/Button/Button";
import { useTranslation } from "react-i18next";
import postUpdateUserMapping from "core/features/Crm/API/Onboarding/postUpdateUserMapping";
import OnboardingContext from "core/features/Crm/reducers/OnboardingContext";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import iconStyles from "component/shared/Icon/Icon.module.css";
import onboardingStyles from "../Onboarding/onboarding.module.css";
import { fetchObjects } from "features/Salesforce/API/Objects/fetchObjects";
import {
  FilterGroupType,
  ObjectNormalizedType,
} from "features/Salesforce/API/Objects/contracts";

const filterSelectedUser = [
  {
    filters: [
      {
        field_name: "unified:HubspotIntegratorId",
        operator: "!=",
        value: null,
      },
    ],
  },
  {
    filters: [
      {
        field_name: "unified:SleekflowId",
        operator: "!=",
        value: null,
      },
    ],
  },
];

const crmName = "HubSpot";
const providerType = "hubspot-integrator";

const getCrmUserName = (user: ObjectNormalizedType) => {
  const firstName = user[`${providerType}:firstName`];
  const lastName = user[`${providerType}:lastName`];
  return `${firstName} ${lastName}`;
};

export default function UsersTab() {
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();
  const { mapUsers, onboardingDispatch } = useContext(OnboardingContext);
  const [loading, setLoading] = useState<boolean>(true);
  const [disabled, setDisabled] = useState<boolean>(true);

  const handleNextStep = async () => {
    try {
      const userMappingData = mapUsers
        .filter((user) => user.salesforceUser)
        .reduce(
          (acc, curr) => ({
            ...acc,
            [curr.salesforceUser as string]: curr.id,
          }),
          {}
        );
      await postUpdateUserMapping(userMappingData);
      flash(t("settings.crm.managerUser.saved"));
    } catch (err) {
      console.error(err);
    }
  };

  const getUserMapping = async () => {
    try {
      const objects = await fetchObjects(
        "User",
        filterSelectedUser as FilterGroupType[],
        [],
        200
      );
      onboardingDispatch({
        type: "INIT_SELECTED_USER",
        salesforceUsers: objects.records,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = (status: StatusType) => {
    setDisabled(status === "FAIL");
    if (status === "SUCCESS") {
      getUserMapping();
    }
  };

  return (
    <div className={salesforceStyles.tabContainer}>
      <div className={salesforceStyles.title}>
        {t("settings.crm.managerUser.title", { crm: crmName })}
      </div>
      <div className={salesforceStyles.description}>
        {t("settings.crm.managerUser.description", { crm: crmName })}
      </div>
      <div className={salesforceStyles.mapUserTable}>
        <MapUserTable
          getStatus={handleStatus}
          providerType={providerType}
          crmName={crmName}
          getCrmUserName={getCrmUserName}
          crmField="unified:HubspotIntegratorId"
          crmIcon={
            <i className={`${iconStyles.icon} ${onboardingStyles.logo}`} />
          }
        />
      </div>
      <Button
        primary
        onClick={handleNextStep}
        loading={loading}
        disabled={disabled}
      >
        {t("settings.crm.button.save")}
      </Button>
    </div>
  );
}
