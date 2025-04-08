import React, { useState } from "react";
import { Icon, Loader } from "semantic-ui-react";
import { Document, Page, pdfjs } from "react-pdf";
import { useTranslation } from "react-i18next";
import UploadedFileType from "../../../../types/UploadedFileType";
import FilePreviewModal from "./FilePreviewModal";
import DefaultFile from "../DefaultFile";
import styles from "./PdfFile.module.css";

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

export default function PdfFile(props: {
  uploadFile: UploadedFileType;
  messageId?: number;
}) {
  const { uploadFile, messageId } = props;
  const [numPages, setNumPages] = useState(0);
  const fileNameArr = uploadFile.filename.split("/");
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);

  const { t } = useTranslation();

  function onDocumentLoadSuccess(e: { numPages: number }) {
    const { numPages } = e;
    setNumPages(numPages);
  }

  function onPassword() {
    setIsPasswordProtected(true);
    return;
  }

  return isPasswordProtected ? (
    <DefaultFile uploadFile={uploadFile} />
  ) : (
    <FilePreviewModal
      uploadFile={uploadFile}
      messageId={messageId}
      triggerComponent={(src) => {
        return (
          <div>
            <div className={styles.documentWrapper}>
              <div>
                <Document
                  onLoadError={(e) => console.error(`onLoadError ${e}`)}
                  onPassword={onPassword}
                  loading={
                    <div className={styles.placeholder}>
                      <Loader active inverted />
                    </div>
                  }
                  error={
                    <div
                      className={`${styles.placeholder} ${styles.contentCenter}`}
                    >
                      {t("chat.pdf.error.loadingError")}
                    </div>
                  }
                  noData={
                    <div
                      className={`${styles.placeholder} ${styles.contentCenter}`}
                    >
                      {t("chat.pdf.error.noData")}
                    </div>
                  }
                  onLoadSuccess={onDocumentLoadSuccess}
                  file={src}
                >
                  <Page pageNumber={1} width={312} className={styles.page} />
                </Document>
              </div>
            </div>
            <div className={styles.fileName}>
              <Icon name="file alternate outline" />
              {fileNameArr[fileNameArr.length - 1]}
            </div>
            <div className={styles.fileInfo}>
              {numPages} {t("chat.pdf.item.unit", { count: numPages })}
              <span className={styles.dot} />
              {uploadFile.mimeType.split("/")[1].toLocaleUpperCase()}
              <span className={styles.dot} />
              {uploadFile.fileSize &&
                `${(uploadFile.fileSize / 10 ** 6).toFixed(2)} MB`}
            </div>
          </div>
        );
      }}
      contentComponent={(src) => (
        <div>
          <div className={styles.documentPreview}>
            <div>
              <Document
                onLoadSuccess={onDocumentLoadSuccess}
                file={src}
                loading={
                  <div className={styles.previewPlaceholder}>
                    <Loader active inverted />
                  </div>
                }
                error={
                  <div
                    className={`${styles.previewPlaceholder} ${styles.contentCenter}`}
                  >
                    {t("chat.pdf.error.loadingError")}
                  </div>
                }
                noData={
                  <div
                    className={`${styles.previewPlaceholder} ${styles.contentCenter}`}
                  >
                    {t("chat.pdf.error.noData")}
                  </div>
                }
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={600}
                    className={styles.previewPage}
                  />
                ))}
              </Document>
            </div>
          </div>
        </div>
      )}
      proxyComponent={(src) => (
        <div>
          <div className={styles.proxyDocumentWrapper}>
            <div>
              <Document
                onPassword={onPassword}
                onLoadSuccess={onDocumentLoadSuccess}
                file={src}
              >
                <Page pageNumber={1} width={312} className={styles.page} />
              </Document>
            </div>
          </div>
          <div className={styles.fileName}>
            <Icon name="file alternate outline" />
            {fileNameArr[fileNameArr.length - 1]}
          </div>
        </div>
      )}
    />
  );
}
