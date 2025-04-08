import { useAppSelector } from "AppRootContext";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { Button } from "component/shared/Button/Button";
import { ModalForm } from "component/shared/ModalForm";
import { createSalesforceLeadCreation } from "features/Salesforce/API/Leads/createSalesforceLeadCreation";
import { equals } from "ramda";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SalesforcesCreateNewLeadModal.module.css";
function SalesforcesCreateNewLeadModal({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [companyId, profileId] = useAppSelector(
    (s) => [s.company?.id, s.profile.id],
    equals
  );
  const flash = useFlashMessageChannel();
  const salesmanFieldId = useAppSelector((s) => {
    const salesmanFields = s.company?.customUserProfileFields.filter((s) =>
      ["SalesmanOnDutyId", "SalesmanId", "SupervisorId"].includes(s.fieldName)
    );
    return (
      salesmanFields?.find((f) =>
        s.profile.customFields.some(
          (s) => s.companyDefinedFieldId === f.id && s.value
        )
      )?.fieldName ?? "SalesmanId"
    );
  }, equals);
  async function createNewLead() {
    if (!companyId || !profileId) {
      return;
    }
    setIsLoading(true);
    try {
      await createSalesforceLeadCreation({
        sleekflow_company_id: companyId,
        userprofile_id: profileId,
        salesman_id_field_name: salesmanFieldId,
      });
      flash(t("flash.createLead.success"));
    } catch (e) {
      console.error(`createNewLead error ${e}`);
    } finally {
      setIsLoading(false);
    }
  }
  const actions = () => (
    <div className={styles.buttons}>
      <Button
        blue
        className={styles.cancelButton}
        onClick={isLoading ? undefined : () => setOpen(false)}
        content={t("form.button.cancel")}
        disabled={isLoading}
      />
      <Button
        primary
        loading={isLoading}
        disabled={isLoading}
        onClick={isLoading ? undefined : createNewLead}
        content={t("form.button.confirm")}
      />
    </div>
  );

  return (
    <ModalForm
      centeredContent
      horizontalActions
      actions={actions}
      isLoading={isLoading}
      title={t("createLead.title")}
      cancelText={t("form.button.cancel")}
      onCancel={() => setOpen(false)}
      onConfirm={isLoading ? () => {} : createNewLead}
      confirmText={t("form.button.confirm")}
      opened
    >
      <div>{t("createLead.content")}</div>
    </ModalForm>
  );
}
export default SalesforcesCreateNewLeadModal;
