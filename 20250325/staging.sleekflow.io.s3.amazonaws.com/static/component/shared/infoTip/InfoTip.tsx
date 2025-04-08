import React from "react";
import { useTranslation } from "react-i18next";
import style from "./InfoTip.module.css";

export default function InfoTip(props: {
  children: React.ReactElement;
  className?: string;
  noHorizontalOutset?: boolean;
}) {
  const { t } = useTranslation();

  const { children, className, noHorizontalOutset } = props;

  return (
    <div
      className={`${style.stripMessage} 
        ${className}
        ${noHorizontalOutset ? style.noHorizontalOutset : ""}`}
    >
      <div className={style.header}>{t("tips")}</div>
      <div className={style.content}>{children}</div>
    </div>
  );
}
