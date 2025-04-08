import React, { ReactNode } from "react";
import { PostLogin } from "../../component/Header";
import Helmet from "react-helmet";
import { useTranslation } from "react-i18next";
import styles from "./LoggedInLayoutBasic.module.css";

export function LoggedInLayoutBasic(props: {
  selectedItem: string;
  pageTitle: string;
  extraMainClass?: string;
  children: ReactNode;
  scrollableY?: boolean;
}) {
  const { t } = useTranslation();

  const extraClasses = [];
  if (props.scrollableY) {
    extraClasses.push(styles.scrollableY);
  }

  return (
    <div className={`post-login`}>
      <Helmet title={t("nav.common.title", { page: props.pageTitle })} />
      <PostLogin selectedItem={props.selectedItem}>
        <div
          className={`main ${styles.root} ${
            props.extraMainClass ?? ""
          } ${extraClasses.join(" ")}`}
        >
          {props.children}
        </div>
      </PostLogin>
    </div>
  );
}
