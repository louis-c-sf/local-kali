import React from "react";
import styles from "./QrCodeActivated.module.css";
import { Loader, Modal } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { CopyField } from "../../component/Channel/CopyField";
import DownloadIcon from "../../assets/tsx/icons/DownloadIcon";
import { Button } from "../../component/shared/Button/Button";
import { useHistory } from "react-router";
import useRouteConfig from "../../config/useRouteConfig";
import { htmlEscape } from "../../lib/utility/htmlEscape";

export function QrCodeActivated(props: {
  url: string;
  qrCodeUrl?: string;
  qrCodeContents?: string;
  vendor: string;
  onRest?: () => void;
}) {
  const { t } = useTranslation();
  const { qrCodeContents, url, qrCodeUrl, vendor, onRest } = props;
  const history = useHistory();
  const { routeTo } = useRouteConfig();

  const imageUrl = qrCodeContents
    ? `data:image/png;base64,${qrCodeContents}`
    : qrCodeUrl;

  return (
    <Modal
      open
      className={`create-form ${styles.modal}`}
      closeOnDocumentClick={false}
      closeOnDimmerClick={false}
    >
      <Modal.Header>{t("onboarding.qrActivated.header")}</Modal.Header>
      <Modal.Content className={styles.content}>
        <p>{t("onboarding.qrActivated.body", { vendor })}</p>
        <div className={styles.copyInput}>
          <CopyField text={url} label={""} long={true} masked />
        </div>
        <div className={styles.divider}>
          <div className={styles.label}>or</div>
        </div>
        <div className={styles.code}>
          {imageUrl ? <img src={imageUrl} /> : <Loader active inline />}
          <a
            className={styles.download}
            href={htmlEscape(imageUrl ?? "")}
            download={`${vendor}_qrcode.png`}
          >
            {t("onboarding.qrActivated.download")}
            <DownloadIcon className={""} />
          </a>
        </div>
      </Modal.Content>
      <Modal.Actions>
        <Button
          content={t("form.createWhatsapp.complete.action.goBack")}
          onClick={() => {
            if (onRest) {
              onRest();
            }
            history.push(routeTo("/channels"));
          }}
          primary
        />
      </Modal.Actions>
    </Modal>
  );
}
