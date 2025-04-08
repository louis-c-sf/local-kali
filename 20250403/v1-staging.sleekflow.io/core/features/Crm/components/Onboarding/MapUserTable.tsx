import React, { ReactNode, useContext, useEffect, useState } from "react";
import onboardingStyles from "./CrmOnboarding.module.css";
import { useTranslation } from "react-i18next";
import MappingTable from "../MappingTable/MappingTable";
import iconStyles from "component/shared/Icon/Icon.module.css";
import {
  Dimmer,
  Dropdown,
  DropdownProps,
  Image,
  Loader,
} from "semantic-ui-react";
import styles from "./MapUserTable.module.css";
import { URL } from "api/apiRequest";
import Avatar from "react-avatar";
import OnboardingContext from "core/features/Crm/reducers/OnboardingContext";
import postInitProviderTypesSync from "../../API/Onboarding/postInitProviderTypesSync";
import postTriggerProviderSyncObjects from "../../API/Onboarding/postTriggerProviderSyncObjects";
import postGetSyncObjectsProgress from "../../API/Onboarding/postGetSyncObjectsProgress";
import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";
import { useTeams } from "container/Settings/useTeams";
import { fetchObjects } from "features/Salesforce/API/Objects/fetchObjects";
import {
  FilterGroupType,
  ObjectNormalizedType,
} from "features/Salesforce/API/Objects/contracts";
import { Button } from "component/shared/Button/Button";
import { MapUserType, ProviderType } from "../../API/Onboarding/contracts";
import { getSyncMode } from "core/features/Crm/components/Onboarding/AutoSyncSettings";
import useFetchCompany from "api/Company/useFetchCompany";

export type StatusType = "LOADING" | "SUCCESS" | "FAIL";

const getFilterAllUser = (field: string) => [
  {
    filters: [
      {
        field_name: field,
        operator: "!=",
        value: null,
      },
    ],
  },
];

export default function MapUserTable(props: {
  getStatus: (status: StatusType) => void;
  providerType: ProviderType;
  crmName: string;
  crmIcon: ReactNode;
  crmField: string;
  getCrmUserName: (user: ObjectNormalizedType) => string;
}) {
  const {
    getStatus,
    providerType,
    crmName,
    crmIcon,
    getCrmUserName,
    crmField,
  } = props;
  const { t } = useTranslation();
  const { onboardingDispatch, mapUsers } = useContext(OnboardingContext);
  const [loading, setLoading] = useState<boolean>(true);
  const staffList = useAppSelector((s) => s.staffList, equals);
  const crmConfig = useAppSelector(
    (s) =>
      s.company?.crmHubProviderConfigs?.find(
        (config) => config.provider_name === providerType
      ),
    equals
  );
  const { refreshTeams, booted, teams } = useTeams();
  const [salesForceUsers, setSalesForceUsers] = useState<
    ObjectNormalizedType[]
  >([]);
  const tryCount = React.useRef(0);
  const [visibleRetry, setVisibleRetry] = useState<boolean>(false);
  const { refreshCompany } = useFetchCompany();

  const getProgress = (id: string) => {
    return new Promise((resolve) => {
      try {
        const polling = setInterval(() => {
          postGetSyncObjectsProgress(providerType, id)
            .then((response) => {
              const isCompleted = response.status === "Completed";
              if (isCompleted) {
                clearInterval(polling);
                resolve(isCompleted);
              }
            })
            .catch((err) => {
              console.error(err);
              tryCount.current++;
              if (tryCount.current >= 10) {
                clearInterval(polling);
              }
            });
        }, 1000);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const getAllRecords = async (
    acc: ObjectNormalizedType[],
    offsetToken?: string
  ): Promise<ObjectNormalizedType[] | undefined> => {
    try {
      const objects = await fetchObjects(
        "User",
        getFilterAllUser(crmField) as FilterGroupType[],
        [],
        200,
        offsetToken
      );
      const data = [...acc, ...objects.records];
      if (objects.continuation_token) {
        const users =
          (await getAllRecords(acc, objects.continuation_token)) || [];
        return [...data, ...users];
      } else {
        return data;
      }
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const initSync = async () => {
    try {
      const isCompleteConfig = crmConfig
        ? Object.keys(crmConfig.entity_type_name_to_sync_config_dict).length
        : false;
      if (!isCompleteConfig) {
        const condition =
          crmConfig?.entity_type_name_to_sync_config_dict?.Contact?.filters;
        const syncMode = getSyncMode(crmConfig);
        await postInitProviderTypesSync(
          providerType,
          condition || [],
          syncMode
        );
        refreshCompany();
      }
      const providerData = await postTriggerProviderSyncObjects(
        providerType,
        "User"
      );
      await getProgress(providerData.providerStateId);
      const userOpts = await getAllRecords([]);
      setSalesForceUsers(userOpts || []);
    } catch (error) {
      console.error(error);
      setVisibleRetry(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    initSync();
  };

  useEffect(() => {
    refreshTeams();
    if (crmConfig) {
      initSync();
    }
  }, [crmConfig]);

  useEffect(() => {
    if (booted) {
      onboardingDispatch({
        type: "INIT_MAP_USER",
        users: staffList,
        teams: teams,
      });
    }
  }, [staffList, booted, teams, onboardingDispatch]);

  useEffect(() => {
    if (loading) {
      getStatus("LOADING");
    } else {
      getStatus(visibleRetry ? "FAIL" : "SUCCESS");
    }
  }, [loading, visibleRetry]);

  const handleChangeDropdown =
    (index: number) => (e: React.SyntheticEvent, data: DropdownProps) => {
      onboardingDispatch({
        type: "UPDATE_MAP_USER",
        index,
        salesforceUser: data.value as string,
      });
    };

  return (
    <Dimmer.Dimmable className={`${onboardingStyles.loading}`}>
      {loading ? (
        <Dimmer active={true} inverted>
          <Loader active />
        </Dimmer>
      ) : visibleRetry ? (
        <div className={styles.retryWrapper}>
          <div className={styles.retryDesc}>
            {t("onboarding.crm.stepMapUsers.errorMag")}
          </div>
          <Button primary onClick={handleRetry}>
            {t("onboarding.crm.action.retry")}
          </Button>
        </div>
      ) : (
        <MappingTable
          labelFrom={
            <div className={onboardingStyles.tableLabel}>
              <span className={onboardingStyles.labelText}>
                {t("onboarding.crm.stepMapUsers.sleekflowUser")}
              </span>
              <i
                className={`${iconStyles.icon} ${onboardingStyles.sleekflowLogo}`}
              />
            </div>
          }
          labelTo={
            <div className={onboardingStyles.tableLabel}>
              <span className={onboardingStyles.labelText}>
                {t("onboarding.crm.stepMapUsers.crmUser", { crm: crmName })}
              </span>
              <div className={onboardingStyles.logo}>{crmIcon}</div>
            </div>
          }
          data={mapUsers}
          renderFieldFrom={(row: MapUserType) => (
            <div className={styles.user}>
              <div className={styles.imageWrapper}>
                {row.image ? (
                  <Image
                    className={styles.image}
                    circular
                    src={`${URL}/${row.image}`}
                  />
                ) : (
                  <Avatar name={row.name} size="32px" round maxInitials={2} />
                )}
              </div>
              <div>
                <div className={styles.name}>{row.name}</div>
                <div className={styles.team}>{row.team}</div>
              </div>
            </div>
          )}
          renderFieldTo={(row: MapUserType, index: number) => (
            <Dropdown
              selectOnBlur={false}
              search
              noResultsMessage={t("onboarding.crm.error.notFound")}
              placeholder={t("onboarding.crm.placeholder.crmField", {
                crm: crmName,
              })}
              options={salesForceUsers.map((user) => {
                const { id } = user;
                return {
                  id,
                  value: id,
                  text: getCrmUserName(user),
                  disabled: !!mapUsers.find(
                    (rule) => rule.salesforceUser === id
                  ),
                };
              })}
              fluid
              selection
              value={row.salesforceUser}
              onChange={handleChangeDropdown(index)}
            />
          )}
        />
      )}
    </Dimmer.Dimmable>
  );
}
