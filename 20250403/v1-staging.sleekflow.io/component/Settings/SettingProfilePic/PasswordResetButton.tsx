import React, { useState, useEffect } from "react";
import { Button } from "../../shared/Button/Button";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../AppRootContext";
import { equals } from "ramda";
import { Form, Modal } from "semantic-ui-react";
import styles from "./PasswordResetButton.module.css";
import { CloseButton } from "component/shared/CloseButton";
import { submitSendResetPassword } from "api/User/submitSendResetPassword";
import { submitGetResetPassword } from "api/User/submitGetResetPassword";
import { useLocation } from "react-router";
import { CopyField } from "component/Channel/CopyField";
import { useAccessRulesGuard } from "../hooks/useAccessRulesGuard";

const PasswordResetButton = () => {
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const userId = useAppSelector((state) => state.user.id, equals);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const staffList = useAppSelector((state) => state.staffList, equals);
  const locate = useLocation();
  const pathArray = locate.pathname.split("/");
  const staffId = pathArray[pathArray.length - 1];
  const [resetLink, setResetLink] = useState("");
  const accessRuleGuard = useAccessRulesGuard();
  const id =
    locate.pathname.includes("settings/generalinfo") ||
    staffId === "usermanagement"
      ? userId
      : staffId;
  const currentStaff = staffList.find((staff) => staff.userInfo.id === id);

  const openModal = () => {
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
  };

  const sendResetLink = async () => {
    try {
      setIsLoading(true);
      await submitSendResetPassword(email);
      flash(t("account.form.resetPassword.emailSent"));
    } catch (e) {
      flash(t("account.form.resetPassword.emailFailure"));
    } finally {
      setIsLoading(false);
      closeModal();
    }
  };

  useEffect(() => {
    const getLink = async () => {
      const url = await submitGetResetPassword(id);
      setResetLink(url.url);
    };
    if (open) {
      getLink();
    }
  }, [open, id]);

  useEffect(() => {
    setEmail(currentStaff?.userInfo.email || "");
    setUserName(currentStaff?.userInfo.userName || "");
  }, [currentStaff]);

  return (
    <div className={styles.resetPasswordAction}>
      <Button
        loading={isLoading}
        onClick={
          accessRuleGuard.canGenerateResetPasswordLink() &&
          !locate.pathname.includes("settings/generalinfo")
            ? openModal
            : sendResetLink
        }
      >
        {t("account.form.resetPassword.button.submit")}
      </Button>
      {open && (
        <Modal open onClose={closeModal} size="small">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              {t("account.form.resetPassword.header", { name: userName })}
            </div>
            <div className={styles.closeButton}>
              <CloseButton onClick={closeModal} />
            </div>
            <div className={styles.modalBody}>
              <div className={styles.description}>
                {t("account.form.resetPassword.description")}
              </div>
              <Form>
                <CopyField
                  text={resetLink}
                  label={t("account.form.resetPassword.resetPasswordLink")}
                  long={true}
                  onCopy={() => {
                    flash(t("account.form.resetPassword.copySuccess"));
                  }}
                />
                <div className={styles.or}>{t("or")}</div>
                <Button
                  onClick={sendResetLink}
                  blue
                  disabled={isLoading}
                  loading={isLoading}
                  fluid
                >
                  {t("account.form.resetPassword.button.sendEmail")}
                </Button>
              </Form>
            </div>
            <div className={styles.modalAction}>
              <Button onClick={closeModal} primary>
                {t("account.form.resetPassword.button.done")}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PasswordResetButton;
