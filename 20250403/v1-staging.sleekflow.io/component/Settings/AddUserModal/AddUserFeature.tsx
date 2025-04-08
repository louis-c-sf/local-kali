import React from "react";
import AddUserModal from "../AddUserModal";
import { useAppSelector } from "../../../AppRootContext";
import { Trans, useTranslation } from "react-i18next";
import { useFeaturesGuard } from "../hooks/useFeaturesGuard";
import { useAccessRulesGuard } from "../hooks/useAccessRulesGuard";
import ModalConfirm from "../../shared/ModalConfirm";
import { equals } from "ramda";
import UserExceedLimitModal from "./UserExceedLimitModal";

function AccessPopup(props: { close: () => void }) {
  const { t } = useTranslation();

  return (
    <ModalConfirm
      title={t("settings.user.modal.noAccess.title")}
      opened={true}
      onConfirm={props.close}
      confirmText={t("settings.user.modal.noAccess.confirm")}
      className={"simple"}
    >
      <Trans i18nKey={"settings.user.modal.noAccess.content"}>
        <p>
          Your current user role does not allow you to invite user to this
          account.
        </p>
        <p>Please ask your admin to invite user.</p>
      </Trans>
    </ModalConfirm>
  );
}

const ResellerMaxStaffExceeded: React.FC<{ close: () => void }> = ({
  close,
}) => {
  const resellerEmail = useAppSelector(
    (s) => s.company?.reseller?.contactEmail,
    equals
  );
  const { t } = useTranslation();
  return (
    <ModalConfirm
      className={"simple"}
      opened={true}
      onCancel={close}
      cancelText={t("settings.user.modal.resellerMaxStaffExceeded.dismiss")}
      onConfirm={() => (window.location.href = `mailto:${resellerEmail}`)}
      title={t("settings.user.modal.resellerMaxStaffExceeded.title")}
      confirmText={t("contactYourReseller")}
    >
      {t("settings.user.modal.resellerMaxStaffExceeded.description")}
    </ModalConfirm>
  );
};

export function AddUserFeature(props: {
  hide: () => void;
  refreshStaff: () => Promise<any>;
}) {
  const { hide, refreshStaff } = props;
  const accountIsPaid = useAppSelector((s) =>
    Boolean(s.company && s.company.billRecords.length > 0)
  );

  const featuresGuard = useFeaturesGuard();
  const accessRulesGuard = useAccessRulesGuard();
  const isInviteForbidden = !accessRulesGuard.canInviteNewUsers();
  const isShowAddUser = accountIsPaid && featuresGuard.canInviteMoreUsers();
  const maximumStaffExceeded =
    accountIsPaid && !featuresGuard.canInviteMoreUsers();
  const isResellerMaxStaffExceeded =
    accountIsPaid &&
    !featuresGuard.canInviteMoreUsers() &&
    accessRulesGuard.isResellerClient();
  const refreshAndHide = () => {
    refreshStaff();
    hide();
  };

  if (isShowAddUser) {
    return <AddUserModal onHidden={refreshAndHide} showModal={isShowAddUser} />;
  }

  if (isResellerMaxStaffExceeded) {
    return <ResellerMaxStaffExceeded close={refreshAndHide} />;
  }
  if (maximumStaffExceeded) {
    return <UserExceedLimitModal close={refreshAndHide} />;
  }

  if (isInviteForbidden) {
    return <AccessPopup close={refreshAndHide} />;
  }

  return null;
}
