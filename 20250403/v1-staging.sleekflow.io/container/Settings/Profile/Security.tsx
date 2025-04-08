import { useAccessRulesGuard } from "component/Settings/hooks/useAccessRulesGuard";
import React from "react";
import { useParams } from "react-router";
import RevokeTwoFactorAuthSetting from "./RevokeTwoFactorAuthSetting";
import styles from "./Security.module.css";
import { Is2FASettingType } from "./SettingAccount";
import { TwoFactorAuthSetting } from "./TwoFactorAuthSetting";
export const Security = (props: {
  is2FASetting: Is2FASettingType;
  set2FASetting: (is2FASetting: Is2FASettingType) => void;
  open2FAUpdateModal: boolean;
  setOpen2FAUpdateModal: (open2FAUpdateModal: boolean) => void;
}) => {
  const {
    is2FASetting,
    set2FASetting,
    open2FAUpdateModal,
    setOpen2FAUpdateModal,
  } = props;
  const param = useParams<{ staffId: string }>();
  const accessGuard = useAccessRulesGuard();
  return (
    <div className={styles.main}>
      {!param.staffId && accessGuard.canEdit2faSettings() && (
        <TwoFactorAuthSetting
          is2FASetting={is2FASetting}
          set2FASetting={set2FASetting}
          open2FAUpdateModal={open2FAUpdateModal}
          setOpen2FAUpdateModal={setOpen2FAUpdateModal}
        />
      )}
      <RevokeTwoFactorAuthSetting />
    </div>
  );
};
