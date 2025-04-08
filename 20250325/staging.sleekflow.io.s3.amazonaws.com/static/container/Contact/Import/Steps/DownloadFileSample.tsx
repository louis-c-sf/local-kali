import React, { useEffect } from "react";
import csvIcon from "../../../../assets/images/icons/csv-file.svg";
import xlsxIcon from "../../../../assets/images/icons/xlsx-file.svg";
import { Image } from "semantic-ui-react";
import { DispatchingStep, DownloadFileSampleState } from "../contracts";
import { downloadAttachmentViaGet } from "../../../../api/apiRequest";
import {
  GET_USER_PROFILE_IMPORT_EXCEL,
  GET_USER_PROFILE_IMPORT_SPREADSHEET,
} from "../../../../api/apiPath";
import { useTranslation } from "react-i18next";
import DownloadUnderlineIcon from "../../../../assets/tsx/icons/DownloadUnderlineIcon";
import RedirectIcon from "../../../../assets/tsx/icons/RedirectIcon";
import styles from "./DownloadFileSample.module.css";

const DownloadButton = (props: { onClick: () => void; disabled: boolean }) => {
  const { t } = useTranslation();
  const { onClick, disabled } = props;

  return (
    <div
      onClick={onClick}
      className={`${styles.buttonArea} ${disabled ? styles.disabled : ""}`}
    >
      <span>{t("form.button.download")}</span>
      <DownloadUnderlineIcon className={styles.downloadIcon} />
    </div>
  );
};

interface DownloadFileSampleProps extends DispatchingStep {
  stepState: DownloadFileSampleState;
}

const DownloadFileSample: React.FC<DownloadFileSampleProps> = (props) => {
  const { importDispatch } = props;
  const { downloadRequested, downloadInProgress, downloadFileMime } =
    props.stepState;
  const { t } = useTranslation();

  useEffect(() => {
    if (!downloadRequested) {
      return;
    }

    downloadAttachmentViaGet(
      downloadFileMime === "csv"
        ? GET_USER_PROFILE_IMPORT_SPREADSHEET
        : GET_USER_PROFILE_IMPORT_EXCEL,
      downloadFileMime === "csv"
        ? "SleekFlow Example Imports - Contacts.csv"
        : "SleekFlow Example Imports - Contacts.xlsx",
      true
    )
      .then((data) => {
        importDispatch({ type: "SAMPLE_DOWNLOAD_COMPLETED" });
      })
      .catch((err) => {
        console.group("SAMPLE_DOWNLOAD_ERROR");
        console.error(err);
        console.groupEnd();
      });

    // after starting the download, disable the downloadRequested flag
    importDispatch({ type: "SAMPLE_DOWNLOAD_STARTED" });
  }, [downloadRequested, downloadAttachmentViaGet]);

  return (
    <>
      <h4 className="ui header">
        {t("profile.list.import.step.download.header")}
      </h4>
      <p>{t("profile.list.import.step.download.text")}</p>
      <div className={styles.container}>
        <div className={styles.box}>
          <Image src={xlsxIcon} />
          <div className={styles.fileName}>
            {t("profile.list.import.step.download.xlsx")}
          </div>
          <DownloadButton
            onClick={() =>
              props.importDispatch({
                type: "SAMPLE_DOWNLOAD_REQUESTED",
                downloadFileMime: "xlsx",
              })
            }
            disabled={downloadInProgress}
          />
        </div>
        <div className={styles.box}>
          <Image src={csvIcon} />
          <div className={styles.fileName}>
            {t("profile.list.import.step.download.csv")}
          </div>
          <DownloadButton
            onClick={() =>
              props.importDispatch({
                type: "SAMPLE_DOWNLOAD_REQUESTED",
                downloadFileMime: "csv",
              })
            }
            disabled={downloadInProgress}
          />
        </div>
      </div>
      <div className={styles.actions}>
        <div>{t("profile.list.import.step.download.button.text")}</div>
        <a
          target="_blank"
          href="https://docs.sleekflow.io/using-the-platform/contacts/imports"
        >
          {t("profile.list.import.step.download.button.help")}
          <RedirectIcon className={styles.redirectIcon} />
        </a>
      </div>
    </>
  );
};

export default DownloadFileSample;
