import React, { useState } from "react";
import { fetchMFASetting } from "api/User/fetchMFASetting";
import styles from "./RevokeTwoFactorAuthSetting.module.css";
import { useParams } from "react-router";
import { useAppSelector } from "AppRootContext";
import { useTranslation } from "react-i18next";
import { equals } from "ramda";
import { isAdminRole } from "component/Settings/helpers/AccessRulesGuard";
import { Button } from "component/shared/Button/Button";
import { Modal } from "semantic-ui-react";
import { submitMFARevoke } from "api/User/submitMFARevoke";
import { staffDisplayName } from "component/Chat/utils/staffDisplayName";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import StatusAlert from "component/shared/StatusAlert";
import { useFetchMFASettings } from "api/User/useFetchMFASetting";
function RevokeTwoFactorAuthSetting() {
  const param = useParams<{ staffId: string }>();
  const user = useAppSelector((s) => s.loggedInUserDetail, equals);
  const isAdmin = useAppSelector(
    (s) => (s.loggedInUserDetail ? isAdminRole(s.loggedInUserDetail) : false),
    equals
  );
  const selectedStaff = useAppSelector(
    (s) => s.staffList.find((staff) => staff.userInfo.id === param.staffId),
    equals
  );
  const [openModal, setOpenModal] = useState(false);
  const id = selectedStaff?.userInfo?.id ?? user?.userInfo.id ?? "";
  const { loading, userMFA, refresh } = useFetchMFASettings({
    staffId: id,
    isAdmin,
  });
  const { t } = useTranslation();
  if (loading) {
    return null;
  }
  return (
    <>
      <div className={styles.container}>
        {!isAdmin ? (
          <NonAdminWarning />
        ) : (
          <>
            {userMFA ? (
              <>
                <div className={styles.success}>
                  {t("account.security.2FA.mfa.enabled")}
                </div>
                <div className={styles.action}>
                  <Button blue onClick={() => setOpenModal(true)}>
                    {t("account.security.2FA.mfa.button.revoke")}
                  </Button>
                </div>
              </>
            ) : (
              <div className={styles.warning}>
                {t("account.security.2FA.mfa.disabled")}
              </div>
            )}
          </>
        )}
      </div>
      {openModal && (
        <RevokeMFAModal
          userId={id}
          userMFA={userMFA}
          userName={
            selectedStaff?.userInfo?.userName ?? user?.userInfo?.userName
          }
          displayName={staffDisplayName(selectedStaff ?? user)}
          openModal={openModal}
          refresh={refresh}
          setOpenModal={setOpenModal}
        />
      )}
    </>
  );
}
function NonAdminWarning() {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.title}>{t("account.security.2FA.title")}</div>
      <div className={styles.descriptioin}>
        {t("account.security.2FA.mfa.description")}
      </div>
      <div className={styles.success}>
        {t("account.security.2FA.mfa.adminRequired")}
      </div>
      <StatusAlert className={styles.infoAlert} type="info">
        {t("account.security.2FA.mfa.revokeTips")}
      </StatusAlert>
    </>
  );
}
function RevokeMFAModal(props: {
  setOpenModal: (open: boolean) => void;
  openModal: boolean;
  displayName: string;
  userMFA: string;
  userId: string;
  refresh: () => void;
  userName?: string;
}) {
  const flash = useFlashMessageChannel();
  const [loading, setLoading] = useState(false);
  async function revokeMFA() {
    try {
      setLoading(true);
      await submitMFARevoke({ userMFA: props.userMFA, id: props.userId });
      await props.refresh();
      flash(
        t("account.security.2FA.mfa.revokeModal.flash.revoked", {
          userName: props.userName ?? props.displayName,
        })
      );
    } catch (e) {
      console.error(`Error exception ${e}`);
    } finally {
      setLoading(false);
      props.setOpenModal(false);
    }
  }
  const { t } = useTranslation();
  return (
    <Modal
      closeOnDocumentClick={false}
      closeOnDimmerClick={false}
      className={styles.modal}
      size={"tiny"}
      centered
      open
    >
      <Modal.Header content={t("account.security.2FA.mfa.revokeModal.title")} />
      <Modal.Content className="content">
        {t("account.security.2FA.mfa.revokeModal.content", {
          displayName: props.displayName,
        })}
      </Modal.Content>
      <Modal.Actions>
        <Button
          blue
          disabled={loading}
          onClick={() => props.setOpenModal(false)}
        >
          {t("form.button.cancel")}
        </Button>
        <Button
          primary
          loading={loading}
          disabled={loading}
          onClick={loading ? undefined : revokeMFA}
        >
          {t("form.button.confirm")}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
export default RevokeTwoFactorAuthSetting;
