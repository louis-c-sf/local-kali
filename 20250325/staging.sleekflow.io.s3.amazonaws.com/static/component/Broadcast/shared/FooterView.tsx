import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export function FooterView(props: {
  primaryContent: ReactNode;
  minorContent?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className={"main-content-footer"}>
      <div className="footer-primary">{props.primaryContent}</div>
      {props.minorContent && (
        <div className="footer-minor">{props.minorContent}</div>
      )}
      <div className="footer-background" />
    </div>
  );
}
