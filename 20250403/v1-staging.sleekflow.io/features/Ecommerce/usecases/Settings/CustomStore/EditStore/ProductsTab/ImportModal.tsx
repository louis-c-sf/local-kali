import React, { useState } from "react";
import styles from "./ImportModal.module.css";
import { Modal, Checkbox } from "semantic-ui-react";
import { useTranslation, Trans } from "react-i18next";
import { UploadDropzoneInput } from "component/Form/UploadDropzoneInput";
import { useDropzone } from "react-dropzone";
import { useImportProductsFromCsv } from "./ImportModal/useImportProductsFromCsv";
import { fetchProductImportTemplate } from "api/CommerceHub/fetchProductImportTemplate";
import { Icon } from "component/shared/Icon/Icon";
import FileIcon from "assets/images/document-stack-outline.svg";
import { Button } from "component/shared/Button/Button";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { FieldError } from "component/shared/form/FieldError";

export function ImportModal(props: {
  close: () => void;
  storeId: string;
  onFinish: () => void;
}) {
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();
  const importFlow = useImportProductsFromCsv({
    storeId: props.storeId,
    onFinish: props.onFinish,
  });
  const [error, setError] = useState<string>();

  const dropzone = useDropzone({
    accept: "text/csv",
    multiple: false,
    noClick: true,
    onDropAccepted(files) {
      importFlow.setFile(files[0] ?? null);
      setError(undefined);
    },
    onDropRejected<T extends File>(
      files: T[],
      ev:
        | React.DragEvent<HTMLElement>
        | React.ChangeEvent<HTMLInputElement>
        | DragEvent
        | Event
    ) {
      setError(t("settings.commerce.importCsv.error.common"));
    },
  });

  async function downloadTemplate() {
    try {
      return await fetchProductImportTemplate();
    } catch (e) {
      console.error(e);
    }
  }

  const executeImport = async () => {
    try {
      await importFlow.execute();
      props.close();
    } catch (e) {
      flash(t("system.error.unknown"));
      console.error(e);
    }
  };

  return (
    <Modal open onClose={props.close}>
      <Modal.Header className={styles.header}>
        {t("settings.commerce.importCsv.header")}{" "}
        <span className={styles.close} onClick={props.close}>
          <Icon type={"close"} />
        </span>
      </Modal.Header>
      <Modal.Content>
        <p>
          <Trans i18nKey={"settings.commerce.importCsv.hint"}>
            <span onClick={downloadTemplate} className={styles.link}>
              Download our sample CSV
            </span>{" "}
            to ensure your file is in the correct format
          </Trans>
        </p>
        <div className={styles.upload}>
          <UploadDropzoneInput
            getRootProps={dropzone.getRootProps}
            getInputProps={dropzone.getInputProps}
            isDragActive={dropzone.isDragActive}
            mimeTypes={"*.csv"}
            isEmpty={importFlow.file === null}
          >
            <div className={styles.description}>
              {importFlow.file === null ? (
                <div className={styles.empty}>
                  <Trans i18nKey={"settings.commerce.importCsv.description"}>
                    Drag and drop or <a onClick={dropzone.open}>upload</a>{" "}
                    product information in .csv file
                  </Trans>
                </div>
              ) : (
                <>
                  <div className={styles.filled}>
                    <div className={styles.icon}>
                      <img src={FileIcon} />
                    </div>
                    <div className={styles.name}>{importFlow.file.name}</div>
                  </div>
                  <span
                    onClick={() => importFlow.setFile(null)}
                    className={styles.resetFile}
                  >
                    <Icon type={"close"} />
                  </span>
                </>
              )}
            </div>
          </UploadDropzoneInput>
        </div>
        <div className={styles.confirm}>
          {/*<div className={styles.input}>
            <Checkbox
              label={t("settings.commerce.importCsv.applyUpdates")}
              checked={importFlow.strategy === "update"}
              onChange={importFlow.toggleStrategy}
              disabled={importFlow.loading}
            />
          </div>*/}
          <div className={styles.status}>
            {error && <FieldError text={error} standalone />}
          </div>
        </div>
        <div className={styles.footer}>
          <a
            href="https://docs.sleekflow.io/using-the-platform/commerce/custom-catalog"
            target={"_blank"}
            rel={"noreferrer noopener"}
            className={styles.link}
          >
            {t("settings.commerce.importCsv.learnMore")}{" "}
            <Icon type={"extLinkBlue"} />
          </a>
          <Button
            primary
            content={t("settings.commerce.importCsv.import")}
            onClick={executeImport}
            disabled={importFlow.loading || importFlow.file === null}
            loading={importFlow.loading}
          />
        </div>
      </Modal.Content>
    </Modal>
  );
}
