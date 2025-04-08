import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Loader } from "semantic-ui-react";
import styles from "./PreviewContent.module.css";
import { useTranslation } from "react-i18next";
import { CloudAPIHeaderFormValueType } from "./CloudApi/EditTemplate";
import PlaceholderImg from "component/Chat/Messenger/SelectWhatsappTemplate/assets/placeholderImg.svg";

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

export default function PreviewHeaderSample(props: {
  header: CloudAPIHeaderFormValueType;
}) {
  const { header } = props;
  const { t } = useTranslation();
  const fileUrl =
    header.example?.readUrl?.[0] || header.example?.header_handle?.[0];

  if (!header.example?.header_handle || !fileUrl) {
    return <div className={styles.samplePlaceholder} />;
  }
  if (header.format === "IMAGE") {
    return (
      <div className={styles.sampleImageWrapper}>
        <img className={styles.sampleImage} src={fileUrl} alt="sample" />
      </div>
    );
  }
  if (header.format === "VIDEO") {
    return (
      <div className={styles.sampleImageWrapper}>
        <video className={styles.sampleImage} src={fileUrl} />
      </div>
    );
  }
  if (header.format === "DOCUMENT") {
    return (
      <div className={styles.sampleDocumentWrapper}>
        <div>
          <Document
            onLoadError={(e) => console.error(`onLoadError ${e}`)}
            loading={
              <div className={styles.placeholder}>
                <Loader active inverted />
              </div>
            }
            error={
              <div className={`${styles.placeholder} ${styles.contentCenter}`}>
                {t("chat.pdf.error.loadingError")}
              </div>
            }
            noData={
              <div className={`${styles.placeholder} ${styles.contentCenter}`}>
                {t("chat.pdf.error.noData")}
              </div>
            }
            file={fileUrl}
          >
            <Page pageNumber={1} width={312} className={styles.page} />
          </Document>
        </div>
      </div>
    );
  }

  return <img src={PlaceholderImg} alt="placeholder" />;
}
