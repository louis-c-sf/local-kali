import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./Security.module.css";
import { Checkbox, Modal } from "semantic-ui-react";
import { useAppSelector } from "AppRootContext";
import {
  isAdminRole,
  isStaffRole,
  isTeamAdminRole,
} from "component/Settings/helpers/AccessRulesGuard";
import { Field } from "features/Ecommerce/components/EditStoreContainer/Field";
import { ToggleInput } from "component/shared/input/ToggleInput";
import { Is2FASettingType } from "./SettingAccount";
import { Button } from "component/shared/Button/Button";
import { equals } from "ramda";

export const TwoFactorAuthSetting = (props: {
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
  const { t } = useTranslation();
  const isAdmin = useAppSelector(
    (s) => (s.loggedInUserDetail ? isAdminRole(s.loggedInUserDetail) : false),
    equals
  );
  const isTeamAdmin = useAppSelector(
    (s) =>
      s.loggedInUserDetail ? isTeamAdminRole(s.loggedInUserDetail) : false,
    equals
  );
  const isStaff = useAppSelector(
    (s) => (s.loggedInUserDetail ? isStaffRole(s.loggedInUserDetail) : false),
    equals
  );
  const role = isAdmin
    ? t("system.user.role.admin.name")
    : isTeamAdmin
    ? t("system.user.role.teamAdmin.name")
    : isStaff && t("system.user.role.staff.name");
  const adminRequired = is2FASetting.isCompanyEnable;
  const handleCompanyEnable = () => {
    let roleParam = {
      isRoleEnable: {
        admin: false,
        teamAdmin: false,
        staff: false,
      },
    };
    const updateVal = !is2FASetting.isCompanyEnable;
    if (updateVal) {
      roleParam = {
        isRoleEnable: {
          admin: true,
          teamAdmin: true,
          staff: true,
        },
      };
    }
    set2FASetting({
      ...is2FASetting,
      isCompanyEnable: updateVal,
      ...roleParam,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.switchWrapper}>
        <Field
          key={"status"}
          label={t("account.security.2FA.title")}
          checkbox
          error=""
        >
          <div className={styles.description}>
            {t("account.security.2FA.description")}
          </div>
          {isAdmin ? (
            <>
              <ToggleInput
                on={is2FASetting.isCompanyEnable}
                labelOn={t("account.security.2FA.isEnable.on")}
                labelOff={t("account.security.2FA.isEnable.off")}
                onChange={handleCompanyEnable}
                size={"large"}
              />
              {is2FASetting.isCompanyEnable && (
                <div className={styles.applyToContainer}>
                  <div className={styles.title}>
                    {t("account.security.2FA.apply.title")}
                  </div>
                  <div className={styles.applyToSwitchGroup}>
                    <div className={styles.switchItem}>
                      <Checkbox
                        className={styles.switch}
                        fitted
                        checked={is2FASetting.isRoleEnable.admin}
                        onChange={() =>
                          set2FASetting({
                            ...is2FASetting,
                            isRoleEnable: {
                              ...is2FASetting.isRoleEnable,
                              admin: !is2FASetting.isRoleEnable.admin,
                            },
                          })
                        }
                      />
                      {t("account.security.2FA.apply.admin")}
                    </div>
                    <div className={styles.switchItem}>
                      <Checkbox
                        className={styles.switch}
                        fitted
                        checked={is2FASetting.isRoleEnable.teamAdmin}
                        onChange={() =>
                          set2FASetting({
                            ...is2FASetting,
                            isRoleEnable: {
                              ...is2FASetting.isRoleEnable,
                              teamAdmin: !is2FASetting.isRoleEnable.teamAdmin,
                            },
                          })
                        }
                      />
                      {t("account.security.2FA.apply.teamAdmin")}
                    </div>
                    <div className={styles.switchItem}>
                      <Checkbox
                        className={styles.switch}
                        fitted
                        checked={is2FASetting.isRoleEnable.staff}
                        onChange={() =>
                          set2FASetting({
                            ...is2FASetting,
                            isRoleEnable: {
                              ...is2FASetting.isRoleEnable,
                              staff: !is2FASetting.isRoleEnable.staff,
                            },
                          })
                        }
                      />
                      {t("account.security.2FA.apply.staff")}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              className={`${styles.hint} ${
                adminRequired ? "required" : "noRequired"
              }`}
            >
              {adminRequired
                ? t("account.security.2FA.hint.required")
                : t("account.security.2FA.hint.notRequired")}
            </div>
          )}
        </Field>
      </div>
      {open2FAUpdateModal && (
        <Modal
          closeOnDocumentClick={false}
          closeOnDimmerClick={false}
          className={styles.modal}
          size={"small"}
          open={open2FAUpdateModal}
        >
          <Modal.Header content={t("account.security.2FA.hintModal.title")} />
          <Modal.Content className="content">
            {t("account.security.2FA.hintModal.description")}
          </Modal.Content>
          <Modal.Actions>
            <Button
              primary
              className="btn btn-primary"
              onClick={() => {
                setOpen2FAUpdateModal(false);
              }}
            >
              {t("account.security.2FA.hintModal.button.continue")}
            </Button>
          </Modal.Actions>
        </Modal>
      )}
    </div>
  );
};
