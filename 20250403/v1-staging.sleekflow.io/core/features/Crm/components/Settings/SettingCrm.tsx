import React, { ReactNode, useEffect, useReducer, useState } from "react";
import settingStyles from "container/Settings/Setting.module.css";
import styles from "./SettingCrm.module.css";
import { Header, Tab } from "semantic-ui-react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import onboardingReducer, {
  defaultState,
} from "core/features/Crm/reducers/onboardingReducer";
import OnboardingContext from "core/features/Crm/reducers/OnboardingContext";

const TabNames = ["users", "syncData"] as const;
export type TabEnum = typeof TabNames[number];

export default function SettingCrm(props: {
  usersTab: () => ReactNode;
  syncDataTab: () => ReactNode;
  header: string;
}) {
  const { usersTab, syncDataTab, header } = props;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabEnum>("users");
  const location = useLocation<{
    backToTab?: TabEnum;
  }>();
  const [onboardingState, onboardingDispatch] = useReducer(
    onboardingReducer,
    defaultState()
  );
  const mainPanes = [
    {
      menuItem: t("settings.crm.managerUser.label"),
      render: usersTab,
    },
    {
      menuItem: t("settings.crm.syncData.label"),
      render: syncDataTab,
    },
  ];

  const handleTabChange = (event: React.MouseEvent, data: Object): void => {
    const index = data["activeIndex"];
    setActiveTab(TabNames[index]);
  };

  useEffect(() => {
    if (location.state?.backToTab) {
      setActiveTab(location.state.backToTab);
    }
  }, []);

  return (
    <div className={settingStyles.content}>
      <div className={`${settingStyles.container} ${styles.container}`}>
        <div className={`${settingStyles.header}`}>
          <Header as="h4" content={header} />
        </div>
        <OnboardingContext.Provider
          value={{
            ...onboardingState,
            onboardingDispatch,
          }}
        >
          <Tab
            menu={{
              secondary: true,
              pointing: true,
              className: styles.tabs,
            }}
            panes={mainPanes}
            activeIndex={TabNames.findIndex((item) => item === activeTab)}
            onTabChange={handleTabChange}
          />
        </OnboardingContext.Provider>
      </div>
    </div>
  );
}
