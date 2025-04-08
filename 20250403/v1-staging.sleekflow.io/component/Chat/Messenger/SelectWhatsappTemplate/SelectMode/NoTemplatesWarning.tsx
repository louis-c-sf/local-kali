import React from "react";
import gridStyles from "./SelectMode.module.css";
import styles from "./NoTemplatesWarning.module.css";
import iconStyles from "../../../../shared/Icon/Icon.module.css";
import { Trans, useTranslation } from "react-i18next";
import { useAccessRulesGuard } from "../../../../Settings/hooks/useAccessRulesGuard";
import { Button } from "../../../../shared/Button/Button";
import { useHistory } from "react-router-dom";
import { useSelectWhatsappTemplateFlow } from "../useSelectWhatsappTemplateFlow";
import Star from "../../../../../assets/tsx/icons/Star";

export function NoTemplatesWarning(props: { conversationId: string }) {
  const { t } = useTranslation();
  const guard = useAccessRulesGuard();
  const history = useHistory();
  const { editTemplatesUrl } = useSelectWhatsappTemplateFlow(
    props.conversationId
  );

  return (
    <div className={styles.noTemplates}>
      <div className={gridStyles.starWrap}>
        <Star className={gridStyles.star} />
      </div>
      <div className={styles.head}>
        {t("chat.selectWhatsappTemplate.empty.header")}
      </div>
      {guard.canEditWhatsappTemplates() && (
        <>
          <div>
            <Button
              primary
              customSize={"mid"}
              onClick={() => history.push(editTemplatesUrl)}
            >
              {t("chat.selectWhatsappTemplate.empty.manage")}
              <i className={`${iconStyles.icon} ${styles.popup}`} />
            </Button>
          </div>
        </>
      )}
      {!guard.canEditWhatsappTemplates() && (
        <div className={styles.help}>
          <Trans
            i18nKey={"chat.selectWhatsappTemplate.empty.noTemplatesAndRights"}
          >
            You don’t have permission to bookmark templates.
            <br />
            Contact admin to edit this setting.
          </Trans>
        </div>
      )}
    </div>
  );
}
