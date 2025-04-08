import React, { ReactNode } from "react";
import styles from "./StepView.module.css";
import { useTranslation } from "react-i18next";
import { BackLink } from "../../../shared/nav/BackLink";

export function StepView(props: {
  header: ReactNode;
  fixedContent?: ReactNode;
  scrollableContent?: ReactNode;
  alternativeAction?: () => void;
  alternativeActionText?: string;
  backAction?: () => void;
  subheader?: ReactNode;
  footer?: ReactNode;
}) {
  const {
    alternativeAction,
    alternativeActionText,
    backAction,
    footer,
    header,
    subheader,
    scrollableContent,
    fixedContent,
  } = props;
  const { t } = useTranslation();
  return (
    <div className={styles.component}>
      <div className={styles.nav}>
        {backAction && (
          <div className={styles.back}>
            <BackLink
              onClick={backAction}
              children={t("nav.backShort")}
              transparent
            />
          </div>
        )}
        {alternativeAction && alternativeActionText && (
          <div className={styles.alternative}>
            <div className={styles.text} onClick={alternativeAction}>
              {alternativeActionText}
            </div>
            <span className={styles.icon}>
              <i className={"ui icon arrow-right-action"} />
            </span>
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.fixed}>
          <div className={`${styles.header} ${styles.page}`}>{header}</div>
          {subheader && <div className={styles.subheader}>{subheader}</div>}
          {fixedContent}
        </div>
        {scrollableContent && (
          <div className={styles.scrollable}>{scrollableContent}</div>
        )}
      </div>
      {footer && <div className={styles.content}>{footer}</div>}
    </div>
  );
}
